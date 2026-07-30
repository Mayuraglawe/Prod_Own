'use client';

import React, { useState } from 'react';

export default function WorkersPage() {
  const [uptimeSeconds] = useState(5048);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#13221C]">BullMQ Background Workers</h3>
                <p className="text-xs text-[#687870]">Queue concurrency and worker process management</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-xs border border-emerald-200">
                Concurrency: 4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-gradient-to-br from-[#1b4332] to-[#52b788] text-white">
                <span className="text-xs text-emerald-200 font-semibold">Queue: fingerprints</span>
                <div className="text-3xl font-extrabold mt-2 font-mono">{formatTimer(uptimeSeconds)}</div>
                <p className="text-xs text-gray-300 mt-2">Active jobs processing stack traces</p>
              </div>
              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#F3F5F4] flex flex-col justify-between">
                <div>
                  <span className="text-xs text-[#687870] font-bold">Redis Connection</span>
                  <h4 className="text-base font-bold text-[#13221C] mt-1">redis://localhost:6379</h4>
                </div>
                <button className="py-2 px-4 bg-[#52b788] text-white rounded-full font-bold text-xs">
                  Restart Worker Process
                </button>
              </div>
            </div>
          </div>
    </>
  );
}
