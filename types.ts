
export interface ProductIdea {
  id: string;
  user_id?: string;
  rawIdea: string;
  title: string;
  problem: string;
  solution: string;
  features: string[];
  createdAt: number;
  status: 'draft' | 'analyzed' | 'improved' | 'srs_ready';
  analysis?: SimilarityAnalysis;
  improvements?: ImprovementSuggestion[];
  acceptedImprovements?: string[];
  srs?: string;
}

export interface SimilarProduct {
  name: string;
  url: string;
  similarityScore: number;
  problem: string;
  solution: string;
  mainFeatures: string[];
  relationToIdea: string;
}

export interface SimilarityAnalysis {
  competitors: SimilarProduct[];
  summary: string;
  differentiationFactor: string;
}

export interface ImprovementSuggestion {
  id: string;
  type: 'feature' | 'strategic' | 'technical';
  title: string;
  description: string;
  sourceInspiration?: string;
}

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  CREATE = 'CREATE',
  VIEW_IDEA = 'VIEW_IDEA',
  LOGIN = 'LOGIN'
}
