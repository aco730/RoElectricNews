import categoriesData from "./categories.json";

export interface Category {
  slug: string;
  name: string;
  color: string;
  description: string;
  ascunsa?: boolean;
}

export const categories: Category[] = categoriesData;
export const categoriiVizibile: Category[] = categoriesData.filter((c) => !c.ascunsa);
