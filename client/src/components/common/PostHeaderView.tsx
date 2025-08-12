import { useState } from "react";
import useAuthStore from "@/store/authStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getImageUrl } from "@/utils/imageLink";
import { Post } from "@/types/blog";
import { Button } from "@/components/ui/button";

import flag from "@/assets/images/flag-default.png";

import useCountryDataByName from "@/hooks/useCountryDataByName";
import { followUser, unfollowUser } from "@/services/blogService";

const PostHeaderView = ({ post }: { post: Post }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(post.author.is_following);

  const countryName = post?.country_name;
  const {
    country,
  } = useCountryDataByName(countryName);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        const response = await unfollowUser(post.author.id);
        if (response.data.success) {
          setIsFollowing(false);
        }
      } else {
        const response = await followUser(post.author.id);
        if (response.data.success) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex justify-start align-middle gap-2">
        <Avatar size="md" className="cursor-pointer">
          <AvatarImage src={getImageUrl(post.author.avatar_url)} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="text-sm flex items-center">
          <span className="font-normal px-1">{post.author.username}</span>
        </div>
        <div className="">
          <Button
            variant={`outline`}
            className={`px-4 rounded-3xl cursor-pointer ${
              isFollowing ? "bg-gray-900 text-white" : ""
            }`}
            disabled={
              !isAuthenticated || user?.username === post.author.username
            }
            size="sm"
            onClick={handleFollow}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </div>
      <div className="flex justify-start gap-2">
        <div className="flex items-center justify-center">
          <img
            src={
              getImageUrl(
                country?.flags.png ||
                  country?.flags.svg ||
                  country?.flags.alt ||
                  ""
              )
                ? getImageUrl(
                    country?.flags.png ||
                      country?.flags.svg ||
                      country?.flags.alt ||
                      ""
                  )
                : flag
            }
            alt={post?.country_name}
            className="w-10 h-7 object-cover rounded"
          />
        </div>
        <div className="text-sm flex items-center">
          <span className="font-semibold px-1">
            {country?.name ? country?.name : post?.country_name}
          </span>
        </div>
      </div>
    </>
  );
};

export default PostHeaderView;
