type Intensity = 'low' | 'medium' | 'high'
type Rating = 'positive' | 'neutral' | 'negative'
type IdType = 'crev'

interface ProofFrom {
    idType: 'crev';
    id: string;
    url: string;
}
interface ProofMetadata {
    version: number;
    date: number;
    from: ProofFrom;
    signature: string;
    raw: string;
}
interface User {
    idType: IdType;
    id: string;
    url: string;
}
interface PackageDetails {
    source: string;
    name: string;
    version: string;
    revision?: string;
    digest: string;
}
interface ReviewDetails {
    thoroughness: Intensity;
    understanding: Intensity;
    rating: Rating;
}

export interface TrustProof extends ProofMetadata {
    ids: [User];
    trust: Intensity;
}
export interface PackageReviewProof extends ProofMetadata {
    package: PackageDetails;
    review: ReviewDetails;
    comment?: string;
}
