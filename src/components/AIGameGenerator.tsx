import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Card } from './ui/Card';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface Props {
  topic?: string;
  constraint1?: string;
  constraint2?: string;
  constraint3?: string;
  classType?: string;
}

export function AIGameGenerator({ topic, constraint1, constraint2, constraint3, classType }: Props) {
  const [suggestion, setSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateGame = async () => {
    setIsGenerating(true);
    setError('');
    setSuggestion('');
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your deployment environment or .env file.');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are an expert Jiu-Jitsu head coach specializing in the Constraints-Led Approach (CLA) and Ecological Dynamics.
Based on the following class session:
Class Type: ${classType || 'BJJ'}
Ecological Problem Space / Topic: ${topic || 'General Mat Time'}
Existing Constraints/Mini-Games:
1: ${constraint1 || 'None'}
2: ${constraint2 || 'None'}
3: ${constraint3 || 'None'}

Please design ONE follow-up action-oriented mini-game (or an alternative constraint game) that builds upon this curriculum. 
Adhere to Ecological Dynamics: no isolated technique drilling. Focus on specifying task goals and constraints to encourage perception-action coupling and adaptation.

Format your output purely as Markdown:
**Objective:** (What the players are trying to achieve)
**Constraints:** (Specific rules limiting action boundaries)
**Win Condition:** (How to win the game)
**Focus:** (What perception/action coupling this affords)

Be practical, straight to the point, and highly applicable to a real BJJ class safely.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setSuggestion(text);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate suggestion. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!suggestion && !isGenerating && !error) {
    return (
      <button 
        onClick={generateGame}
        className="w-full mt-8 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 border border-indigo-600/20 dark:border-indigo-500/30 rounded-xl p-4 flex items-center justify-center gap-2 font-semibold transition-all group shadow-sm"
      >
        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
        Generate Follow-up CLA Game with Gemini AI
      </button>
    );
  }

  return (
    <Card className="mt-8 border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/40 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" /> 
          AI Coach Suggestion (Ecological Dynamics)
        </h3>
        {suggestion && (
          <button onClick={generateGame} disabled={isGenerating} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Regenerate">
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        )}
      </div>

      {isGenerating && !suggestion && (
        <div className="py-8 flex flex-col items-center justify-center text-indigo-600/60 dark:text-indigo-500/60 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium animate-pulse">Designing constraint landscape based on session...</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-danger/10 text-danger text-sm rounded-lg border border-danger/20">
          {error}
        </div>
      )}

      {suggestion && (
        <div className="text-slate-700 dark:text-slate-300">
           <div className="whitespace-pre-wrap text-sm leading-relaxed">{suggestion.replace(/\*\*/g, '')}</div>
        </div>
      )}
    </Card>
  );
}
