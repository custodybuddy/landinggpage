import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import XIcon from './icons/XIcon';
import FileTextIcon from './icons/FileTextIcon';
import RotateCwIcon from './icons/RotateCwIcon';
import DownloadIcon from './icons/DownloadIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

// A robust markdown-to-HTML converter for the expected AI response format.
const formatMarkdown = (text: string): string => {
    // This helper for inline formatting handles bold, italic, and code.
    const processInlineFormatting = (str: string): string => {
        // Process in order of complexity to avoid conflicts (e.g., ** before *)
        return str
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + Italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')       // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>')         // Italic
            .replace(/_([^_]+)_/g, '<em>$1</em>')       // Italic (underscore)
            .replace(/`([^`]+)`/g, '<code class="bg-slate-700 text-amber-300 px-1 py-0.5 rounded text-sm font-mono">$1</code>'); // Inline code
    };

    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let inCodeBlock = false;
    let codeBlockContent = '';

    for (const line of lines) {
        // --- 1. Handle Code Blocks ---
        // They are self-contained and override other formatting.
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) { // Closing fence
                const escapedCode = codeBlockContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                html += `<pre class="bg-slate-950 p-4 rounded-md overflow-x-auto"><code class="text-white text-sm font-mono">${escapedCode.trim()}</code></pre>`;
                inCodeBlock = false;
                codeBlockContent = '';
            } else { // Opening fence
                if (inList) { // If a list was open, close it first.
                    html += '</ul>';
                    inList = false;
                }
                inCodeBlock = true;
            }
            continue; // Move to next line
        }

        if (inCodeBlock) {
            codeBlockContent += line + '\n';
            continue;
        }

        // --- 2. Handle List Items ---
        if (line.trim().startsWith('* ')) {
            if (!inList) {
                html += '<ul class="list-disc pl-6 space-y-2">';
                inList = true;
            }
            // Add the list item, processing inline formats on its content
            html += `<li>${processInlineFormatting(line.trim().substring(2))}</li>`;
        } 
        // --- 3. Handle Paragraphs and Other Lines ---
        else {
            if (inList) {
                // Any non-list-item line will terminate the current list.
                html += '</ul>';
                inList = false;
            }
            if (line.trim()) {
                // If the line has content, wrap it in a paragraph tag.
                html += `<p>${processInlineFormatting(line)}</p>`;
            }
            // Blank lines effectively just add a separation by closing the list.
        }
    }

    // --- 4. Cleanup ---
    // Ensure any open tags are closed at the end of the text.
    if (inList) {
        html += '</ul>';
    }
    if (inCodeBlock) { // Failsafe for unclosed code block
        const escapedCode = codeBlockContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html += `<pre class="bg-slate-950 p-4 rounded-md overflow-x-auto"><code class="text-white text-sm font-mono">${escapedCode.trim()}</code></pre>`;
    }

    return html;
};

const EXAMPLE_INPUT = `Clause 7.2 from Separation Agreement:

"The parties shall share parenting time with the child, Lily Chen, on a week-on/week-off basis, with exchanges taking place on Fridays at 6:00 PM at the Starbucks located at 123 Main Street. The receiving parent shall be responsible for transportation from the exchange point. Any proposed changes to the schedule must be communicated in writing via email at least 14 days in advance and mutually agreed upon."`;

const EXAMPLE_RESPONSE_MARKDOWN = `**Document Type:** Separation Agreement Clause

**Plain English Summary:** This clause sets out the weekly custody schedule for your child, Lily. It specifies when and where you will exchange her with the other parent and who is responsible for pickup. It also explains how to request changes to this schedule.

**Key Clauses & Obligations:**
* **Schedule:** You have a "week-on/week-off" schedule.
* **Exchange Time & Place:** Exchanges are every Friday at 6:00 PM at the Starbucks on 123 Main Street.
* **Transportation:** The parent who is starting their week with Lily is responsible for picking her up from Starbucks.
* **Changes:** To change the schedule, you must email the other parent at least 2 weeks (14 days) beforehand, and you both must agree to the change in writing.

**Potential Discrepancies & Flags:**
* **Ambiguity:** The term "week-on/week-off" is clear, but it doesn't specify a start date. Make sure this is defined elsewhere in the agreement.
* **Flexibility:** The 14-day notice period for changes is quite strict and might not be practical for unexpected events.
* **Conflict Point:** A public place like Starbucks can be busy and potentially stressful for a child during an exchange.

