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
  const [selectedConstraint, setSelectedConstraint] = useState<string>('all');

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

      let constraintText = '';
      if (selectedConstraint === 'all') {
        constraintText = `Existing Constraints/Mini-Games:\n1: ${constraint1 || 'None'}\n2: ${constraint2 || 'None'}\n3: ${constraint3 || 'None'}`;
      } else if (selectedConstraint === '1') {
        constraintText = `Target Constraint to build upon: ${constraint1}`;
      } else if (selectedConstraint === '2') {
        constraintText = `Target Constraint to build upon: ${constraint2}`;
      } else if (selectedConstraint === '3') {
        constraintText = `Target Constraint to build upon: ${constraint3}`;
      }

      const prompt = `You are an expert Jiu-Jitsu head coach specializing in the Constraints-Led Approach (CLA) and Ecological Dynamics.
Based on the following class session:
Class Type: ${classType || 'BJJ'}
Ecological Problem Space / Topic: ${topic || 'General Mat Time'}
${constraintText}

Please design ONE follow-up action-oriented mini-game (or an alternative constraint game) that specifically builds upon the targeted constraint(s) above. 
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

  return (
    <Card className="mt-8 border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/40 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" /> 
          AI Coach Suggestion (Ecological Dynamics)
        </h3>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-medium text-indigo-900/70 dark:text-indigo-300/70 mb-1.5">Build upon which mini-game?</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={selectedConstraint}
            onChange={(e) => setSelectedConstraint(e.target.value)}
            disabled={isGenerating}
            className="flex-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-slate-100 outline-none disabled:opacity-50"
          >
            <option value="all">All Constraints (Entire Session)</option>
            {constraint1 && <option value="1">Constraint 1: {constraint1}</option>}
            {constraint2 && <option value="2">Constraint 2: {constraint2}</option>}
            {constraint3 && <option value="3">Constraint 3: {constraint3}</option>}
          </select>
          
          <button 
            onClick={generateGame}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-lg px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-sm disabled:opacity-50 whitespace-nowrap"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : (suggestion ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />)}
            {isGenerating ? 'Generating...' : (suggestion ? 'Regenerate' : 'Generate Game')}
          </button>
        </div>
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
