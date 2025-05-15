import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

//components
import PostViewSkeleton from "@/skeletons/PostViewSkeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PostInteractions from "@/components/common/PostInteractions";

//hooks
import useBlogPost from "@/hooks/useBlogPost";
import useCountryDataByName from "@/hooks/useCountryDataByName";
import { getImageUrl } from "@/utils/imageLink";

//store
import useAuthStore from "@/store/authStore";

//sample flag image
import flag from "@/assets/images/flag-default.png";
import PostComments from "@/components/common/PostComments";
import PostHeaderView from "@/components/common/PostHeaderView";

const RecentPostView = () => {
  const { isAuthenticated, user } = useAuthStore();
  const {
    slug,
    username,
    id: blog_id,
  } = useParams<{ slug: string; id: string }>();

  const { post, loading: postLoading, error: postError } = useBlogPost(blog_id);

  if (postLoading) {
    return (
      <>
        <div className="w-full mx-auto p-2 mt-1 md:mt-6">
          <PostViewSkeleton />
        </div>
      </>
    );
  }

  if (postError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{postError}</AlertDescription>
      </Alert>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Post not found</h2>
        <p className="text-gray-600 mt-2">
          The post you're looking for doesn't exist or may have been removed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full mx-auto p-2 mt-1 md:mt-6">
        <div className="flex flex-col gap-2">
          <div className="w-full text-center">
            <h1 className="text-4xl font-bold text-gray-800">{post?.title}</h1>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:gap-0.5 justify-between align-middle mt-2 md:mt-6 py-3 px-4 bg-gray-100">
            <PostHeaderView post={post} />
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:gap-0.5 justify-between align-middle mt-1 py-1 px-3 bg-gray-50">
            <PostInteractions post={post} />
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:gap-0.5 justify-between align-middle mt-1 py-1 px-3 bg-gray-50">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:gap-0.5 justify-between align-middle mt-1 py-1 px-3 bg-gray-50">
            <PostComments post={post} />
          </div>
          <div className="h-32 md:h-60 w-full md:w-3/4 mx-auto">
            <img
              src={getImageUrl(post.image_url)}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RecentPostView;