**Suggested Next Steps:**
* **Clarify Start Date:** If not already defined, confirm the official start date for the week-on/week-off schedule with the other parent via email.
* **Document Everything:** Keep a written record of every exchange time and date. If the other parent is late, note that down.
* **Propose Alternatives:** You might consider suggesting a more neutral or private exchange location in the future if Starbucks proves difficult.

Disclaimer: This is an AI-generated analysis and does not constitute legal advice. It is for informational purposes only. You should consult with a qualified legal professional for advice on your specific situation.`;

const UploadCloudIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
    </svg>
);

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

const getFriendlyErrorMessage = (error: unknown): string => {
    let friendlyMessage = 'An unexpected error occurred while analyzing your document. Please click "Retry" or try again later.';

    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('api key')) {
            friendlyMessage = 'The analysis service is currently unavailable due to a configuration issue. Please try again later or contact support.';
        } else if (message.includes('fetch') || error.name === 'TypeError') {
            friendlyMessage = 'A network error occurred. Please check your internet connection and click "Retry".';
        } else if (message.includes('safety') || message.includes('blocked')) {
            friendlyMessage = 'Your document could not be analyzed due to content safety restrictions. Please review the document for sensitive personal information or inappropriate material and try again.';
        }
    }
    
    return friendlyMessage;
};

const CaseAnalysisTool: React.FC = () => {
    const [query, setQuery] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isShowingExample, setIsShowingExample] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [justDropped, setJustDropped] = useState(false);

    const handleAnalyze = async () => {
        if (!query.trim() && !file) {
            setError('Please paste text or upload a document to analyze.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResponse('');
        setIsShowingExample(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const systemPrompt = `
**SYSTEM INSTRUCTION:**
You are an AI legal document analysis tool for CustodyBuddy.com, designed for self-represented parents in Canada involved in high-conflict family law cases. Your primary function is to analyze legal and quasi-legal documents (like court orders, separation agreements, or difficult emails) and provide informational breakdowns. You must not provide legal advice.

**TASK:**
Analyze the document content provided by the user. Structure your response using markdown for clarity (e.g., **bolding**, * bullet points). Provide the following sections:

1.  **Document Type:** Identify the likely type of document (e.g., "Email Correspondence," "Court Order," "Separation Agreement Clause").
2.  **Plain English Summary:** Briefly explain what the document is about and its main purpose in simple, easy-to-understand language.
3.  **Key Clauses & Obligations:** Extract and list the most important points, clauses, or obligations mentioned. For each point, explain what it means for the user (e.g., "You are required to...", "The other parent must..."). Use bullet points for lists.
4.  **Potential Discrepancies & Flags:** Your most critical task is to identify conflicts and contradictions. Carefully review the text for any statements, dates, or obligations that conflict with each other or with previously stated facts. For each flag, explain *why* it's a potential issue for a self-represented parent. This includes:
    *   **TOP PRIORITY - Contradictions & Conflicting Information:** Scrutinize the document for anything that conflicts. For example, does an email from the co-parent contradict a previous email or a clause in a court order? You MUST clearly state the conflict. For example: "There is a direct conflict: Clause A of the Separation Agreement states pickup is at 5:00 PM, but the email from Jane Doe on June 15, 2024, states it is now at 6:00 PM. These are conflicting instructions and this is crucial evidence of unilateral changes."
    *   **Legal Jargon:** Identify any legal terms (e.g., "without prejudice," "joint legal custody," "right of first refusal"). For each term: 1) Explain it in simple terms. 2) Explain *why* it can be confusing or misinterpreted by a non-lawyer (e.g., "People often think 'joint custody' means 50/50 time, but it usually refers to decision-making"). 3) You MUST suggest a specific, polite, and actionable question the user can send via email to get a written clarification. The question should be designed to get a very specific answer, not a vague one. For example: "For the term 'joint legal custody', suggest the user ask: 'To ensure we are on the same page regarding 'joint legal custody' in clause X, does this mean we must mutually agree in writing on all major decisions (health, education, religion), or does it mean one parent can make a decision after informing the other?'"
    *   **Ambiguity:** Pinpoint vague language (e.g., "reasonable access," "in a timely manner") that could be misinterpreted and lead to conflict. Suggest what needs to be clarified (e.g., "Does 'reasonable' mean 24 hours notice or 2 hours?").
    *   **Unusual or Onerous Clauses:** Highlight clauses that seem one-sided, unusually strict, or hard to comply with.
    *   **Action Items & Deadlines:** Clearly list any deadlines or actions the user must take.
