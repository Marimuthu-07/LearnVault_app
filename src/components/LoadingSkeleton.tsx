import React from "react";

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      
      {/* 1. Stat cards load state */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0F1626]/40 border border-gray-800/50 rounded-2xl p-5 h-24 flex flex-col justify-between">
            <div className="h-2 w-16 bg-gray-850 rounded" />
            <div className="h-6 w-24 bg-gray-800 rounded mt-2" />
            <div className="h-3 w-32 bg-gray-850 rounded mt-1" />
          </div>
        ))}
      </div>

      {/* 2. Content split visual skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main topic panels */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-[#0F1626]/20 p-2 border border-gray-800/40 rounded-xl h-12">
            <div className="h-4 w-40 bg-gray-850 rounded ml-2" />
            <div className="h-4 w-20 bg-gray-850 rounded mr-2" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#0F1626]/40 border border-gray-800/50 rounded-2xl p-4 h-28 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="h-4 w-1/3 bg-gray-800 rounded" />
                  <div className="h-3 w-16 bg-gray-850 rounded-full" />
                </div>
                <div className="h-3 w-2/3 bg-gray-850 rounded" />
                <div className="flex gap-4 border-t border-gray-850/50 pt-2">
                  <div className="h-2 w-14 bg-gray-850 rounded" />
                  <div className="h-2 w-14 bg-gray-850 rounded" />
                  <div className="h-2 w-14 bg-gray-850 rounded ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side helpers panel */}
        <div className="bg-[#0F1626]/20 border border-gray-800/50 rounded-2xl p-5 h-80 space-y-4">
          <div className="h-3 w-20 bg-gray-850 rounded" />
          <div className="h-4 w-1/2 bg-gray-800 rounded" />
          <div className="space-y-2 pt-2">
            <div className="h-2.5 w-full bg-gray-850 rounded" />
            <div className="h-2.5 w-full bg-gray-850 rounded" />
            <div className="h-2.5 w-5/6 bg-gray-850 rounded" />
          </div>
          <div className="h-20 bg-purple-950/10 border border-purple-900/10 rounded-xl mt-4" />
        </div>

      </div>

    </div>
  );
}
