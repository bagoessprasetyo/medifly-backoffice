"use client"

import React from 'react';
import { Building2, UserCircle, Globe, MapPin, Clock, DollarSign, Filter, Star, CheckCircle, Send } from 'lucide-react';

const BrowsingResultsPage = () => {
  const hospitalCards = [
    {
      id: 1,
      name: "Gleneagles Penang",
      location: "Penang, Malaysia",
      specialties: ["Cardiology", "Cancer"],
      additionalSpecialties: 12,
      doctorsAvailable: 2,
      priceRange: "MYR 14,000 - MYR 15,000"
    },
    {
      id: 2,
      name: "Gleneagles Penang",
      location: "Penang, Malaysia",
      specialties: ["Cardiology", "Cancer"],
      additionalSpecialties: 12,
      doctorsAvailable: 2,
      priceRange: "MYR 14,000 - MYR 15,000"
    },
    {
      id: 3,
      name: "Gleneagles Penang",
      location: "Penang, Malaysia",
      specialties: ["Cardiology", "Cancer"],
      additionalSpecialties: 12,
      doctorsAvailable: 2,
      priceRange: "MYR 14,000 - MYR 15,000"
    },
    {
      id: 4,
      name: "Gleneagles Penang",
      location: "Penang, Malaysia",
      specialties: ["Cardiology", "Cancer"],
      additionalSpecialties: 12,
      doctorsAvailable: 2,
      priceRange: "MYR 14,000 - MYR 15,000"
    },
    {
      id: 5,
      name: "Gleneagles Penang",
      location: "Penang, Malaysia",
      specialties: ["Cardiology", "Cancer"],
      additionalSpecialties: 12,
      doctorsAvailable: 2,
      priceRange: "MYR 14,000 - MYR 15,000"
    },
    {
      id: 6,
      name: "Gleneagles Penang",
      location: "Penang, Malaysia",
      specialties: ["Cardiology", "Cancer"],
      additionalSpecialties: 12,
      doctorsAvailable: 2,
      priceRange: "MYR 14,000 - MYR 15,000"
    },
    {
      id: 7,
      name: "Gleneagles Penang",
      location: "Penang, Malaysia",
      specialties: ["Cardiology", "Cancer"],
      additionalSpecialties: 12,
      doctorsAvailable: 2,
      priceRange: "MYR 14,000 - MYR 15,000"
    },
    {
      id: 8,
      name: "Gleneagles Penang",
      location: "Penang, Malaysia",
      specialties: ["Cardiology", "Cancer"],
      additionalSpecialties: 12,
      doctorsAvailable: 2,
      priceRange: "MYR 14,000 - MYR 15,000"
    }
  ];

  const relatedQuestions = [
    "Who are the lymphoma specialists?",
    "How much does treatment cost?"
  ];

  return (
    <div className="min-h-screen bg-white">
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
      <div className="flex px-20 py-6 space-x-5">
        {/* Left Sidebar - Chat and Related Questions */}
        <div className="w-72 bg-white border border-gray-200 rounded-lg flex flex-col h-[calc(100vh-120px)]">
          {/* Chat Header */}
          <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <span className="text-sm font-semibold text-gray-900">Medi chan</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* User Message */}
            <div className="flex flex-col items-end space-y-1">
              <div className="bg-blue-100 rounded-lg rounded-br-sm p-3 max-w-xs">
                <p className="text-xs text-gray-800 text-right">Show Hospital in Malaysia that treats Oncology</p>
              </div>
              <span className="text-xs text-gray-500">08:22 AM</span>
            </div>

            {/* Bot Message */}
            <div className="flex flex-col items-start space-y-1">
              <div className="bg-gray-100 rounded-lg rounded-bl-sm p-3 max-w-xs">
                <p className="text-xs text-gray-800 mb-2">Here is a list of hospitals internationally recognized for oncology treatment with stem cell expertise:</p>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-white rounded text-xs text-gray-700">Gleneagles Penang</span>
                  <span className="px-2 py-1 bg-white rounded text-xs text-gray-700">12</span>
                </div>
              </div>
              <span className="text-xs text-gray-500 text-right">08:22 AM</span>
            </div>

            {/* Related Questions */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-semibold text-gray-900">Related Question</h3>
              <div className="space-y-2">
                {relatedQuestions.map((question, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <p className="text-xs text-gray-800">{question}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Chat Card */}
            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 relative">
              <p className="text-xs text-gray-800">hospitals that provide multilingual support and assistance</p>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">1</span>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <input
                type="text"
                placeholder="hospitals that provide multilingual support and assistance"
                className="flex-1 text-sm text-gray-900 bg-transparent border-none outline-none"
              />
              <button className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800">
                <Send className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Results Area */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-gray-400" />
              <h1 className="text-sm font-medium text-gray-600">Result for "Lympoma Hospital"</h1>
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>

          {/* Hospital Cards Grid */}
          <div className="grid grid-cols-4 gap-6">
            {hospitalCards.map((hospital) => (
              <div key={hospital.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Hospital Image Placeholder */}
                <div className="w-full h-40 bg-gray-200"></div>
                
                {/* Hospital Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">{hospital.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{hospital.location}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1">
                    {hospital.specialties.map((specialty, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                        {specialty}
                      </span>
                    ))}
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                      +{hospital.additionalSpecialties}
                    </span>
                  </div>

                  {/* Doctor Availability */}
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">{hospital.doctorsAvailable} Doctor Available</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{hospital.priceRange}</span>
                  </div>

                  {/* Learn More Button */}
                  <button 
                    onClick={() => window.location.href = `/ai-chat/hospital/${hospital.id}`}
                    className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowsingResultsPage;