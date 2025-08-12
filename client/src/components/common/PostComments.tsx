import { Post } from "@/types/blog";

const PostComments = ({ post }: { post: Post }) => {

  return (
    <>
      <div className="">
        <div className="text-[0.8rem] text-muted-foreground">
          {post?.comments} comments
        </div>
      </div>
    </>
  );
};

export default PostComments;
