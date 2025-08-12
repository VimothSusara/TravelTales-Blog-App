import { useEffect, useRef, useState } from "react";

//types
import { Post } from "@/types/blog";

//components
import RecommendedPostCard from "@/components/cards/RecommendedPostCard";
import { getPosts } from "@/services/blogService";

import useAuthStore from "@/store/authStore";

const RecommendedSection = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const limit = 3;
  const abortControllerRef = useRef<AbortController>(null);

  const fetchPosts = async (pageToFetch: number) => {
    if (loading || !hasMore) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const response = await getPosts(
        {
          sort_by: "popular",
          page: pageToFetch,
          limit,
          signal: controller.signal,
        },
        user ? user.id : null
      );

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

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Recommended</h2>
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <RecommendedPostCard key={post.id} post={post} />
        ))}
        {error && <p>{error}</p>}
        {nextPage}
      </div>
    </>
  );
};

export default RecommendedSection;
