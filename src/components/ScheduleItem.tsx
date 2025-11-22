import React from "react";

interface ScheduleItemProps {
  title: string;
  dateTime: string;
  children: React.ReactNode;
  isLast?: boolean;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({
  title,
  dateTime,
  children,
  isLast = false
}) => {
  return (
    <div
      className={`relative pl-8 sm:pl-12 ${
        !isLast ? "border-l-2 border-[#427161]/30" : ""
      }`}
    >
      {/* Dot marker */}
      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#cc5500]"></div>

      {/* Title + datetime */}
      <div className="mb-2">
        <h3 className="text-xl sm:text-2xl font-parisienne text-[#cc5500] mb-1">
          {title}
        </h3>
        <p className="text-sm sm:text-base font-alice text-[#427161] font-semibold">
          {dateTime}
        </p>
      </div>

      {/* Body */}
      <div className="text-[#494949] font-alice leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default ScheduleItem;
