import { useEffect, useState } from "react";
import { getPost } from "@/services/blogService";
import { Post } from "@/types/blog";
import useAuthStore from "@/store/authStore";

const useBlogPost = (blogId: string | undefined) => {
    const { user } = useAuthStore();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);

        if (!blogId) return;

        const fetchPost = async () => {
            try {
                console.log("User ID: ", user?.id);
                const response = await getPost(blogId, user ? user?.id : null);
                setPost(response.data.blog);
            } catch (error : any) {
                setError(error.message ||"Failed to fetch post. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [blogId])

    return { post, loading, error }
}

export default useBlogPost