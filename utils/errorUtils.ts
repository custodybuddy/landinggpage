/**
 * Returns a user-friendly error message based on an error from an API call.
 * This function inspects the HTTP status code and error message for keywords 
 * to provide more specific and actionable feedback to the user.
 * @param error - The error object caught from a try/catch block.
 * @param context - A string describing the action that failed (e.g., "document analysis").
 * @param status - The optional HTTP status code from the API response.
 * @returns A user-friendly error string.
 */
export const getFriendlyErrorMessage = (error: unknown, context: string, status?: number): string => {
    const defaultMessage = `An unexpected error occurred during ${context}. Please try again later.`;

    // Prioritize specific HTTP status codes for clear, actionable messages.
    if (status) {
        switch (status) {
            case 401:
                return `Authentication Error (${status}): The AI service is not configured correctly. Please contact support if this issue persists.`;
            case 429:
                return `Too Many Requests (${status}): The AI service is experiencing high traffic. Please wait a moment before trying again.`;
            case 500:
            case 502:
            case 503:
            case 504:
                return `Server Error (${status}): The AI service is temporarily unavailable. Please try again in a few minutes.`;
        }
    }

    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Network errors don't have a status code.
        if (message.includes('failed to fetch') || error.name === 'TypeError') {
            return 'Network Error: Please check your internet connection and try again.';
        }

        // OpenAI's content moderation often returns a 400 status, so we check the message.
        if (message.includes('safety') || message.includes('content_policy')) {
            return `Content Moderation: Your request was blocked by safety filters. Please revise your input and try again.`;
        }
        
        // For other client-side errors (e.g., 400 Bad Request), show the API's message.
        if (status && status >= 400 && status < 500) {
             return `API Error (${status}): ${error.message}. Please check your input.`;
        }

        // Fallback for other errors, showing the specific message if available.
        return `An error occurred during ${context}: ${error.message}`;
    }

    return defaultMessage;
};
