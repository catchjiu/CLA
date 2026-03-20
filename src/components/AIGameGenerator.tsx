import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Card } from './ui/Card';
import { supabase } from '../lib/supabase';
import { SUPABASE_REQUEST_TIMEOUT_MS, withTimeout } from '../lib/withTimeout';
import { Sparkles, Loader2, RefreshCw, Save, Edit2, Globe, Lock } from 'lucide-react';

interface Props {
  classId: string;
  topic?: string;
  classType?: string;
  constraint1Title?: string;
  constraint1?: string;
  constraint1AI?: string;
  constraint1AIPub?: boolean;
  constraint2Title?: string;
  constraint2?: string;
  constraint2AI?: string;
  constraint2AIPub?: boolean;
  constraint3Title?: string;
  constraint3?: string;
  constraint3AI?: string;
  constraint3AIPub?: boolean;
  generalAI?: string;
  generalAIPub?: boolean;
}

export function AIGameGenerator({ 
  classId, topic, classType,
  constraint1Title, constraint1, constraint1AI, constraint1AIPub,
  constraint2Title, constraint2, constraint2AI, constraint2AIPub,
  constraint3Title, constraint3, constraint3AI, constraint3AIPub,
  generalAI, generalAIPub
}: Props) {
  const [selectedConstraint, setSelectedConstraint] = useState<string>('all');
  const [suggestion, setSuggestion] = useState(generalAI || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isPublished, setIsPublished] = useState(generalAIPub || false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  useEffect(() => {
    switch (selectedConstraint) {
      case 'all':
        setSuggestion(generalAI || '');
        setIsPublished(generalAIPub || false);
        break;
      case '1':
        setSuggestion(constraint1AI || '');
        setIsPublished(constraint1AIPub || false);
        break;
      case '2':
        setSuggestion(constraint2AI || '');
        setIsPublished(constraint2AIPub || false);
        break;
      case '3':
        setSuggestion(constraint3AI || '');
        setIsPublished(constraint3AIPub || false);
        break;
    }
    setIsEditing(false); // Turn off editing when switching views
    setError('');
  }, [selectedConstraint, generalAI, generalAIPub, constraint1AI, constraint1AIPub, constraint2AI, constraint2AIPub, constraint3AI, constraint3AIPub]);

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
      const name1 = constraint1Title || 'Constraint 1';
      const name2 = constraint2Title || 'Constraint 2';
      const name3 = constraint3Title || 'Constraint 3';

      if (selectedConstraint === 'all') {
        constraintText = `Existing Constraints/Mini-Games:\n${name1}: ${constraint1 || 'None'}\n${name2}: ${constraint2 || 'None'}\n${name3}: ${constraint3 || 'None'}`;
      } else if (selectedConstraint === '1') {
        constraintText = `Target Constraint to build upon (${name1}): ${constraint1}`;
      } else if (selectedConstraint === '2') {
        constraintText = `Target Constraint to build upon (${name2}): ${constraint2}`;
      } else if (selectedConstraint === '3') {
        constraintText = `Target Constraint to build upon (${name3}): ${constraint3}`;
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
      setIsEditing(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate suggestion. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    
    let columnToUpdate = 'ai_suggestion';
    if (selectedConstraint === '1') columnToUpdate = 'constraint_1_ai';
    if (selectedConstraint === '2') columnToUpdate = 'constraint_2_ai';
    if (selectedConstraint === '3') columnToUpdate = 'constraint_3_ai';

    try {
      const { data, error: saveError } = await withTimeout(
        supabase
          .from('classes')
          .update({ [columnToUpdate]: suggestion })
          .eq('id', classId)
          .select('id'),
        SUPABASE_REQUEST_TIMEOUT_MS,
        'Save'
      );
      if (saveError) throw saveError;
      if (!data?.length) {
        throw new Error(
          'Save did not update any rows. The class may be missing or your account may not have permission to edit it.'
        );
      }
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save suggestion.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    setError('');
    
    let pubColumn = 'ai_suggestion_published';
    if (selectedConstraint === '1') pubColumn = 'constraint_1_ai_published';
    if (selectedConstraint === '2') pubColumn = 'constraint_2_ai_published';
    if (selectedConstraint === '3') pubColumn = 'constraint_3_ai_published';

    try {
      const newStatus = !isPublished;
      const { data, error: pubError } = await withTimeout(
        supabase
          .from('classes')
          .update({ [pubColumn]: newStatus })
          .eq('id', classId)
          .select('id'),
        SUPABASE_REQUEST_TIMEOUT_MS,
        'Publish update'
      );
      if (pubError) throw pubError;
      if (!data?.length) {
        throw new Error('Could not update publish status (no row updated).');
      }
      setIsPublished(newStatus);
    } catch (err: any) {
      setError(err?.message || 'Failed to update publish status.');
      console.error(err);
    } finally {
      setIsTogglingPublish(false);
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
            disabled={isGenerating || isSaving || isEditing}
            className="flex-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-slate-100 outline-none disabled:opacity-50"
          >
            <option value="all">All Constraints (Entire Session)</option>
            {constraint1 && <option value="1">{constraint1Title || 'Constraint 1'}</option>}
            {constraint2 && <option value="2">{constraint2Title || 'Constraint 2'}</option>}
            {constraint3 && <option value="3">{constraint3Title || 'Constraint 3'}</option>}
          </select>
          
          <button 
            onClick={generateGame}
            disabled={isGenerating || isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-lg px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-sm disabled:opacity-50 whitespace-nowrap"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : (suggestion ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />)}
            {isGenerating ? 'Generating...' : (suggestion ? 'Regenerate' : 'Generate Game')}
          </button>
        </div>
      </div>

      {isGenerating && (!suggestion || isEditing) && (
        <div className="py-6 flex flex-col items-center justify-center text-indigo-600/60 dark:text-indigo-500/60 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium animate-pulse">Designing constraint landscape based on session...</p>
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 bg-danger/10 text-danger text-sm rounded-lg border border-danger/20">
          {error}
        </div>
      )}

      {suggestion && !isGenerating && (
        <div className="animate-in fade-in duration-500">
          {isEditing ? (
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="w-full min-h-[250px] text-sm leading-relaxed p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-800 dark:text-slate-200 shadow-inner resize-y"
            />
          ) : (
            <div className="text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 overflow-hidden">
               <div className="whitespace-pre-wrap text-sm leading-relaxed">{suggestion.replace(/\*\*/g, '')}</div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-3">
              {isEditing ? (
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Suggestion
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            {/* Publish Toggle Button only available when NOT editing, guaranteeing they save first */}
            {!isEditing && (
              <button 
                onClick={handleTogglePublish}
                disabled={isTogglingPublish}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border ${isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'} disabled:opacity-50`}
              >
                {isTogglingPublish ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPublished ? (
                  <><Globe className="w-4 h-4" /> Published</>
                ) : (
                  <><Lock className="w-4 h-4" /> Private (Draft)</>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
