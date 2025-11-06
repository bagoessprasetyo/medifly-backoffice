"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Stethoscope, Send, Loader2 } from "lucide-react";
import UserTypeCard from "@/components/user-type-card";
import { Navigation } from "./components/Navigation";
import { CountrySelection } from "./components/CountrySelection";
import { MedicalSpecialtySelection } from "./components/MedicalSpecialtySelection";
import { COUNTRIES, MEDICAL_CATEGORIES } from "./constants";
import { UserType, CountryName, MedicalSpecialty } from "./types";
import { aiService } from "./services/aiService";

const AIChatBot = () => {
  const router = useRouter();
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryName>(null);
  const [selectedMedical, setSelectedMedical] = useState<MedicalSpecialty>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUserType && selectedCountry) {
      setMessage(`${selectedUserType} from ${selectedCountry}, specializing in ${selectedCategory}`);
    }
  }, [selectedUserType, selectedCountry, selectedCategory]);

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type);
  };

  const handleCountrySelect = (country: CountryName) => {
    setSelectedCountry(country);
  };

  const handleMedicalSelect = (type: MedicalSpecialty) => {
    setSelectedMedical(type);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSendMessage = async () => {
    const messageText = message.trim();
    if (!messageText || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // const response = await aiService.sendMessage(messageText, {
      //   userType: selectedUserType || undefined,
      //   country: selectedCountry || undefined,`
      //   specialty: selectedCategory || undefined,
      //   category: selectedMedical || undefined,
      // });

      // Navigate to results page with the AI response
      router.push(`/ai-chat/results?message=${encodeURIComponent(messageText)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF8F7]">
      {/* Navigation Header */}
      <Navigation />

      {/* Main Content */}
      <main className="py-[40px] px-[180px]">
        <h1 className="text-center text-[#1C1C1C] text-4xl font-medium leading-[56px]">Find the Right Healthcare for You</h1>

        <div className="bg-white p-4 rounded-[8px] mt-5">
          <p className="tracking-[-0.002px] font-medium mb-[16px]">I am looking for</p>
          <div className="grid grid-cols-2 items-center gap-4">
            <UserTypeCard
              icon={Stethoscope}
              title="Doctor"
              isActive={selectedUserType === 'doctor'}
              onClick={() => handleUserTypeSelect('doctor')}
            />
            <UserTypeCard
              icon={Building2}
              title="Hospital"
              isActive={selectedUserType === 'hospital'}
              onClick={() => handleUserTypeSelect('hospital')}
            />
          </div>
        </div>

        {/* Country selection component (it already renders its own header/layout) */}
        <CountrySelection
          countries={COUNTRIES}
          selectedCountry={selectedCountry}
          onCountrySelect={handleCountrySelect}
        />

        {/* Medical specialty selection component */}
        <MedicalSpecialtySelection
          medicalCategories={MEDICAL_CATEGORIES}
          selectedMedical={selectedMedical}
          selectedCategory={selectedCategory}
          onMedicalSelect={handleMedicalSelect}
          onCategorySelect={handleCategorySelect}
        />

        <div>
          <textarea
            name="message"
            id="message"
            placeholder="Write a custom message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="mt-[12px] h-[111px] bg-white w-full resize-none p-[16px] rounded-[8px] border border-[#CFCECE] disabled:opacity-50"
          />
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </section>
  );
};

export default AIChatBot;