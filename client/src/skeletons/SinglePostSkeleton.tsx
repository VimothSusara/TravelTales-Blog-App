import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const PostSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 p-4 border rounded-lg"
    >
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </motion.div>
  );
};

export const SinglePostSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 gap-2 md:gap-4 p-2">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
};
