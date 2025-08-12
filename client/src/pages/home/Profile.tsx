import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/blog";
import {
  followUser,
  getPostsByUser,
  getProfileWithUsername,
  unfollowUser,
} from "@/services/blogService";
// import { getPostsByUser, getFollowingPosts } from "@/services/blogService";
import useAuthStore from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MoreHorizontal } from "lucide-react";
import { getImageUrl } from "@/utils/imageLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileData {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  follow_details: {
    following_count: number;
    follower_count: number;
  };
  created_at: string;
  is_following: boolean;
  posts_count: number;
}

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  // const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"user" | "following">("user");
  const [loading, setLoading] = useState({
    profile: false,
    posts: false,
    follow: false,
  });
  const navigate = useNavigate();

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading((prev) => ({ ...prev, profile: true }));
      const response = await getProfileWithUsername(
        username || "",
        user?.id || ""
      );

      if (response.data.profile) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  // Fetch user's posts
  const fetchUserPosts = async () => {
    try {
      setLoading((prev) => ({ ...prev, posts: true }));
      if (profile) {
        const response = await getPostsByUser(profile.id);
        setUserPosts(response.data.blogs);
      }
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, posts: false }));
    }
  };

  // Fetch posts from users this profile follows
  // const fetchFollowingPosts = async () => {
  //   try {
  //     setLoading((prev) => ({ ...prev, posts: true }));
  //     if (profile) {
  //       const response = await getFollowingPosts(profile.id);
  //       setFollowingPosts(response.data.posts);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch following posts:", error);
  //   } finally {
  //     setLoading((prev) => ({ ...prev, posts: false }));
  //   }
  // };

  // Handle follow/unfollow
  const handleFollowAction = async () => {
    if (!profile || !user) return;

    try {
      setLoading((prev) => ({ ...prev, follow: true }));
      if (profile.is_following) {
        await unfollowUser(profile.id);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                is_following: false,
                follow_details: {
                  ...prev.follow_details,
                  follower_count: prev.follow_details.follower_count - 1,
                },
              }
            : null
        );
      } else {
        await followUser(profile.id);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                is_following: true,
                follow_details: {
                  ...prev.follow_details,
                  follower_count: prev.follow_details.follower_count + 1,
                },
              }
            : null
        );
      }
    } catch (error) {
      console.error("Follow action failed:", error);
    } finally {
      setLoading((prev) => ({ ...prev, follow: false }));
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  useEffect(() => {
    if (profile) {
      fetchUserPosts();
      if (activeTab === "following") {
        // fetchFollowingPosts();
      }
    }
  }, [profile, activeTab]);

  const handleViewPost = (post: Post) => {
    navigate(`/blog/${post.author.username}/${post.slug}/${post.id}`);
  };

  // const handleDeletePost = async (post) => {
  //   try {
  //     await deletePost(post.id);
  //     fetchUserPosts();
  //   } catch (error) {
  //     console.error("Failed to delete post:", error);
  //   }
  // };

  const handleEditPost = (post: Post) => {
    navigate(`/blog/edit/${post.id}`);
  };

  if (loading.profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Profile not found</p>
      </div>
    );
  }

  const isCurrentUser = user?.id === profile.id;
  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
        <div className="flex-shrink-0">
          <Avatar className="w-32 h-32">
            <AvatarImage src={getImageUrl(profile.avatar_url)} />
            <AvatarFallback>
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              {fullName && <p className="text-gray-600">{fullName}</p>}
            </div>

            {!isCurrentUser && (
              <Button
                onClick={handleFollowAction}
                disabled={loading.follow}
                variant={profile.is_following ? "outline" : "default"}
                className="w-full md:w-auto"
              >
                {loading.follow ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {profile.is_following ? "Following" : "Follow"}
              </Button>
            )}
          </div>

          <div className="flex gap-6 mb-4">
            <div>
              <span className="font-semibold">
                {profile.follow_details.follower_count}
              </span>
              <span className="text-gray-600 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-semibold">
                {profile.follow_details.following_count}
              </span>
              <span className="text-gray-600 ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold">{profile.posts_count}</span>
              <span className="text-gray-600 ml-1">Posts</span>
            </div>
          </div>

          {profile.phone_number && (
            <p className="text-gray-500 text-sm">
              Phone: {profile.phone_number}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer transition-all delay-75 ${
              activeTab === "user"
                ? "border-gray-500 text-gray-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("user")}
          >
            User Posts
          </button>
          {isCurrentUser && (
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer transition-all delay-75 ${
                activeTab === "following"
                  ? "border-gray-500 text-gray-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("following")}
            >
              Following's Posts
            </button>
          )}
        </div>
      </div>

      {/* Posts */}
      {loading.posts ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="w-full flex flex-col">
          {activeTab === "user" ? (
            userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post.id}>
                  <div className="w-full flex justify-between gap-1 p-1">
                    <div className="flex gap-1">
                      <img
                        src={getImageUrl(post.image_url)}
                        alt={post.title}
                        className="w-8 h-8 rounded"
                      />
                      <div className="text-sm flex items-center text-muted-foreground">
                        <span className="font-semibold px-1">{post.title}</span>
                      </div>
                    </div>
                    <div className="">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isCurrentUser && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleEditPost(post)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {}}
                              >
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleViewPost(post)}
                          >
                            View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-8">
                No posts yet
              </p>
            )
          ) : (
            <p className="text-gray-500 col-span-full text-center py-8">
              {profile.follow_details.following_count === 0
                ? "Not following anyone yet"
                : "No posts from followed users"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
