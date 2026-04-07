import React, { type ReactNode } from "react";

const Tooltip = ({
  children,
  tooltipText,
}: {
  children: ReactNode;
  tooltipText: String;
}) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform translate-y-1 -translate-x-1/2 mb-3 border border-gray-500 bg-white text-gray-500 text-sm rounded py-1 px-2 w-max max-w-125 sm:max-w-75 md:max-w-100 lg:max-w-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300 wrap-break-word">
        {tooltipText}
        <div className="absolute top-full left-1/2 transform -translate-y-1.25 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-b border-r border-gray-500"></div>
      </div>
    </div>
  );
};

export default Tooltip;
