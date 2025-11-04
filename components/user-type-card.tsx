import React from 'react';
import { LucideIcon } from 'lucide-react';

interface UserTypeCardProps {
  icon: LucideIcon;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

const UserTypeCard: React.FC<UserTypeCardProps> = ({
  icon: Icon,
  title,
  isActive,
  onClick
}) => {
  return (
    <div 
      className={`
        rounded-xl flex flex-col space-y-2 items-center border p-4 cursor-pointer transition-all duration-200 hover:shadow-md
        ${isActive 
          ? 'bg-[#F4F0EE] border-[#D3D3D3]' 
          : 'bg-white border-[#D3D3D3] hover:bg-gray-50'
        }
      `}
      onClick={onClick}
    >
      <Icon className={`w-6 h-6 ${isActive ? 'text-gray-700' : 'text-gray-600'}`} />
      <p className={`text-lg font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
        {title}
      </p>
    </div>
  );
};

export default UserTypeCard;