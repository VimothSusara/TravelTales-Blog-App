import PostCard from "@/components/cards/PostCard";

const RecentPosts = () => {
  const posts = Array.from({ length: 30 }).map((_, i) => ({
    id: `post-${i + 1}`,
    title: `Post Title ${i + 1}`,
    excerpt: `This is a brief excerpt from post ${
      i + 1
    } that gives users a preview of the content...`,
    slug: `post-${i + 1}`,
    image_url: `https://picsum.photos/id/${i}/200/300`,
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 100),
    liked: Math.random() > 0.5 ? true : false,
    author: {
      id: `author-${i + 1}`,
      username: `username${i + 1}`,
      avatar_url: `https://i.pravatar.cc/150?u=${i + 1}`,
    },
  }));

  return (
    <div className="w-full md:w-5/6 mx-auto grid grid-cols-1 gap-2 md:gap-4 p-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default RecentPosts;
