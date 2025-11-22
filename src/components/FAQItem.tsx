import React, { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface FAQItemProps {
  icon: LucideIcon;
  question: string;
  children: ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ icon: Icon, question, children }) => {
  return (
    <div className="bg-white/50 p-6 rounded-lg border border-secondary/10 hover:border-secondary/30 transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon Wrapper */}
        <div className="shrink-0 mt-1 text-primary">
          <Icon size={24} />
        </div>
        
        {/* Content */}
        <div>
          <h3 className="font-parisienne text-xl text-secondary mb-2">
            {question}
          </h3>
          <div className="text-neutral leading-relaxed text-sm sm:text-base font-alice">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQItem;