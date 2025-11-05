import { Building2, Globe, UserCircle } from "lucide-react";

interface NavigationProps {
  className?: string;
}

export const Navigation = ({ className = "" }: NavigationProps) => {
  return (
    <nav className={`bg-white border-b border-gray-200 px-20 py-4 ${className}`}>
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
  );
};