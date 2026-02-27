import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={`animate-pulse bg-neutral-200 rounded-md ${className}`}
    />
  );
};

export const StorySkeleton = () => {
  return (
    <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center mb-5">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="ml-4 flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-3/4 mb-4" />
      <div className="space-y-3 mb-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center gap-8 pt-4 border-t border-neutral-200">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
};

export const CommentSkeleton = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
  );
};
