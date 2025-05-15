import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_SERVER_HOST;

interface getBlogsParams {
    signal?: AbortSignal
    search?: string
    sort_by?: string
    page?: number
    limit?: number
    country?: string
    tag?: string
    author?: string
}

export const getPosts = async (options: getBlogsParams = {}, user_id: string | null) => {
    try {
        const response = await axios.get(`${API_BASE_URL}api/blogs/list`, {
            withCredentials: true,
            signal: options.signal,
            params: {
                search: options.search,
                sort_by: options.sort_by,
                page: options.page,
                limit: options.limit,
                user_id,
                country: options.country,
                tag: options.tag,
                author: options.author
            }
        })
        return response;
    }
    catch (error) {
        if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
            throw new Error("Request canceled");
        }
        throw error;
    }

}

export const getPost = async (id: string, user_id: string | null) => {
    return await axios.get(`${API_BASE_URL}api/blogs/get/${id}`, {
        withCredentials: true,
        params: {
            user_id: user_id
        }
    })
}

export const createPost = async (formData: FormData) => {
    return await axios.post(`${API_BASE_URL}api/blogs/create`, formData, {
        withCredentials: true,
    })
}

export const editPost = async (formData: FormData, id: string) => {
    return await axios.put(`${API_BASE_URL}api/blogs/update/${id}`, formData, {
        withCredentials: true,
    })
}

export const likePost = async (id: string) => {
    return await axios.post(`${API_BASE_URL}api/blogs/like/${id}`, {}, {
        withCredentials: true,
    })
}

export const unlikePost = async (id: string) => {
    return await axios.post(`${API_BASE_URL}api/blogs/unlike/${id}`, {}, {
        withCredentials: true,
    })
}

export const followUser = async (id: string) => {
    return await axios.post(`${API_BASE_URL}api/auth/follow/${id}`, {}, {
        withCredentials: true,
    })
}

export const unfollowUser = async (id: string) => {
    return await axios.post(`${API_BASE_URL}api/auth/unfollow/${id}`, {}, {
        withCredentials: true,
    })
}

export const getProfileWithUsername = async (username: string, user_id: string) => {
    return await axios.get(`${API_BASE_URL}api/auth/profile/${username}`, {
        withCredentials: true,
        params: {
            user_id: user_id
        }
    })
}

export const getPostsByUser = async (id: string) => {
    return await axios.get(`${API_BASE_URL}api/blogs/list/user/${id}`, {
        withCredentials: true,
    })
}