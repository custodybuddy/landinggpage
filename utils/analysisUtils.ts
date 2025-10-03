/** Converts an image File object to a Base64 data URL. */
export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

/** Extracts text content from a PDF file using pdf.js. */
export const pdfToText = (file: File): Promise<string> => {
    // This function relies on the pdf.js library being loaded globally from a CDN.
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) {
        return Promise.reject(new Error("PDF library is not loaded."));
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument({ data: reader.result });
                const pdf = await loadingTask.promise;
                let textContent = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const text = await page.getTextContent();
                    textContent += text.items.map((item: any) => item.str).join(' ');
                    if (i < pdf.numPages) {
                        textContent += '\n\n--- Page Break ---\n\n';
                    }
                }
                resolve(textContent);
            } catch (error) {
                console.error('Error parsing PDF:', error);
                reject(new Error('Failed to parse PDF. It may be corrupted or password-protected.'));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};

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
