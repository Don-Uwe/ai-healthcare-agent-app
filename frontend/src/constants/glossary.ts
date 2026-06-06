export type GlossaryTerm = {
  term: string;
  definition: string;
  category?: string;
  relatedTerms?: string[];
};

export const testGlossaryTerms: GlossaryTerm[] = [
  {
    term: 'Hypertension',
    definition:
      'A condition in which blood pressure remains consistently elevated above the healthy range.',
    category: 'Cardiology',
    relatedTerms: ['Blood pressure', 'Heart health', 'Stroke risk'],
  },
  {
    term: 'Glucose',
    definition:
      'A simple sugar that the body uses as a primary source of energy, especially after digestion.',
    category: 'Metabolism',
    relatedTerms: ['Diabetes', 'Insulin'],
  },
];
