"use client"

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, UserCircle, Globe, MapPin, Phone, Mail, Globe as Website, Users, Star, CheckCircle, ChevronLeft, Filter, Minus, Plus, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';

const HospitalDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params.id;

  // Mock hospital data - in real app this would come from API
  const hospitalData = {
    id: hospitalId,
    name: "Gleneagles Penang",
    location: "1, Jalan Pangkor, 10050 George Town, Pulau Pinang, Malaysia",
    rating: 4.8,
    reviewCount: 1756,
    description: "Lorem ipsum dolor sit amet consectetur. Maecenas et diam in feugiat neque nibh. Lobortis dolor gravida enim cras urna. At convallis elementum senectus nunc cras sodales neque. Facilisi adipiscing suspendisse pellentesque pharetra nulla magna ultrices proin. Nisl mauris adipiscing quis feugiat sagittis. Faucibus purus accumsan mauris quam. Id bibendum arcu risus nunc hendrerit amet placerat. Accumsan nulla fermentum tortor malesuada laoreet vestibulum urna diam. Elementum eget malesuada mattis diam sapien",
    phone: "+62 2127899822",
    website: "hospital.com",
    patientVolume: "1,789 patient",
    accreditations: [
      { name: "JCI", logo: "/placeholder-jci.png" },
      { name: "MSQH", logo: "/placeholder-msqh.png" },
      { name: "ISO", logo: "/placeholder-iso.png" }
    ]
  };

  const specialties = [
    {
      name: "Pulmonology",
      doctorCount: 4,
      description: "improving respiratory health and overall quality of life for patients with breathing difficulties and lung disease.",
      doctors: [
        {
          name: "dr. Simon Lo",
          specialty: "Cardiologist",
          description: "Dr. Simon Lo is a cardiologist practicing at Gleneagles Penang. He graduated as a medical doctor from the United Kingdom.",
          experience: "11 Years of experience",
          certification: "Royal College of Physicians, FRCP (UK)"
        },
        {
          name: "dr. Simon Lo",
          specialty: "Cardiologist",
          description: "Dr. Simon Lo is a cardiologist practicing at Gleneagles Penang. He graduated as a medical doctor from the United Kingdom.",
          experience: "11 Years of experience",
          certification: "Royal College of Physicians, FRCP (UK)"
        },
        {
          name: "dr. Simon Lo",
          specialty: "Cardiologist",
          description: "Dr. Simon Lo is a cardiologist practicing at Gleneagles Penang. He graduated as a medical doctor from the United Kingdom.",
          experience: "11 Years of experience",
          certification: "Royal College of Physicians, FRCP (UK)"
        },
        {
          name: "dr. Simon Lo",
          specialty: "Cardiologist",
          description: "Dr. Simon Lo is a cardiologist practicing at Gleneagles Penang. He graduated as a medical doctor from the United Kingdom.",
          experience: "11 Years of experience",
          certification: "Royal College of Physicians, FRCP (UK)"
        }
      ]
    },
    {
      name: "Cardiology",
      doctorCount: 45,
      description: "providing treatment for patients with narrowing of the arteries and heart conditions.",
      expanded: true,
      doctors: [
        {
          name: "dr. Simon Lo",
          specialty: "Cardiologist",
          description: "Dr. Simon Lo is a cardiologist practicing at Gleneagles Penang. He graduated as a medical doctor from the United Kingdom.",
          experience: "11 Years of experience",
          certification: "Royal College of Physicians, FRCP (UK)"
        },
        {
          name: "dr. Simon Lo",
          specialty: "Cardiologist",
          description: "Dr. Simon Lo is a cardiologist practicing at Gleneagles Penang. He graduated as a medical doctor from the United Kingdom.",
          experience: "11 Years of experience",
          certification: "Royal College of Physicians, FRCP (UK)"
        }
      ]
    },
    {
      name: "Orthopedy",
      doctorCount: 45,
      description: "improving symmetry and mobility for patients with walking difficulties and musculoskeletal conditions.",
      doctors: [
        {
          name: "dr. Simon Lo",
          specialty: "Cardiologist",
          description: "Dr. Simon Lo is a cardiologist practicing at Gleneagles Penang. He graduated as a medical doctor from the United Kingdom.",
          experience: "11 Years of experience",
          certification: "Royal College of Physicians, FRCP (UK)"
        }
      ]
    },
    {
      name: "Neurology",
      doctorCount: 45,
      description: "improving respiratory health and overall quality of life for patients with breathing difficulties and lung disease.",
      doctors: [
        {
          name: "dr. Simon Lo",
          specialty: "Cardiologist",
          description: "Dr. Simon Lo is a cardiologist practicing at Gleneagles Penang. He graduated as a medical doctor from the United Kingdom.",
          experience: "11 Years of experience",
          certification: "Royal College of Physicians, FRCP (UK)"
        }
      ]
    }
  ];

  const facilities = [
    {
      category: "Comfort During Stay",
      items: [
        "Mobility accessible rooms",
        "Family accommodation",
        "Private accommodations",
        "Recreational facilities",
        "Business center services"
      ]
    },
    {
      category: "Transportation",
      items: [
        "Airport pickup",
        "Local train options",
        "Visa / Travel Office",
        "Ambulance"
      ]
    },
    {
      category: "Food & Beverage",
      items: [
        "Local cuisine options",
        "Room service options",
        "Special dietary accommodations"
      ]
    },
    {
      category: "Treatment Related",
      items: [
        "24/7 emergency services",
        "ICU facilities",
        "Advanced surgical suites",
        "Diagnostic imaging"
      ]
    }
  ];

  const treatmentCosts = [
    {
      tag: "SAMPLE",
      title: "General Surgery",
      description: "Comprehensive surgical procedures and treatments",
      priceRange: "MYR 14,000 - MYR 35,000"
    },
    {
      tag: "SAMPLE",
      title: "Cosmetic Surgery",
      description: "Aesthetic and reconstructive surgical procedures",
      priceRange: "MYR 9,800 - MYR 18,500"
    },
    {
      tag: "SAMPLE",
      title: "Cardiac Surgery",
      description: "Heart and cardiovascular surgical treatments",
      priceRange: "MYR 12,400 - MYR 29,900"
    },
    {
      tag: "SAMPLE",
      title: "Orthopedic Surgery",
      description: "Bone and joint surgical procedures",
      priceRange: "MYR 8,500 - MYR 22,000"
    }
  ];

  const handleBack = () => {
    router.back();
  };

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

      {/* Secondary Navigation Tabs */}
      <div className="bg-gray-50 border-b border-gray-200 px-20 py-3">
        <div className="flex items-center space-x-8">
          <button className="px-4 py-2 text-sm font-medium text-black border-b-2 border-black">
            Overview
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            List of Doctor
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Facilities
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Treatment Cost Range
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-20 py-8">
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Results</span>
        </button>

        {/* Hospital Overview Section */}
        <div className="flex gap-16 mb-16">
          {/* Left Side - Images */}
          <div className="flex flex-col gap-4">
            <div className="w-96 h-80 bg-gray-200 rounded-lg"></div>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* Right Side - Hospital Info */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-medium text-gray-900 mb-2">{hospitalData.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{hospitalData.location}</span>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(hospitalData.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm font-medium ml-1">{hospitalData.rating} ({hospitalData.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Accreditations */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Accreditation:</p>
              <div className="flex gap-8">
                {hospitalData.accreditations.map((acc, index) => (
                  <div key={index} className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-600">{acc.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-base text-gray-700 mb-6 leading-relaxed">{hospitalData.description}</p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Phone</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{hospitalData.phone}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Website className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Website</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{hospitalData.website}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Volume</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{hospitalData.patientVolume}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Doctor Available</span>
                </div>
                <span className="text-sm font-medium text-green-600">Available</span>
              </div>
            </div>

            {/* Book Appointment Button */}
            <button className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              Book Appointment
            </button>
          </div>
        </div>

        {/* Doctor List Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-medium text-gray-900 mb-8">Doctor List</h2>
          <div className="space-y-8">
            {specialties.map((specialty, index) => (
              <div key={index} className="border-b border-gray-200 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 border-2 border-gray-900 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">{specialty.name}</h3>
                      <p className="text-sm text-gray-600">{specialty.doctorCount} Doctors</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    {specialty.expanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>
                
                <p className="text-base text-gray-700 mb-6">{specialty.description}</p>
                
                {specialty.expanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {specialty.doctors.map((doctor, docIndex) => (
                      <div key={docIndex} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="w-full h-48 bg-gray-200"></div>
                        <div className="p-4">
                          <div className="mb-3">
                            <h4 className="text-lg font-medium text-gray-900">{doctor.name}</h4>
                            <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          </div>
                          <p className="text-sm text-gray-700 mb-4">{doctor.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-300 rounded"></div>
                              <span className="text-sm text-gray-700">{doctor.experience}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-300 rounded"></div>
                              <span className="text-sm text-gray-700">{doctor.certification}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {specialty.expanded && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1 bg-gray-300 rounded">
                        <div className="w-8 h-1 bg-gray-900 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50">
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50">
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-medium text-gray-900 mb-8">Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {facilities.map((facility, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 mb-4">
                  <Minus className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">{facility.category}</h3>
                </div>
                <ul className="space-y-3">
                  {facility.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mt-1 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment Cost Range Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-medium text-gray-900 mb-6">Treatment Cost Range</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-sm font-medium text-yellow-800 mb-2">NOTE</p>
            <p className="text-sm text-yellow-700">
              The treatment costs listed above are estimated. They may vary based on patient complexity, treatment plan, and any additional services required. Many medical treatments are complex and require coordination; some may include hospitalization or specialized services. Please consult the hospital for a precise estimate of treatment costs prior to scheduling.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {treatmentCosts.map((cost, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded">{cost.tag}</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{cost.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{cost.description}</p>
                <p className="text-lg font-medium text-gray-900">{cost.priceRange}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailPage;