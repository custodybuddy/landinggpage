import React from 'react';
import DownloadIcon from '../icons/DownloadIcon';
import SpeakerIcon from '../icons/SpeakerIcon';
import StopCircleIcon from '../icons/StopCircleIcon';
import { formatMarkdown } from '../../utils/markdownParser';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

interface AnalysisResultProps {
    response: string;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ response }) => {
    const { isSpeaking, speak, cancel } = useTextToSpeech();
    
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

    const cleanTextForSpeech = (markdownText: string) => {
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

    const handleReadAloud = () => {
        if (isSpeaking) {
            cancel();
        } else {
            const plainText = cleanTextForSpeech(response);
            speak(plainText);
        }
    };

    return (
        <div className="mt-4 p-6 bg-slate-900 border border-slate-700 rounded-lg animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-amber-400">AI Analysis</h3>
                 <div className="flex items-center gap-2">
                    <button
                        onClick={handleReadAloud}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 transform motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0"
                        aria-label={isSpeaking ? "Stop reading analysis" : "Read analysis aloud"}
                    >
                        {isSpeaking ? <StopCircleIcon className="w-4 h-4" /> : <SpeakerIcon className="w-4 h-4" />}
                        <span>{isSpeaking ? 'Stop' : 'Read Aloud'}</span>
                    </button>
                    <button
                        onClick={handleExportAnalysis}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 transform motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0"
                        aria-label="Export analysis as a text file"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                 </div>
            </div>
            <div 
                className="text-gray-300 leading-relaxed prose prose-invert prose-p:my-2 prose-ul:my-2 prose-strong:text-amber-400 max-w-none"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(response) }}
            />
        </div>
    );
};

export default AnalysisResult;
