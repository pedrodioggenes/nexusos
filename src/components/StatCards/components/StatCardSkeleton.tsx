import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardSkeletonProps {
  className?: string;
}

export default function StatCardSkeleton({ className = "" }: StatCardSkeletonProps) {
  return (
    <div
      className={`bg-card py-4 px-4 rounded-2xl border border-border min-h-[110px] w-full flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-20 h-4 rounded-sm" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <Skeleton className="w-11 h-5 rounded-sm" />
      </div>
    </div>
  );
}
