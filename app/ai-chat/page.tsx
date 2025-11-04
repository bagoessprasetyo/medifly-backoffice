"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Paperclip, Mic, MapPin, Clock, DollarSign, X, Building2, UserCircle, Globe, Users, Heart, Stethoscope, ChevronRight, Star, HeartPulse, Bone, Microscope, BrainCircuit } from 'lucide-react';
import UserTypeCard from '@/components/user-type-card';

type UserType = 'doctor' | 'hospital' | null;
type Country = 'malaysia' | 'singapore' | 'thailand' | 'india' | 'turkey' | 'not-sure' | null;
type MedicalCategory = 'core-treatment' | 'preventive-wellness' | 'aesthetic-cosmetic' | null;

const HealthcareAIChatbot = () => {
  const router = useRouter();
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country>(null);
  const [selectedMedicalCategory, setSelectedMedicalCategory] = useState<MedicalCategory>('core-treatment');
  const [inputText, setInputText] = useState('');

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
  };

  const handleMedicalCategorySelect = (category: MedicalCategory) => {
    setSelectedMedicalCategory(category);
  };

  const handleSubmit = () => {
    // Navigate to results page
    router.push('/ai-chat/results');
  };

  const countries = [
    { id: 'malaysia', name: 'Malaysia', flag: '🇲🇾', image: '/images/country-1.png' },
    { id: 'singapore', name: 'Singapore', flag: '🇸🇬', image: '/images/country-2.png' },
    { id: 'thailand', name: 'Thailand', flag: '🇹🇭', image: '/images/country-3.png' },
    { id: 'india', name: 'India', flag: '🇮🇳', image: '/images/country-4.png' },
    { id: 'turkey', name: 'Turkey', flag: '🇹🇷', image: '/images/country-5.png' },
    { id: 'not-sure', name: 'Not sure yet', flag: '❓', image: null }
  ];

  const medicalCategories = [
    { id: 'core-treatment', name: 'Core Treatment', icon: Stethoscope },
    { id: 'preventive-wellness', name: 'Preventive & General Wellness', icon: Heart },
    { id: 'aesthetic-cosmetic', name: 'Aesthetic & Cosmetic', icon: Star }
  ];

  const specialties = [
    { name: 'Cardiology', icon: HeartPulse },
    { name: 'Orthopedics', icon: Bone },
    { name: 'Oncology', icon: Microscope },
    { name: 'Neurology', icon: BrainCircuit },
    { name: 'Fertility', icon: Users },
    { name: 'Gastroenterology', icon: Stethoscope },
    { name: 'Ophthalmology', icon: UserCircle },
    { name: 'ENT', icon: UserCircle },
    { name: 'General Surgery', icon: Stethoscope },
    { name: 'Pulmonology', icon: HeartPulse }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F7]">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 px-20 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-24 h-7 bg-gray-300 rounded mr-2"></div>
            <span className="text-xl font-bold text-black">Medifly</span>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex items-center space-x-8">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Hospitals</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <UserCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Doctors</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">About Us</span>
            </button>
          </div>
          
          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Sign In
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center px-20 py-12">
        {/* Main Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Find the Right Healthcare for You</h1>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-6xl space-y-6">
          {/* User Type Selection */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">I am looking for</h2>
            <div className="grid grid-cols-2 gap-4">
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

          {/* Country Selection */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Choose where you'd like to receive treatment</h2>
            <div className="grid grid-cols-6 gap-4">
              {countries.map((country) => (
                <div
                  key={country.id}
                  onClick={() => handleCountrySelect(country.id as Country)}
                  className={`relative rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedCountry === country.id
                      ? 'border-gray-400 bg-[#F4F0EE]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${country.image ? 'h-40' : 'h-40 flex items-center justify-center'}`}
                >
                  {country.image ? (
                    <>
                      <img
                        src={country.image}
                        alt={country.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center space-x-2 bg-white bg-opacity-90 rounded px-2 py-1">
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm font-medium text-gray-900">{country.name}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-2xl">{country.flag}</span>
                      <span className="text-sm font-medium text-gray-900 text-center">{country.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Medical Specialty */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Medical Specialty</h2>
            
            {/* Category Tabs */}
            <div className="flex space-x-4 mb-6">
              {medicalCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleMedicalCategorySelect(category.id as MedicalCategory)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                      selectedMedicalCategory === category.id
                        ? 'bg-[#F4F0EE] border-gray-400 text-gray-900'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Specialty Chips */}
            <div className="grid grid-cols-6 gap-3">
              {specialties.map((specialty, index) => {
                const IconComponent = specialty.icon;
                return (
                  <button
                    key={index}
                    className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{specialty.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tell us more about your healthcare needs..."
                className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
              <button 
                onClick={handleSubmit}
                className="absolute bottom-4 right-4 w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareAIChatbot;