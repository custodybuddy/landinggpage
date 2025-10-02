import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ClipboardIcon from './icons/ClipboardIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';

const EXAMPLE_RECEIVED_EMAIL = `Subject: Lily's weekend

You were 15 minutes late dropping Lily off on Sunday. This is completely unacceptable and you're clearly doing it on purpose to take time away from me. If you can't be bothered to respect my time or the court order, maybe you shouldn't be seeing her at all. I'm not going to tolerate this kind of manipulation. Also, you forgot to pack her favorite unicorn sweater and she was devastated. You need to be more organized. I'll be picking her up at 5pm sharp on Friday, don't be late.`;

const EXAMPLE_KEY_POINTS = `1. Acknowledge I was late, but it was due to a major accident on the highway.
2. The unicorn sweater was in her bag, she probably just missed it.
3. Agree to the 5pm pickup time.`;

const EXAMPLE_GENERATED_DRAFT = `Subject: Re: Lily's weekend

Hi [Co-parent's Name],

Thanks for the email.

Noted regarding the drop-off time on Sunday. My apologies for the delay; there was an unexpected highway closure due to an accident. I have a photo of the traffic alert if needed.

I've double-checked, and Lily's unicorn sweater was packed in the side pocket of her purple backpack.

Confirming Friday's pickup at 5:00 PM.

Best,

[Your Name]`;

const EmailLawBuddy: React.FC = () => {
    const [receivedEmail, setReceivedEmail] = useState('');
    const [keyPoints, setKeyPoints] = useState('');
    const [generatedResponse, setGeneratedResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleGenerate = async () => {
        if (!receivedEmail.trim() || !keyPoints.trim()) {
            setError('Please fill in both fields to generate a response.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedResponse('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemPrompt = `**SYSTEM INSTRUCTION:**
You are an AI communication assistant for CustodyBuddy.com. Your expertise is in drafting professional, non-emotional email responses for high-conflict co-parenting situations.

**YOUR GOAL:**
Rewrite the user's message into a legally sound, emotionally neutral email. The primary objective is to create a clear, factual record for court while de-escalating conflict.

**METHODOLOGY (Non-negotiable):**
You MUST strictly adhere to the "BIFF" response method:
*   **Brief:** Keep it concise. 3-5 sentences is ideal. Do not ramble.
*   **Informative:** Stick to objective facts. Address the issue directly and avoid opinions or feelings.
*   **Friendly:** Maintain a neutral, polite, and business-like tone. Use a simple greeting and closing.
*   **Firm:** State the user's position or a proposed solution clearly, without being aggressive. The response should end the conversation, not invite more conflict.

**CRITICAL RULES:**
*   **NO JADE:** You MUST NOT Justify, Argue, Defend, or Explain excessively. Avoid getting into debates.
*   **NO EMOTION:** Remove all accusatory, sarcastic, emotional, and defensive language from the user's points and the original email.
*   **FOCUS ON THE CHILD:** If applicable, frame the issue around the child's best interests.
*   **CREATE A RECORD:** The final draft should be something a judge could read that makes the sender look reasonable, organized, and calm.

**INPUTS:**
1.  **Original Email:** The email received by the user from their co-parent.
2.  **User's Key Points:** The essential information the user wants to communicate.

**OUTPUT:**
Produce ONLY the email draft as your response. Do not include any commentary before or after the draft. Start with "Subject: Re: [Original Subject]" and end with the user's sign-off.`;

            const userPrompt = `Please draft a BIFF response.

**Original Email Received:**
\`\`\`
${receivedEmail}
\`\`\`

**My Key Points to Include:**
\`\`\`
${keyPoints}
\`\`\`
`;
            
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                },
            });

            setGeneratedResponse(result.text);

        } catch (err) {
            console.error("Generation Error:", err);
            setError('An unexpected error occurred while generating the draft. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedResponse) {
            navigator.clipboard.writeText(generatedResponse);
            setIsCopied(true);
        }
    };

    const showExample = () => {
        setReceivedEmail(EXAMPLE_RECEIVED_EMAIL);
        setKeyPoints(EXAMPLE_KEY_POINTS);
        setGeneratedResponse(EXAMPLE_GENERATED_DRAFT);
        setError(null);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center gap-4">
                <p className="text-gray-300 text-sm sm:text-base">
                    Paste a toxic email, provide your key points, and our AI will draft a professional, court-ready response.
                </p>
                <button 
                    onClick={showExample}
                    className="text-sm text-amber-400 hover:text-amber-300 font-semibold transition-all duration-200 ease-out whitespace-nowrap transform motion-safe:hover:scale-105 motion-safe:active:scale-95"
                    aria-label="Show an example draft"
                >
                    See Example
                </button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="received-email" className="block text-sm font-medium text-gray-300 mb-1">Email from your Ex</label>
                    <textarea
                        id="received-email"
                        value={receivedEmail}
                        onChange={(e) => setReceivedEmail(e.target.value)}
                        placeholder="Paste the full text of the email you received here..."
                        className="w-full h-36 p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-shadow duration-200 disabled:opacity-50"
                        aria-label="Email received from co-parent"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="key-points" className="block text-sm font-medium text-gray-300 mb-1">Your Key Points / Desired Outcome</label>
                    <textarea
                        id="key-points"
                        value={keyPoints}
                        onChange={(e) => setKeyPoints(e.target.value)}
                        placeholder="1. Correct their false statement about X.
2. Confirm the pickup time is Y.
3. Propose solution Z for the disagreement."
                        className="w-full h-36 p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-shadow duration-200 disabled:opacity-50"
                        aria-label="Your key points for the response"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-sm rounded-lg p-3 animate-fade-in-up-fast">
                    {error}
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={isLoading || !receivedEmail.trim() || !keyPoints.trim()}
                className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 ease-out motion-safe:hover:scale-105 motion-safe:active:scale-100 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Drafting...
                    </>
                ) : (
                    'Generate Draft'
                )}
            </button>

            {generatedResponse && (
                <div className="mt-4 p-6 bg-slate-900 border border-slate-700 rounded-lg animate-fade-in-up relative">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-amber-400">Generated Draft</h3>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            aria-label="Copy draft to clipboard"
                        >
                            {isCopied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
                            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                    <pre className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans bg-slate-800 p-4 rounded-md">
                        {generatedResponse}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default EmailLawBuddy;
