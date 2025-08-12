export interface Post {
    id: string
    title: string
    excerpt: string
    content: string
    slug: string
    image_url: string
    created: string
    updated: string | null
    likes: number | null
    comments: number | null
    liked: boolean | null
    country_name: string
    author: UserProfile,
    comment_records: Comment[] | null
}

export interface Comment {
    id: string
    content: string
    created: string
    updated: string
    author: UserProfile
}

export interface UserProfile {
    id: string
    username: string
    avatar_url: string
    bio?: string
    following_count: number
    follower_count: number
    is_following: boolean
    is_followed_by?: boolean
}