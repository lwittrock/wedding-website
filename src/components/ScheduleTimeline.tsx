import React from "react";

interface ScheduleTimelineProps {
  children: React.ReactNode;
}

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ children }) => {
  return (
    <div className="space-y-12 max-w-3xl mx-auto">
      {children}
    </div>
  );
};

export default ScheduleTimeline;
