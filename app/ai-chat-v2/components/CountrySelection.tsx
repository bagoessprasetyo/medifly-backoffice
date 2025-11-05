import Image from "next/image";
import { Country, CountryName } from "../types";

interface CountrySelectionProps {
  countries: Country[];
  selectedCountry: CountryName;
  onCountrySelect: (country: CountryName) => void;
}

export const CountrySelection = ({
  countries,
  selectedCountry,
  onCountrySelect,
}: CountrySelectionProps) => {
  return (
    <div className="bg-white p-4 rounded-[8px] mt-4">
      <p className="tracking-[-0.002px] font-medium mb-[16px]">
        Choose where you'd like to receive treatment
      </p>
      <div className="grid grid-cols-6 item-center gap-4">
        {countries.map((country, index) => (
          <div
            key={index}
            onClick={() => onCountrySelect(country.title)}
            className={`rounded-[12px] cursor-pointer ${
              selectedCountry === country.title
                ? "border-[1.5px] border-[#1C1C1C] bg-[#F4F0EE]"
                : "bg-[#FAF8F7] border border-[#CFCECE]"
            }`}
          >
            {country.image ? (
              <div
                className={`h-[160px] flex items-start gap-[8px] py-[12px] px-[6px] bg-bottom bg-no-repeat bg-cover rounded-[12px]`}
                style={{ backgroundImage: `url(${country.image})` }}
              >
                {country.flag && (
                  <Image
                    src={country.flag}
                    alt={country.title}
                    width={22}
                    height={16.5}
                  />
                )}
                <p className="text-[#1C1C1C] capitalize text-sm font-medium tracking-[-0.001px]">
                  {country.title}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[160px]">
                <p className="text-[#1C1C1C] capitalize text-sm font-medium tracking-[-0.001px]">
                  {country.title}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};