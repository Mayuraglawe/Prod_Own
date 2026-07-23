import React from 'react';

export default function Loading() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center space-y-6">
      {/* A beautiful pulsing emerald loading indicator */}
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 border-4 border-[#E2E8E4] rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#0B4F3A] rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      <div className="space-y-2 flex flex-col items-center animate-pulse">
        <h3 className="text-lg font-bold text-[#13221C]">Loading Workspace...</h3>
        <p className="text-xs text-[#687870]">Fetching your telemetry data and dashboard metrics</p>
      </div>
    </div>
  );
}
