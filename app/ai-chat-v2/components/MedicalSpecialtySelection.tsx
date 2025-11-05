import Image from "next/image";
import { MedicalCategory, MedicalSpecialty } from "../types";

interface MedicalSpecialtySelectionProps {
  medicalCategories: MedicalCategory[];
  selectedMedical: MedicalSpecialty;
  selectedCategory: string;
  onMedicalSelect: (type: MedicalSpecialty) => void;
  onCategorySelect: (category: string) => void;
}

export const MedicalSpecialtySelection = ({
  medicalCategories,
  selectedMedical,
  selectedCategory,
  onMedicalSelect,
  onCategorySelect,
}: MedicalSpecialtySelectionProps) => {
  return (
    <div className="bg-white p-4 rounded-[8px] mt-4">
      <p className="tracking-[-0.002px] font-medium mb-[16px]">Medical Specialty</p>
      <div className="grid grid-cols-3 items-center gap-4">
        {medicalCategories.map((category, index) => (
          <div
            key={index}
            onClick={() => onMedicalSelect(category.title as MedicalSpecialty)}
            className={`p-[16px] rounded-[12px] cursor-pointer border flex flex-col items-center gap-[10px] ${
              selectedMedical === category.title
                ? "bg-[#F4F0EE] border-[#838180]"
                : "border-[#CFCECE]"
            }`}
          >
            <Image src={category.icon} alt={category.title} width={20} height={20} />
            <p className="capitalize text-sm tracking-[-0.001px]">{category.title}</p>
          </div>
        ))}
      </div>
      
      <div className="border-[#CFCECE] border my-[16px]" />
      
      <div>
        {medicalCategories.map((medCat, index) => (
          <div key={index} className="w-full">
            {selectedMedical === medCat.title && (
              <div className="flex items-center gap-[14px] w-full flex-wrap">
                {medCat.categories.map((cat, i) => (
                  <div
                    key={i}
                    onClick={() => onCategorySelect(cat.name)}
                    className={`w-fit py-[8px] px-[16px] rounded-[12px] border cursor-pointer ${
                      selectedCategory === cat.name
                        ? "bg-[#F4F0EE] border-[#c1c1c1]"
                        : "border-[#CFCECE]"
                    }`}
                  >
                    <p>{cat.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};