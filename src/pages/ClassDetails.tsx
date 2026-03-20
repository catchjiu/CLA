import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AIGameGenerator } from '../components/AIGameGenerator';
import { ArrowLeft, Users, Calendar, Clock, BookOpen, Layers, CheckCircle2, Loader2, Edit3, Video, Sparkles } from 'lucide-react';

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [cls, setCls] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClass() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setCls(data);
      } catch (err: any) {
        console.error("Error fetching class details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClass();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!cls) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Class Not Found</h2>
        <p className="text-slate-500 mb-6">This class log may have been deleted or doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">Return to Dashboard</button>
      </div>
    );
  }

  const dateStr = new Date(cls.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        
        {role === 'coach' && (
          <Link 
            to={`/edit-class/${id}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm"
          >
            <Edit3 className="w-4 h-4" /> Edit Class Details
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{cls.class_type}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {dateStr}
            <span className="mx-1">•</span>
            <Clock className="w-4 h-4" /> {cls.time}
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-lg border border-primary/20 shadow-sm">
          <Users className="w-5 h-5" />
          {cls.attendees_count} Attendees
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 space-y-8">
          <div>
             <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
               <Layers className="w-5 h-5 text-slate-400" /> Ecological Problem Space
             </h2>
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 font-medium tracking-wide">
               {cls.topic || "No specific topic recorded."}
             </div>
          </div>
          <div>
             <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
               <BookOpen className="w-5 h-5 text-slate-400" /> Constraints / Mini-Games
             </h2>
             <div className="space-y-4">
               {cls.constraint_1 && (
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 relative mt-2">
                    <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 px-2 rounded-full">
                      {cls.constraint_1_title || 'Constraint 1'}
                    </span>
                    <span className="mt-1 block whitespace-pre-wrap">{cls.constraint_1}</span>
                 </div>
               )}
               {cls.constraint_2 && (
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 relative mt-4">
                    <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 px-2 rounded-full">
                      {cls.constraint_2_title || 'Constraint 2'}
                    </span>
                    <span className="mt-1 block whitespace-pre-wrap">{cls.constraint_2}</span>
                 </div>
               )}
               {cls.constraint_3 && (
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 relative mt-4">
                    <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 px-2 rounded-full">
                      {cls.constraint_3_title || 'Constraint 3'}
                    </span>
                    <span className="mt-1 block whitespace-pre-wrap">{cls.constraint_3}</span>
                 </div>
               )}
               {!cls.constraint_1 && !cls.constraint_2 && !cls.constraint_3 && (
                 <div className="text-sm text-slate-500 italic p-4">No specific constraints recorded.</div>
               )}
             </div>
          </div>
        </Card>

        <Card className="col-span-1 h-fit">
           <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Curriculum Focus</h2>
           <div className="space-y-3">
             {cls.curriculum && cls.curriculum.length > 0 ? (
               cls.curriculum.map((cat: string) => (
                 <div key={cat} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                   <CheckCircle2 className="w-5 h-5 text-success" />
                   <span className="font-medium text-slate-700 dark:text-slate-200">{cat}</span>
                 </div>
               ))
             ) : (
               <div className="text-sm text-slate-500 italic">No curriculum tags selected.</div>
             )}
           </div>
        </Card>
      </div>

      {role === 'coach' && (
        <AIGameGenerator 
          classId={cls.id}
          topic={cls.topic}
          constraint1Title={cls.constraint_1_title}
          constraint1={cls.constraint_1}
          constraint2Title={cls.constraint_2_title}
          constraint2={cls.constraint_2}
          constraint3Title={cls.constraint_3_title}
          constraint3={cls.constraint_3}
          classType={cls.class_type}
          initialSuggestion={cls.ai_suggestion}
          initialPublished={cls.ai_suggestion_published}
        />
      )}

      {role === 'member' && cls.ai_suggestion_published && cls.ai_suggestion && (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <h2 className="text-lg font-bold mb-4 text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Follow-up Game (Coach Suggestion)
            </h2>
            <div className="text-slate-700 dark:text-slate-300">
               <div className="whitespace-pre-wrap text-sm leading-relaxed">{cls.ai_suggestion.replace(/\*\*/g, '')}</div>
            </div>
          </Card>
        </div>
      )}

      {cls.youtube_url && getYoutubeId(cls.youtube_url) && (
        <div className="mt-6">
          <Card>
            <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
               <Video className="w-5 h-5 text-slate-400" /> Class Video
            </h2>
            <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYoutubeId(cls.youtube_url)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
