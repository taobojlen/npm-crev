/**
 * An in-memory graph that holds proof data
 * and thus our web of trust.
 *
 * This database is created in memory every time crev is run.
 */

import { promises as fs } from "fs";
import * as path from "path";
import { DirectedGraph } from "graphology";
import { allSimpleEdgePaths } from "graphology-simple-path";

import { proofsCachePath } from "./paths";
import { getProofsFromRepo } from "./repos";
import {
  User,
  PackageDetails,
  PackageReviewProof,
  TrustProof,
  Verification,
  VerificationStatus,
} from "./types";
import { DefaultMap } from "./util";
import { EdgeKeyGeneratorFunction } from "graphology-types";
import { getCurrentCrevId } from "./id";
import { toBase64 } from "./crypto/util";

export default class ProofDatabase {
  private selfId: string | undefined;

  // Package digest => package details
  private packages: Map<string, PackageDetails>;
  // Package digest => proofs of that package
  private packageReviewsByPackage: DefaultMap<string, PackageReviewProof[]>;
  private trustGraph: DirectedGraph<User, TrustProof>;

  constructor() {
    this.packages = new Map<string, PackageDetails>();
    this.packageReviewsByPackage = new DefaultMap(() => []);
    this.trustGraph = new DirectedGraph<User, TrustProof>({ edgeKeyGenerator: this.getEdgeKey });
  }

  /**
   * Load proof data from disk and construct the graph
   */
  public async initialize(): Promise<void> {
    // TODO: handle updated reviews (i.e compare dates)
    // TODO: count number of new proofs when re-initializing
    // TODO: verify proofs

    const currentId = await getCurrentCrevId();
    if (!currentId) {
      throw new Error("Couldn't find a crev ID. Run `crev id:create` to create one.");
    }
    this.selfId = toBase64(currentId.publicKey);

    for (const repo of await fs.readdir(proofsCachePath)) {
      const repoPath = path.resolve(proofsCachePath, repo);
      // Load package reviews
      const packageReviews = await getProofsFromRepo(repoPath, "package review");
      packageReviews.forEach((review) => {
        this.addPackage(review.package);
        this.addUser(review.from);
        this.packageReviewsByPackage.get(review.package.digest).push(review);
      });

      // Load trust relationships
      const trustProofs = await getProofsFromRepo(repoPath, "trust");
      trustProofs.forEach((trustProof) => {
        this.addUser(trustProof.from);
        trustProof.ids.forEach((targetUser) => {
          this.addUser(targetUser);
          this.addEdge(trustProof.from.id, targetUser.id, trustProof);
        });
      });
    }
  }

  /**
   * Returns the verification status of the package with the given digest.
   */
  public verify(digest: string): Verification {
    // Get reviews of the package
    const reviews = this.packageReviewsByPackage.get(digest);
    const targetUserIds = reviews.map((review) => review.from.id);

    // Get trust paths from current user to reviewers
    const paths = targetUserIds.flatMap((targetId) =>
      allSimpleEdgePaths(this.trustGraph, this.selfId!, targetId)
    );

    // Find verification status
    // First, filter reviews of the package to the ones we trust
    const trustedReviewers = paths.map((trustPath) => {
      const finalEdgeKey = trustPath[-1] as string;
      return finalEdgeKey.split("->")[-1];
    });
    const trustedReviews = reviews.filter((review) => trustedReviewers.includes(review.from.id));

    // If any trusted reviews are negative, then that takes precedence.
    // >1 positive reviews means it passes.
    // Otherwise, no status.
    let status: VerificationStatus = "none";
    if (trustedReviews.some((review) => review.review.rating === "negative")) {
      status = "fail";
    } else if (
      trustedReviews.some((review) => ["positive", "strong"].includes(review.review.rating))
    ) {
      status = "pass";
    }

    return {
      status,
      reviewCount: trustedReviews.length,
    };
  }

  public listUsers(): User[] {
    const ids = [];
    for (const entry of this.trustGraph.nodeEntries()) {
      ids.push(entry[1]);
    }
    return ids;
  }

  private addUser(user: User): void {
    const { id } = user;
    if (!this.trustGraph.hasNode(id)) {
      this.trustGraph.addNode(id, user);
    }
  }

  /**
   * Adds an edge (a trust relationship) to the graph.
   * If an edge already exists between the two users, uses the most recent one.
   */
  private addEdge(sourceId: string, targetId: string, trustProof: TrustProof): void {
    if (this.trustGraph.hasEdge(sourceId, targetId)) {
      const existingEdge = this.trustGraph.getEdgeAttributes(sourceId, targetId) as TrustProof;
      if (trustProof.date < existingEdge.date) {
        this.trustGraph.dropEdge(sourceId, targetId);
        this.trustGraph.addEdge(sourceId, targetId, trustProof);
      }
    } else {
      this.trustGraph.addEdge(sourceId, targetId, trustProof);
    }
  }

  private addPackage(packageDetails: PackageDetails): void {
    const { digest } = packageDetails;
    if (!this.packages.has(digest)) {
      this.packages.set(digest, packageDetails);
    }
  }

  private getEdgeKey: EdgeKeyGeneratorFunction = ({ source, target }) => {
    return `${source}->${target}`;
  };
}
