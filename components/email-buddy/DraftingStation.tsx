import React, { useState, useEffect } from 'react';
import ClipboardIcon from '../icons/ClipboardIcon';
import ClipboardCheckIcon from '../icons/ClipboardCheckIcon';
import AlertTriangleIcon from '../icons/AlertTriangleIcon';
import XIcon from '../icons/XIcon';
import { formatMarkdown } from '../../utils/markdownParser';
import { emailBuddySystemPrompt } from '../../prompts';
import { getFriendlyErrorMessage } from '../../utils/errorUtils';
import { generateDraftEmail } from '../../services/aiService';
import { ToneOption } from '../EmailLawBuddy';

interface DraftingStationProps {
    receivedEmail: string;
    initialKeyPoints: string;
    isShowingExample: boolean;
    exampleKeyPoints: string;
    exampleDrafts: Record<ToneOption, string>;
}

const DraftingStation: React.FC<DraftingStationProps> = ({ 
    receivedEmail,
    initialKeyPoints,
    isShowingExample,
    exampleKeyPoints,
    exampleDrafts
}) => {
    const [keyPoints, setKeyPoints] = useState(initialKeyPoints);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [activeDraftTone, setActiveDraftTone] = useState<ToneOption | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (isShowingExample) {
            setKeyPoints(exampleKeyPoints);
            setDrafts(exampleDrafts);
        } else {
            setKeyPoints(initialKeyPoints);
            setDrafts({});
        }
    }, [isShowingExample, initialKeyPoints, exampleKeyPoints, exampleDrafts]);

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleKeyPointsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setKeyPoints(e.target.value);
        setDrafts({});
    };

    const handleGenerateDraft = async (tone: ToneOption) => {
        if (!keyPoints.trim()) {
            setError('Please provide key points before generating a draft.');
            return;
        }

        setIsLoading(true);
        setActiveDraftTone(tone);
        setError(null);

        try {
            const userPrompt = `Please draft a response with the tone "${tone}".

**Original Email Received:**
\`\`\`
${receivedEmail}
\`\`\`

**My Key Points to Include:**
\`\`\`
${keyPoints}
\`\`\`
`;
            
            const result = await generateDraftEmail(userPrompt, emailBuddySystemPrompt);
            // Fix: The new service returns a direct string, not a complex object.
            setDrafts(prev => ({ ...prev, [tone]: result }));
            
        } catch (err: any) {
            // Log the detailed error for debugging purposes.
            console.error("Draft Generation Error:", err);
            // Use the utility to get a user-friendly message and set it in the state.
            setError(getFriendlyErrorMessage(err, 'draft generation', err.status));
        } finally {
            setIsLoading(false);
            setActiveDraftTone(null);
        }
    };
    
    const handleCopy = (text: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            setIsCopied(true);
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="key-points" className="block text-sm font-medium text-gray-300 mb-1">Your Key Points / Desired Outcome (edit if needed)</label>
                <textarea
                    id="key-points"
                    value={keyPoints}
                    onChange={handleKeyPointsChange}
                    placeholder="1. Correct their false statement about X..."
                    className="w-full h-32 p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-shadow duration-200 disabled:opacity-50"
                    aria-label="Your key points for the response"
                    disabled={isLoading}
                />
            </div>
            
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3 animate-fade-in-up-fast" role="alert">
                    <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
                    <p className="flex-grow">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-white" aria-label="Dismiss error message"><XIcon className="w-5 h-5" /></button>
                </div>
            )}

            <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-200">Choose a Response Style:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(['BIFF', 'Grey Rock'] as ToneOption[]).map(tone => (
                        <div key={tone} className="flex flex-col">
                            <button
                                onClick={() => handleGenerateDraft(tone)}
                                disabled={isLoading || !keyPoints.trim()}
                                className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-bold py-2 px-4 rounded-t-lg transition-all duration-200 ease-out disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center w-full"
                            >
                                {isLoading && activeDraftTone === tone ? (
                                     <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Drafting...
                                    </>
                                ) : (
                                    `Generate ${tone} Draft`
                                )}
                            </button>
                             {drafts[tone] && (
                                <div className="p-4 bg-slate-900 border border-t-0 border-slate-700 rounded-b-lg animate-fade-in-up relative">
                                    {isShowingExample && (
                                        <div className="mb-4 p-3 bg-slate-800 border border-amber-500/30 rounded-lg text-xs text-gray-300">
                                            <h5 className="font-bold text-amber-400 mb-1">Why this works ({tone}):</h5>
                                            {tone === 'BIFF' ? (
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li><strong>Brief:</strong> Short and to the point.</li>
                                                    <li><strong>Informative:</strong> Corrects the record and confirms the schedule.</li>
                                                    <li><strong>Friendly:</strong> The tone is neutral and business-like.</li>
                                                    <li><strong>Firm:</strong> Ends the conversation, leaving no room for argument.</li>
                                                </ul>
                                            ) : (
                                                <p>It's extremely short and factual. It offers no emotional reaction for the other person to latch onto, effectively shutting down manipulation.</p>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleCopy(drafts[tone])}
                                        className="absolute top-2 right-2 flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1 px-2 rounded-md transition-all text-xs"
                                        aria-label={`Copy ${tone} draft to clipboard`}
                                    >
                                        {isCopied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
                                        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                    <div 
                                        className="text-gray-300 leading-relaxed prose prose-invert prose-p:my-2 prose-strong:text-amber-400 max-w-none text-sm"
                                        dangerouslySetInnerHTML={{ __html: formatMarkdown(drafts[tone]) }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DraftingStation;
