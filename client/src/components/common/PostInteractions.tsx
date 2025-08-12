import {
  MessageSquare,
  Heart,
  Bookmark,
  EllipsisVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";

//types
import { Post } from "@/types/blog";

//store
import useAuthStore from "@/store/authStore";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { likePost, unlikePost } from "@/services/blogService";

const PostInteractions = ({ post }: { post: Post }) => {
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = async () => {
    try {
      if (isLiked) {
        const response = await unlikePost(post.id);
        if (response.data.success) {
          setIsLiked(false);
          setLikeCount(likeCount ? (likeCount > 0 ? likeCount - 1 : 0) : 0);
        }
      } else {
        const response = await likePost(post.id);
        if (response.data.success) {
          setIsLiked(true);
          setLikeCount(likeCount ? likeCount + 1 : 1);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex justify-start gap-2 items-center">
        <div className="flex justify-around align-middle gap-4">
          <div className="flex items-center align-top gap-1.5 group hover:text-foreground transition-colors">
            <Tooltip>
              <TooltipTrigger>
                <MessageSquare
                  size={16}
                  className="transition-colors group-hover:fill-muted cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent>{post.comments} comments</TooltipContent>
            </Tooltip>
            <span className="text-sm cursor-pointer">{post.comments}</span>
          </div>

          <div className="flex items-center justify-center align-middle gap-1.5 group hover:text-foreground transition-colors">
            <NavLink to={""} onClick={handleLike}>
              <Tooltip>
                <TooltipTrigger>
                  <Heart
                    size={16}
                    className={`transition-colors cursor-pointer ${
                      isLiked ? "fill-red-500 text-red-500" : "text-current"
                    }`}
                    strokeWidth={isLiked ? 0 : 1.5}
                  />
                </TooltipTrigger>
                <TooltipContent>{likeCount} likes</TooltipContent>
              </Tooltip>
            </NavLink>
            <div className="text-sm cursor-pointer">{likeCount}</div>
          </div>
        </div>
      </div>
      <div className="flex justify-around gap-2 items-center">
        {user?.id !== post.author.id && (
          <Button
            variant="ghost"
            size="sm"
            title="Save"
            className="cursor-pointer"
          >
            <Bookmark size={16} className="hover:text-gray-300" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          title="More"
          className="cursor-pointer"
        >
          <EllipsisVertical size={16} className="hover:text-gray-300" />
        </Button>
      </div>
    </>
  );
};

export default PostInteractions;
