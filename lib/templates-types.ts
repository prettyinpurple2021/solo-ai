export type Template = {
  id: number;
  title: string;
  description: string;
  slug: string;
  isInteractive: boolean;
  requiredRole: 'free_launchpad' | 'pro_accelerator' | 'empire_dominator';
  categoryId: number;
};

export type TemplateCategory = {
  id: number;
  category: string;
  icon: string;
  description: string;
  templates: Template[];
}; 