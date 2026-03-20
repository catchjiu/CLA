import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Users, Calendar, Clock, BookOpen, Layers, CheckCircle2, Loader2, Edit3 } from 'lucide-react';

export default function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClass() {
      if (!id) return;
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching class details:", error);
      } else {
        setCls(data);
      }
      setLoading(false);
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
        
        <Link 
          to={`/edit-class/${id}`}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <Edit3 className="w-4 h-4" /> Edit Class Details
        </Link>
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
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 relative">
                    <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 px-2 rounded-full">Constraint 1</span>
                    <span className="mt-2 block whitespace-pre-wrap">{cls.constraint_1}</span>
                 </div>
               )}
               {cls.constraint_2 && (
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 relative">
                    <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 px-2 rounded-full">Constraint 2</span>
                    <span className="mt-2 block whitespace-pre-wrap">{cls.constraint_2}</span>
                 </div>
               )}
               {cls.constraint_3 && (
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 relative">
                    <span className="absolute -top-3 left-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 px-2 rounded-full">Constraint 3</span>
                    <span className="mt-2 block whitespace-pre-wrap">{cls.constraint_3}</span>
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
    </div>
  );
}
