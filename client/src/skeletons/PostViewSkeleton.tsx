import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const skeletonClass = "bg-gray-300";

const PostViewSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className={`h-8 w-3/4 rounded-lg ${skeletonClass}`} />
        <Skeleton className={`h-6 w-1/2 rounded-lg ${skeletonClass}`} />
      </div>

      {/* Author & Metadata Skeleton */}
      <div className="flex items-center space-x-4">
        <Skeleton className={`h-10 w-10 rounded-full ${skeletonClass}`} />
        <div className="space-y-2">
          <Skeleton className={`h-4 w-24 rounded-lg ${skeletonClass}`} />
          <Skeleton className={`h-3 w-32 rounded-lg ${skeletonClass}`} />
        </div>
      </div>

      {/* Featured Image Skeleton */}
      <Skeleton className={`h-64 w-full rounded-lg ${skeletonClass}`} />

      {/* Content Skeleton */}
      <div className="space-y-3">
        <Skeleton className={`h-4 w-full rounded-lg ${skeletonClass}`} />
        <Skeleton className={`h-4 w-5/6 rounded-lg ${skeletonClass}`} />
        <Skeleton className={`h-4 w-4/6 rounded-lg ${skeletonClass}`} />
        <Skeleton className={`h-4 w-full rounded-lg ${skeletonClass}`} />
        <Skeleton className={`h-4 w-3/4 rounded-lg ${skeletonClass}`} />
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex space-x-4 pt-4">
        <Skeleton className={`h-9 w-20 rounded-md ${skeletonClass}`} />
        <Skeleton className={`h-9 w-20 rounded-md ${skeletonClass}`} />
      </div>

      {/* Comments Section Skeleton */}
      <div className="pt-8">
        <Skeleton className={`h-6 w-24 mb-4 rounded-lg ${skeletonClass}`} />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <Skeleton className={`h-8 w-8 rounded-full ${skeletonClass}`} />
              <div className="flex-1 space-y-2">
                <Skeleton className={`h-4 w-32 rounded-lg ${skeletonClass}`} />
                <Skeleton
                  className={`h-3 w-full rounded-lg ${skeletonClass}`}
                />
                <Skeleton className={`h-3 w-4/5 rounded-lg ${skeletonClass}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PostViewSkeleton;
