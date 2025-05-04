export interface Post {
    id: string
    title: string
    excerpt: string
    slug: string
    imageUrl: string
    date: string
    likes: number
    comments: number
    liked: boolean
    author: {
        id: string
        username: string
        avatar_url: string
    }
}