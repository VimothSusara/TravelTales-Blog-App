import { ApiError } from '@/types/api';

export interface ErrorResponse {
    error: ApiError;
    message: string;
}