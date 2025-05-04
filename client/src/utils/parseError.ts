//helper function for api error handling

import { ApiError } from "@/types/api";
import { ErrorResponse } from "@/types/error";

export function parseApiError(error: unknown, fallbackMessage = 'Something went wrong!'): ErrorResponse {
    const err = error as ApiError
    const message =
        err?.response?.data?.message ||
        err?.message ||
        fallbackMessage;

    return {
        error: err,
        message,
    };
}