
/**
 * Cleans a markdown string to make it more suitable for text-to-speech.
 * Removes formatting like bold, italics, code, lists, and links.
 * @param markdownText The markdown string to clean.
 * @returns A plain text string.
 */
export const cleanMarkdownForSpeech = (markdownText: string): string => {
    // Basic markdown removal for better speech flow
    return markdownText
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/(\*|\+|-)\s/g, '')
        .replace(/---|===/g, '')
        .replace(/\|/g, ', ')
        .trim();
};

/**
 * Cleans a draft email string for text-to-speech.
 * Removes the subject line and placeholder brackets.
 * @param emailText The email draft string.
 * @returns A plain text string.
 */
export const cleanEmailForSpeech = (emailText: string): string => {
    return emailText
        .replace(/Subject: Re: .*\n\n/i, '')
        .replace(/\[(.*?)\]/g, '$1')
        .trim();
};
