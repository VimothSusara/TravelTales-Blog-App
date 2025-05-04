//components
import RecommendedPostCard from "@/components/cards/RecommendedPostCard";

const RecommendedSection = () => {
  const posts = Array.from({ length: 4 }).map((_, i) => ({
    id: `post-${i + 1}`,
    title: `Post Title ${i + 1}`,
    excerpt: `This is a brief excerpt from post ${
      i + 1
    } that gives users a preview of the content...`,
    slug: `post-${i + 1}`,
    imageUrl: `https://picsum.photos/id/${i}/200/300`,
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
    <>
      <h2 className="text-lg font-semibold mb-2">Recommended</h2>
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <RecommendedPostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
};

export default RecommendedSection;
