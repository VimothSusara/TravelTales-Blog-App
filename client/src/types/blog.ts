export interface Post {
    id: string
    title: string
    excerpt: string
    content: string
    slug: string
    image_url: string
    created: string
    updated: string
    likes: number | 0 | null
    comments: number | 0 | null
    liked: boolean | null
    country_name: string
    author: {
        id: string
        username: string
        avatar_url: string
    }
}