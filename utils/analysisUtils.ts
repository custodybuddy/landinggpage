import { fileToDataUrl, pdfToText } from './fileUtils';

// Fix: Replaced prepareOpenAIMessages with prepareContentParts for Gemini API compatibility.
/** Prepares the content parts for the Gemini API request from files and a text query. */
export const prepareContentParts = async (files: File[], query: string): Promise<any[]> => {
    const parts: any[] = [];
    
    // Add image parts first.
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            const dataUrl = await fileToDataUrl(file);
            // Extract pure Base64 data from the data URL.
            const base64Data = dataUrl.split(',')[1];
            parts.push({
                inlineData: {
                    mimeType: file.type,
                    data: base64Data
                }
            });
        }
    }
    
    let combinedText = '';
    // Aggregate all text-based content into a single string.
    for (const file of files) {
        if (file.type === 'application/pdf') {
            const extractedText = await pdfToText(file);
            combinedText += `\n\n--- START OF DOCUMENT: ${file.name} ---\n\n${extractedText}\n\n--- END OF DOCUMENT: ${file.name} ---\n\n`;
        }
    }

    if (query.trim()) {
        combinedText += `\n\n--- START OF PASTED TEXT ---\n\n${query}\n\n--- END OF PASTED TEXT ---\n\n`;
    }

    // Add the text part last, as it often contains the primary prompt.
    if (combinedText.trim()) {
        parts.push({ text: combinedText });
    }

    // If there are only images but no initial text prompt, add a default one.
    if (parts.length > 0 && !parts.some(p => p.text)) {
        parts.push({ text: 'Please extract and analyze the content of the attached image(s) based on your instructions.' });
    }
    
    return parts;
};