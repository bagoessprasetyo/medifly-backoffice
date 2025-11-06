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

// AI Response Types
export interface AIAction {
  label: string;
  type: 'navigate' | 'action' | 'tool_call';
  target: string;
  parameters?: Record<string, any>;
}

export interface AIResponse {
  message: string;
  actions?: AIAction[];
}

export interface WebhookResponse {
  success: boolean;
  data?: AIResponse;
  error?: string;
}