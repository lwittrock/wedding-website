import { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionProps {
  id: string;
  children: ReactNode;
  dividerGap?: 'sm' | 'md' | 'lg' | 'xl';
  contentBottomPadding?: 'sm' | 'md' | 'lg' | 'xl';
  // New optional props for the header
  title?: string;
  icon?: LucideIcon;
}

const dividerGapMap = {
  sm: 'pt-8',
  md: 'pt-12',
  lg: 'pt-16',
  xl: 'pt-20'
};

const contentBottomPaddingMap = {
  sm: 'pb-10',
  md: 'pb-16',
  lg: 'pb-20',
  xl: 'pb-28'
};

const Section: React.FC<SectionProps> = ({
  id,
  children,
  dividerGap = 'lg',
  contentBottomPadding = 'lg',
  title,
  icon: Icon // Rename lowercase 'icon' prop to Capitalized 'Icon' for JSX
}) => {
  return (
    <section id={id} className="px-4">
      {/* Divider line - scroll target */}
      <div className="max-w-4xl mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className={`max-w-4xl mx-auto ${dividerGapMap[dividerGap]} ${contentBottomPaddingMap[contentBottomPadding]}`}>
        
        {/* Header - Only renders if title AND icon are provided. */}
        {title && Icon && (
          <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
            <Icon className="text-primary" size={28} />
            <h2 className="text-3xl sm:text-4xl text-secondary font-parisienne">
              {title}
            </h2>
          </div>
        )}

        {children}
      </div>
    </section>
  );
};

export default Section;