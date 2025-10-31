export interface TutorialFrontmatter {
  title: string;
  description: string;
  section: string;
  stepNumber: number;
  totalSteps: number;
  lastUpdated: Date;
  prerequisites?: string[];
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
}

export interface Tutorial {
  slug: string;
  data: TutorialFrontmatter;
  body: string;
}
