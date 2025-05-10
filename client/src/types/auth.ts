export interface User {
    id: string
    username: string
    role_id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string
    avatar_url: string
}

export interface userData {
    email: string
    password: string
    username: string
    first_name: string
    last_name: string
    phone_number: string
    avatar_url: string
}

export interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    register: (formData: FormData) => Promise<{ success: boolean, message: string | null }>
    login: (email: string, password: string) => Promise<{ success: boolean, message: string | null }>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
}