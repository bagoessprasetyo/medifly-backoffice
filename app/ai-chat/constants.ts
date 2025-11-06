import { coreTreatment, cosmetic, inIcon, myIcon, preventive, sgIcon, thIcon, trIcon } from "@/public/images/icons";
import { Country, MedicalCategory } from "./types";

export const COUNTRIES: Country[] = [
  { title: "malaysia", flag: myIcon, image: "/images/country-1.png" },
  { title: "singapore", flag: sgIcon, image: "/images/country-2.png" },
  { title: "thailand", flag: thIcon, image: "/images/country-3.png" },
  { title: "india", flag: inIcon, image: "/images/country-5.png" },
  { title: "turkey", flag: trIcon, image: "/images/country-6.png" },
  { title: "not sure yet", flag: null, image: null },
];

export const MEDICAL_CATEGORIES: MedicalCategory[] = [
  {
    icon: coreTreatment,
    title: "core treatment",
    categories: [
      { name: "Cardiology" },
      { name: "Orthopedics" },
      { name: "Oncology" },
      { name: "Neurology" },
      { name: "Fertility" },
      { name: "Gastroenterology" },
      { name: "Ophthalmology" },
      { name: "ENT" },
      { name: "General Surgery" },
      { name: "Pulmonology" },
    ]
  },
  {
    icon: preventive,
    title: "preventive & general wellness",
    categories: [
      { name: "Diagnostic & Screening" },
      { name: "Vaccination & Preventive Care" },
      { name: "Psychotherapy & Rehab" },
      { name: "Regenerative Medicine" },
      { name: "Diabetes & Chronic Diseases Care" },
    ]
  },
  {
    icon: cosmetic,
    title: "aesthetic & cosmetic",
    categories: [
      { name: "Dental Care" },
      { name: "Cosmetic & plastic Surgery" },
      { name: "Dermatology" },
    ]
  },
];