5.  **Suggested Next Steps:** Based *only* on the flagged issues, provide specific, actionable next steps that are practical for a self-represented person and focus on creating clear evidence.
    *   **If a conflict is flagged:** This is a key piece of evidence. Your goal is to make the conflict impossible to ignore. Provide detailed instructions on how to present it effectively in a legal context. For example: "To present this contradiction clearly in court or mediation, create a 'Conflict Log' or a timeline. This is far more powerful than just describing it. Here’s how you can structure it:
        **Example Conflict Table:**
        | Date       | Document/Source                                | Stated Term/Instruction                                 | Contradiction                                                                   |
        | :--------- | :--------------------------------------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------ |
        | Jan 5, 2024| Court Order, Clause 7.2                        | "Exchanges take place on Fridays at **6:00 PM**."      | Establishes the official, legally binding time.                                 |
        | Feb 12, 2024| Email from [Co-parent's Name]                  | "I will be picking up Lily at **6:30 PM** this Friday." | This is a unilateral change that contradicts the Court Order.                    |
        | Feb 19, 2024| Text Message from [Co-parent's Name]           | "Running late, will be there at **7:00 PM**."          | This shows a pattern of not adhering to the schedule, even their own changed one. |

        **Instructions for you:** Create this table. Save all related documents (the order, emails, screenshots of texts) and label them clearly (e.g., 'Exhibit A: Court Order re: Exchange Times', 'Exhibit B: Feb 12 Email from [Name]', 'Exhibit C: Feb 19 Text from [Name]'). This creates an organized, compelling evidence package."
    *   If a deadline is flagged: "Immediately create a calendar reminder for the [Date] deadline to [Action]."
    *   If jargon is flagged: "Send a polite email asking for clarification on '[Jargon Term]' to ensure you both have the same understanding. This creates a written record of your attempt to clarify."
    *   If ambiguity is flagged: "Propose a more specific definition via email. For example: 'Regarding 'reasonable access,' can we agree this means a minimum of 24 hours notice?' This shows you are being proactive and creates a paper trail."
    *   If an obligation is mentioned: "Start a specific log or folder to track [obligation]. For example, if you are required to share medical receipts, keep digital copies in a folder named 'Medical Receipts for [Child's Name] - [Year]'."
6.  **IMPORTANT DISCLAIMER:** You must conclude your entire response with the following exact, unmodified text: "Disclaimer: This is an AI-generated analysis and does not constitute legal advice. It is for informational purposes only. You should consult with a qualified legal professional for advice on your specific situation."
`;
            
            const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [];

            if (file) {
                const base64Data = await fileToBase64(file);
                parts.push({
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data,
                    }
                });
                if (file.type.startsWith('image/')) {
                    parts.push({ text: "Please extract the text from the attached image of a document and then analyze it." });
                } else {
                    parts.push({ text: "Please analyze the attached document." });
                }
            } else {
                parts.push({ text: `**USER'S DOCUMENT TO ANALYZE:**\n${query}` });
            }

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts },
                config: {
                    systemInstruction: systemPrompt,
                },
            });
            
            setResponse(result.text);

        } catch (err) {
            console.error("Analysis Error:", err);
            setError(getFriendlyErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const processFile = (selectedFile: File) => {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Invalid file type. Please upload a PDF, DOCX, JPG, or PNG file.');
            clearFile();
            return;
        }
        const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > maxSizeInBytes) {
            setError(`File is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`);
            clearFile();
            return;
        }

        setJustDropped(true);
        setTimeout(() => setJustDropped(false), 500);

        setFile(selectedFile);
        setQuery('');
        setError(null);
        setResponse('');
        setIsShowingExample(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleExportAnalysis = () => {
        if (!response) return;

        const blob = new Blob([response], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `CustodyBuddy-Analysis-${date}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(e.target.value);
        if (file) {
            clearFile();
        }
        if (isShowingExample) {
            setResponse('');
            setIsShowingExample(false);
        }
    };

    const showExample = () => {
        setIsShowingExample(true);
        clearFile();
        setQuery(EXAMPLE_INPUT);
        setResponse(EXAMPLE_RESPONSE_MARKDOWN);
        setError(null);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLoading || !!query.trim() || !!file) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    
        if (isLoading || !!query.trim() || !!file) return;
    
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            processFile(droppedFiles[0]);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center gap-4">
                <p className="text-gray-300 text-sm sm:text-base">
                    Upload a file or paste text from a court order or email below. Our AI will highlight key clauses and suggest next steps.
                </p>
                <button 
                    onClick={showExample}
                    className="text-sm text-amber-400 hover:text-amber-300 font-semibold transition-all duration-200 ease-out whitespace-nowrap transform motion-safe:hover:scale-105 motion-safe:active:scale-95"
                    aria-label="Show an example analysis"
                >
                    See Example
                </button>
            </div>

            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ease-out
                    ${justDropped ? '!border-green-500 bg-green-900/20' :
                      isDragging ? 'border-amber-400 bg-slate-800 scale-105' : 'border-slate-700'}
                    ${(!!query.trim() || !!file) ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-400'}`}
            >
                <input
                    id="file-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.jpeg,.jpg,.png,.webp"
                    onChange={handleFileChange}
                    disabled={isLoading || !!query.trim() || !!file}
                    aria-label="Upload a document for analysis"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                    {justDropped ? <CheckCircleIcon /> : <UploadCloudIcon />}
                    <p className={`mt-2 font-semibold transition-colors duration-200 ${justDropped ? 'text-green-400' : 'text-white'}`}>
                        {justDropped ? 'File Accepted!' : isDragging ? 'Drop your file here' : 'Click or drag & drop a document'}
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOCX, JPG, PNG (Max 10MB)</p>
                </div>
            </div>

            {file && (
                <div className="flex items-center justify-between bg-slate-700 p-3 rounded-lg text-sm animate-fade-in-up-fast border border-slate-600 shadow-md">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <FileTextIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <span className="text-gray-200 truncate font-medium" aria-label={`Selected file: ${file.name}`}>{file.name}</span>
                        <span className="text-gray-400 text-xs flex-shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                        onClick={clearFile}
                        className="text-gray-400 hover:text-white transition-all duration-200 ease-out flex-shrink-0 ml-2 disabled:opacity-50 transform motion-safe:hover:scale-110 motion-safe:active:scale-95"
                        aria-label="Remove selected file"
                        disabled={isLoading}
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="flex items-center">
                <hr className="flex-grow border-slate-700" />
                <span className="px-4 text-gray-400 font-semibold text-sm">OR</span>
                <hr className="flex-grow border-slate-700" />
            </div>

            <textarea
                value={query}
                onChange={handleQueryChange}
                placeholder="Paste the full text of your legal document or an email from your ex here for analysis..."
                className="w-full h-48 p-4 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Case document text input"
                disabled={isLoading || !!file}
            />
            
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-sm rounded-lg p-3 flex items-center justify-between gap-4 animate-fade-in-up-fast">
                    <p>{error}</p>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-800 transform motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0"
                        aria-label="Retry Analysis"
                    >
                        <RotateCwIcon className="w-4 h-4" />
                        <span>Retry</span>
                    </button>
                </div>
            )}
            
            <button
                onClick={handleAnalyze}
                disabled={isLoading || (!query.trim() && !file)}
                className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 ease-out motion-safe:hover:scale-105 motion-safe:active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </>
                ) : (
                    'Analyze Document'
                )}
            </button>

            {response && (
                <div className="mt-4 p-6 bg-slate-900 border border-slate-700 rounded-lg animate-fade-in-up">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-xl font-bold text-amber-400">AI Analysis</h3>
                         <button
                            onClick={handleExportAnalysis}
                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 transform motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0"
                            aria-label="Export analysis as a text file"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            <span>Export</span>
                        </button>
                    </div>
                    <div 
                        className="text-gray-300 leading-relaxed prose prose-invert prose-p:my-2 prose-ul:my-2 prose-strong:text-amber-400 max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(response) }}
                    />
                </div>
            )}
        </div>
    );
};

export default CaseAnalysisTool;