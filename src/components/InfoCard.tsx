import React, { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, children }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-primary">
        <Icon size={24} />
      </div>
      <h4 className="font-parisienne text-xl text-secondary mb-3">{title}</h4>
      <div className="text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
};

export default InfoCard;