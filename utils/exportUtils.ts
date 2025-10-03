
/**
 * Creates a text file from a string and initiates a download.
 * @param content The string content for the file.
 * @param filename The desired name of the downloaded file.
 */
export const exportTextFile = (content: string, filename: string): void => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
