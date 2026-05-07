const SkeletonCard = () => (
  <div className="bg-white rounded-xl border overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="flex justify-between pt-3 border-t">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 border-b animate-pulse">
    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    </div>
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
  </div>
);

const SkeletonText = ({ width = "w-full", lines = 1 }: { width?: string; lines?: number }) => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${width}`} />
    ))}
  </div>
);

const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

const SkeletonStats = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-4 animate-pulse">
        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    ))}
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 animate-pulse">
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
    <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded" />
  </div>
);

export { SkeletonCard, SkeletonRow, SkeletonText, SkeletonGrid, SkeletonStats, SkeletonChart };
