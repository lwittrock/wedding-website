import { type ReactNode } from 'react';

interface SectionProps {
  id: string;
  children: ReactNode;
  dividerGap?: 'sm' | 'md' | 'lg' | 'xl';
  contentBottomPadding?: 'sm' | 'md' | 'lg' | 'xl';
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
  contentBottomPadding = 'lg'
}) => {
  return (
    <section id={id} className="px-4">
      {/* Divider line - this is the scroll target */}
      <div className="max-w-4xl mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-[#427161]/30 to-transparent"></div>
      </div>

      {/* Content with gap after divider and padding at bottom */}
      <div className={`max-w-4xl mx-auto ${dividerGapMap[dividerGap]} ${contentBottomPaddingMap[contentBottomPadding]}`}>
        {children}
      </div>
    </section>
  );
};

export default Section;