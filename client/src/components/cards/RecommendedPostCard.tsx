//types
import { Post } from "@/types/blog";

import { format } from "date-fns";

//image Url
import { getImageUrl } from "@/utils/imageLink";

//components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const RecommendedPostCard = ({ post }: { post: Post }) => {
  return (
    <>
      <div className="w-full flex flex-col gap-1 p-1">
        <div className="flex gap-1">
          <Avatar size="sm">
            <AvatarImage src={getImageUrl(post.author.avatar_url)} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="text-sm flex items-center text-muted-foreground">
            <span className="font-semibold px-1">{post.author.username}</span>
          </div>
        </div>
        <div className="text font-bold">
          {post.title.length > 30
            ? `${post.title.slice(0, 30)}...`
            : post.title}
        </div>
        <div className="text-[.8rem] text-muted-foreground">
          {format(post.created, "PPP")}
        </div>
      </div>
    </>
  );
};

export default RecommendedPostCard;
