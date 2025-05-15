import { Comment, Post } from "@/types/blog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/utils/imageLink";
import { format } from "date-fns";
import { useState } from "react";

const PostComments = ({ post }: { post: Post }) => {
  const [comments, setComments] = useState<Comment[]>([]);

  return (
    <>
      <div className=""></div>
    </>
  );
};

export default PostComments;
