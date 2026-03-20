import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { SUPABASE_REQUEST_TIMEOUT_MS, withTimeout } from '../lib/withTimeout';
import { ArrowLeft, CheckSquare, Square, Shield, Loader2, Trash2 } from 'lucide-react';

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const CURRICULUM_OPTIONS = [
  'Guard',
  'Dominate positions',
  'Standing',
  'Submissions'
];

const CLASS_TYPES = [
  'Adult - Gi',
  'Adult - No gi',
  'Kids - Gi',
  'Kids - No gi'
];

export default function LogClass() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("18:00");
  const [classType, setClassType] = useState(CLASS_TYPES[0]);
  const [topic, setTopic] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [constraint1Title, setConstraint1Title] = useState("");
  const [constraint1, setConstraint1] = useState("");
  const [constraint2Title, setConstraint2Title] = useState("");
  const [constraint2, setConstraint2] = useState("");
  const [constraint3Title, setConstraint3Title] = useState("");
  const [constraint3, setConstraint3] = useState("");
  const [attendeesCount, setAttendeesCount] = useState<number>(0);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      let isMounted = true;
      const timeoutId = setTimeout(() => {
        if (isMounted) setLoading(false);
      }, 8000);

      async function fetchClass() {
        try {
          const { data, error } = await supabase.from('classes').select('*').eq('id', id).single();
          if (error) throw error;
          
          if (data && isMounted) {
            setDate(data.date);
            setTime(data.time);
            setClassType(data.class_type);
            setTopic(data.topic || "");
            setYoutubeUrl(data.youtube_url || "");
            setAttendeesCount(data.attendees_count || 0);
            setSelectedCurriculum(data.curriculum || []);
            setConstraint1Title(data.constraint_1_title || "");
            setConstraint1(data.constraint_1 || "");
            setConstraint2Title(data.constraint_2_title || "");
            setConstraint2(data.constraint_2 || "");
            setConstraint3Title(data.constraint_3_title || "");
            setConstraint3(data.constraint_3 || "");
          }
        } catch (err) {
          console.error("Error fetching class to edit:", err);
        } finally {
          if (isMounted) setLoading(false);
          clearTimeout(timeoutId);
        }
      }
      fetchClass();

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }
  }, [id, isEditMode]);

  const toggleCurriculum = (option: string) => {
    setSelectedCurriculum(prev => 
      prev.includes(option) ? prev.filter(c => c !== option) : [...prev, option]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      date,
      time,
      class_type: classType,
      topic,
      youtube_url: youtubeUrl,
      constraint_1_title: constraint1Title,
      constraint_1: constraint1,
      constraint_2_title: constraint2Title,
      constraint_2: constraint2,
      constraint_3_title: constraint3Title,
      constraint_3: constraint3,
      curriculum: selectedCurriculum,
      attendees_count: attendeesCount
    };

    try {
      if (isEditMode) {
        const { data, error } = await withTimeout(
          supabase.from('classes').update(payload).eq('id', id).select('id'),
          SUPABASE_REQUEST_TIMEOUT_MS,
          'Save session'
        );
        if (error) throw error;
        if (!data?.length) {
          throw new Error(
            'Update did not save any rows. You may lack permission or this session no longer exists.'
          );
        }
        navigate(`/class/${id}`);
      } else {
        const { data, error } = await withTimeout(
          supabase.from('classes').insert([payload]).select('id').maybeSingle(),
          SUPABASE_REQUEST_TIMEOUT_MS,
          'Save session'
        );
        if (error) throw error;
        if (!data?.id) {
          throw new Error('Insert did not create a row. Check your connection and database setup.');
        }
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      console.error('Failed to log class:', err);
      const message =
        err instanceof Error ? err.message : 'Error updating database. Please try again.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this session?")) return;
    
    setIsDeleting(true);
    try {
      const { data, error } = await withTimeout(
        supabase.from('classes').delete().eq('id', id).select('id'),
        SUPABASE_REQUEST_TIMEOUT_MS,
        'Delete session'
      );
      if (error) throw error;
      if (!data?.length) {
        throw new Error('Nothing was deleted. You may lack permission or this session no longer exists.');
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Failed to delete class:', err);
      const message = err instanceof Error ? err.message : 'Error deleting session. Please try again.';
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(isEditMode ? `/class/${id}` : '/dashboard')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {isEditMode ? 'Back to Details' : 'Back to Dashboard'}
      </button>

      <div className="flex items-center justify-between mb-8 text-slate-900 dark:text-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isEditMode ? 'Edit Session' : 'Log a Session'}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Record class details and track specific constraints.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h2 className="font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">Time & Format</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100" 
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class Type</label>
                <select 
                  value={classType}
                  onChange={(e) => setClassType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100"
                >
                  {CLASS_TYPES.map(type => <option key={type}>{type}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Attendees</label>
                <input 
                  type="number" 
                  min="0"
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(parseInt(e.target.value) || 0)}
                  className="w-full max-w-[120px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100" 
                />
              </div>
              
              <div className="pt-2">
                 <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Curriculum Focus Focus</h3>
                 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                   {CURRICULUM_OPTIONS.map(opt => {
                     const isSelected = selectedCurriculum.includes(opt);
                     return (
                       <button
                         type="button"
                         key={opt}
                         onClick={() => toggleCurriculum(opt)}
                         className="flex items-center gap-3 text-left w-full focus:outline-none group"
                       >
                         {isSelected ? (
                           <CheckSquare className="w-5 h-5 text-primary" />
                         ) : (
                           <Square className="w-5 h-5 text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                         )}
                         <span className={`text-sm tracking-wide ${isSelected ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 font-medium'}`}>
                           {opt}
                         </span>
                       </button>
                     )
                   })}
                 </div>
              </div>
            </div>

            <div className="space-y-5">
               <h2 className="font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">Ecological Structure</h2>

               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Problem Space (Topic)</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The Back Take Problem..." 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-400" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">YouTube URL (Reference Video)</label>
                <input 
                  type="url" 
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..." 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-400" 
                />
                {isEditMode && youtubeUrl && getYoutubeId(youtubeUrl) && (
                  <div className="mt-4 aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">Constraints & Mini-Games</p>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <input 
                    type="text"
                    value={constraint1Title}
                    onChange={(e) => setConstraint1Title(e.target.value)}
                    placeholder="Game 1 Title (e.g., Mount Escapes)"
                    className="w-full font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  />
                  <textarea 
                    rows={2} 
                    value={constraint1}
                    onChange={(e) => setConstraint1(e.target.value)}
                    placeholder="Constraint 1 Rules / Objective" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  ></textarea>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <input 
                    type="text"
                    value={constraint2Title}
                    onChange={(e) => setConstraint2Title(e.target.value)}
                    placeholder="Game 2 Title"
                    className="w-full font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  />
                  <textarea 
                    rows={2} 
                    value={constraint2}
                    onChange={(e) => setConstraint2(e.target.value)}
                    placeholder="Constraint 2 Rules / Objective" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  ></textarea>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <input 
                    type="text"
                    value={constraint3Title}
                    onChange={(e) => setConstraint3Title(e.target.value)}
                    placeholder="Game 3 Title"
                    className="w-full font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  />
                  <textarea 
                    rows={2} 
                    value={constraint3}
                    onChange={(e) => setConstraint3(e.target.value)}
                    placeholder="Constraint 3 Rules / Objective" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            {isEditMode && (
              <button 
                type="button" 
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="bg-white dark:bg-slate-900 border border-danger/50 hover:bg-danger/10 text-danger font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-danger" /> : <Trash2 className="w-4 h-4" />}
                Delete Session
              </button>
            )}
            <button 
              type="submit" 
              disabled={isSubmitting || isDeleting}
              className="bg-primary hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm shadow-primary/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Session' : 'Save Session Log')}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
