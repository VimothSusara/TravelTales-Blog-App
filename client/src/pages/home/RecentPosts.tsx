import { useEffect, useRef, useState } from "react";

//types
import { Post } from "@/types/blog";

//component
import PostCard from "@/components/cards/PostCard";

//services
import { getPosts } from "@/services/blogService";

import { Button } from "@/components/ui/button";
import { InPageLoadingScreen } from "@/components/common/InPageLoadingScreen";
import useAuthStore from "@/store/authStore";
import { SinglePostSkeleton } from "@/skeletons/SinglePostSkeleton";

const RecentPosts = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const limit = 5;
  const abortControllerRef = useRef<AbortController>();

  const fetchPosts = async (pageToFetch: number) => {
    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await getPosts(
        {
          sort_by: "newest",
          page: pageToFetch,
          limit,
          signal: controller.signal,
        },
        user ? user.id : null
      );
      console.log(response.data.blogs);
      if (!controller.signal.aborted) {
        setPosts((prev) =>
          pageToFetch === 1
            ? response.data.blogs
            : [...prev, ...response.data.blogs]
        );
        setHasMore(response.data.blogs.length === limit);
        setNextPage(pageToFetch + 1);
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "Request aborted") {
        console.log(error);
        setError(error.message);
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleLoadMore = () => {
    fetchPosts(nextPage);
  };

  const handleRefresh = () => {
    fetchPosts(1);
  };

  return (
    <div className="w-full md:w-5/6 mx-auto">
      {loading && posts.length === 0 && <InPageLoadingScreen />}

      <div className="grid grid-cols-1 gap-2 md:gap-4 p-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="link"
            className="mt-2 text-gray-500 cursor-pointer"
            onClick={handleLoadMore}
            disabled={loading}
          >
            Load More
          </Button>
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <p className="text-gray-500 text-center">You've reached the end!</p>
      )}
    </div>
  );
};

export default RecentPosts;
