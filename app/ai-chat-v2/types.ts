export type UserType = "doctor" | "hospital" | null;
export type CountryName = string | null;
export type MedicalSpecialty = "core treatment" | "preventive & general wellness" | "aesthetic & cosmetic" | null;

export interface Country {
  title: string;
  flag: string | null;
  image: string | null;
}

export interface Category {
  name: string;
}

export interface MedicalCategory {
  icon: string;
  title: string;
  categories: Category[];
}