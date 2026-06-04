import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-dark-700 rounded-md ${className}`}
            {...props}
        />
    );
};

export const SkeletonCard = () => (
    <div className="card p-4 space-y-4">
        <div className="flex justify-between items-start">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-12 h-4" />
        </div>
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-32 h-4" />
    </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
    <div className="space-y-4">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 items-center">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="flex-1 h-4" />
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-20 h-4" />
            </div>
        ))}
    </div>
);

export default Skeleton;
