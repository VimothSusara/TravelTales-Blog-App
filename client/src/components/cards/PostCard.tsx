import { useNavigate } from "react-router-dom";

//types
import { Post } from "@/types/blog";

//components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

//icons
import {
  MessageSquare,
  Heart,
  EllipsisVertical,
  BookmarkPlus,
  BookmarkMinus,
} from "lucide-react";

const RecentPostCard = ({ post }: { post: Post }) => {
  const navigate = useNavigate();

  return (
    <>
      <div
        className="flex h-40 overflow-hidden rounded transition cursor-pointer"
        key={post.id}
        onClick={() => navigate(`/blog/${post.slug}/${post.author.id}`)}
      >
        {/* Text Section */}
        <div className="w-3/4 p-4 flex flex-col justify-between">
          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage src={post.author.avatar_url} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="text-sm flex items-center text-muted-foreground">
              <span className="p-0 m-0">by</span>
              <HoverCard>
                <HoverCardTrigger>
                  <Button variant="link" className="cursor-pointer px-2">
                    {post.author.username}
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={post.author.avatar_url} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">
                        {post.author.username}
                      </h4>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          {/* Title & Excerpt */}
          <div className="space-y-1">
            <h2 className="text-base font-semibold leading-tight">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          </div>

          {/* Footer: Comments & Likes */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center">
                <p className="text-muted-foreground text-sm">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1 group hover:text-foreground transition-colors">
                <Tooltip>
                  <TooltipTrigger>
                    <MessageSquare
                      size={16}
                      className="transition-colors group-hover:fill-muted cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent>{post.comments} comments</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1 group hover:text-foreground transition-colors">
                <Tooltip>
                  <TooltipTrigger>
                    <Heart
                      size={16}
                      className={`transition-colors group-hover:fill-muted cursor-pointer ${
                        post.liked ? "fill-red-500 border-none" : ""
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{post.likes} likes</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <Tooltip>
                <TooltipTrigger>
                  <BookmarkPlus
                    size={18}
                    className="transition-all group-hover:fill-muted cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>Save</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <EllipsisVertical
                    size={18}
                    className="transition-all group-hover:fill-muted cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>More</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-1/4 flex items-center justify-center">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="h-2/3 w-full object-cover rounded"
          />
        </div>
      </div>
    </>
  );
};

export default RecentPostCard;
