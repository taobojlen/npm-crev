/**
 * An in-memory graph.
 * Nodes are identified by a string.
 */

type Properties = Record<string, unknown>;

class Node {
  private id;
  private inEdges: string[];
  private outEdges: string[];
  private properties: Properties;

  constructor(id: string, properties: Properties) {
    this.id = id;
    this.inEdges = [];
    this.outEdges = [];
    this.properties = properties;
  }

  public getId() {
    return this.id;
  }

  public addOutEdge(edgeId: string) {
    this.outEdges.push(edgeId);
  }

  public addInEdge(edgeId: string) {
    this.inEdges.push(edgeId);
  }
}

class Edge {
  private id;
  private fromId: string;
  private toId: string;
  private properties: Properties;

  constructor(id: string, from: string, to: string, properties: Properties) {
    this.id = id;
    this.fromId = from;
    this.toId = to;
    this.properties = properties;
  }
}

export default class Graph {
  private nodesById: Map<string, Node>;
  private edgesById: Map<string, Edge>;
  constructor() {
    this.nodesById = new Map<string, Node>();
    this.edgesById = new Map<string, Edge>();
  }

  public addNode(
    id: string,
    properties: Properties,
    conflictResolver: (prevNode: Node, newNode: Node) => Node
  ): void {
    const newNode = new Node(id, properties);
    if (this.nodesById.has(id)) {
      // Update node using conflict resolution function
      const prevNode = this.nodesById.get(id)!;
      const resolvedNode = conflictResolver(prevNode, newNode);
      this.nodesById.set(id, resolvedNode);
    } else {
      this.nodesById.set(id, newNode);
    }
  }

  public addEdge(fromId: string, toId: string, properties: Properties): void {
    const fromNode = this.nodesById.get(fromId);
    const toNode = this.nodesById.get(toId);
    if (!fromNode || !toNode) {
      throw new Error("Cannot add edge between nonexistent nodes");
    }

    const edgeId = this.getEdgeId(fromNode, toNode);
    const edge = new Edge(edgeId, fromId, toId, properties);
    this.edgesById.set(edgeId, edge);

    fromNode.addOutEdge(edgeId);
    fromNode.addInEdge(edgeId);
  }

  private getEdgeId(fromNode: Node, toNode: Node): string {
    return `${fromNode.getId()}-${toNode.getId()}`;
  }
}
