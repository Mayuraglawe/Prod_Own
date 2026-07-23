import React from 'react';
import { LoadingSpinner } from '../../components/loading-spinner';

export default function Loading() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center space-y-6">
      <LoadingSpinner />
      
      <div className="space-y-2 flex flex-col items-center animate-pulse">
        <h3 className="text-lg font-bold text-[#13221C]">Loading Workspace...</h3>
        <p className="text-xs text-[#687870]">Fetching your telemetry data and dashboard metrics</p>
      </div>
    </div>
  );
}
