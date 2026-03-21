import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, TrendingUp, PlusCircle, Calendar as CalendarIcon, BookOpen, Loader2, ChevronRight } from 'lucide-react';

interface ClassLog {
  id: string;
  date: string;
  time: string;
  class_type: string;
  topic: string;
  attendees: number;
  curriculum: string[];
}

const CURRICULUM_OPTIONS = [
  'Guard',
  'Dominate positions',
  'Standing',
  'Submissions'
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { role, loading: authLoading } = useAuth();
  const [recentClasses, setRecentClasses] = useState<ClassLog[]>([]);
  const [stats, setStats] = useState({ classesRun: 0, totalAttendance: 0, avgAttendance: 0 });
  const [curriculumStats, setCurriculumStats] = useState<{subject: string, coverage: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 8000);

    async function fetchDashboardData() {
      // Fetch classes including the new attendees_count and curriculum array
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`id, date, time, class_type, topic, attendees_count, curriculum`)
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .limit(20);

      if (classesError) {
        console.error("Error fetching classes:", classesError);
      } else if (classesData) {
        const totalClasses = classesData.length;
        
        // Calculate basic stats
        const formattedClasses = classesData.map((cls: any) => ({
          id: cls.id,
          date: new Date(cls.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: cls.time,
          class_type: cls.class_type,
          topic: cls.topic || 'Open Mat',
          attendees: cls.attendees_count || 0,
          curriculum: cls.curriculum || [],
        }));
        
        setRecentClasses(formattedClasses);
        
        const totalAtt = formattedClasses.reduce((sum, cls) => sum + cls.attendees, 0);
        setStats({
          classesRun: totalClasses,
          totalAttendance: totalAtt,
          avgAttendance: totalClasses > 0 ? Math.round((totalAtt / totalClasses) * 10) / 10 : 0
        });

        // Calculate dynamic Curriculum Coverage
        if (totalClasses > 0) {
          const coverage = CURRICULUM_OPTIONS.map(subject => {
            const count = formattedClasses.filter(cls => cls.curriculum.includes(subject)).length;
            return {
              subject,
              coverage: Math.round((count / totalClasses) * 100)
            };
          });
          setCurriculumStats(coverage);
        } else {
          setCurriculumStats(CURRICULUM_OPTIONS.map(sub => ({ subject: sub, coverage: 0 })));
        }
      }
      if (isMounted) setLoading(false);
      clearTimeout(timeoutId);
    }
    
    fetchDashboardData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {role === 'coach'
              ? 'Coach Dashboard'
              : role === 'member'
                ? 'Member Dashboard'
                : 'Dashboard'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {role === 'coach'
              ? 'Manage curriculum coverage and log training sessions.'
              : role === 'member'
                ? 'View recent training sessions and curriculum progress.'
                : authLoading
                  ? 'Loading your profile…'
                  : 'Syncing your role from the server. Refresh if this does not update.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium rounded-lg px-4 py-2 text-slate-700 dark:text-slate-200 shadow-sm outline-none">
            <option>Recent Classes</option>
            <option>This Month</option>
          </select>
          {role === 'coach' && (
            <Link to="/log-class" className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-primary/20 transition-all active:scale-95">
              <PlusCircle className="w-4 h-4" />
              Log Session
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
        
        <Card className="bg-gradient-to-br from-slate-800 to-slate-950 text-white border-slate-700 col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-slate-300 text-sm font-medium">Recorded Classes</h2>
              <div className="text-4xl font-bold mt-2">
                {loading ? <Loader2 className="w-6 h-6 animate-spin mt-2" /> : stats.classesRun}
              </div>
            </div>
            <div className="bg-white/10 p-2 rounded-lg text-primary">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="col-span-1">
          <div className="flex justify-between items-start">
             <div>
               <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Attendance</h2>
               <div className="text-4xl font-bold mt-2 text-slate-900 dark:text-white">
                 {loading ? <Loader2 className="w-6 h-6 animate-spin mt-2 text-slate-400" /> : stats.avgAttendance}
               </div>
             </div>
             <div className="bg-primary/10 p-2 rounded-lg">
               <Users className="w-6 h-6 text-primary" />
             </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm">
             <span className="text-success font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Active Sync</span>
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
           <div className="flex items-center gap-2 mb-4">
             <BookOpen className="w-5 h-5 text-slate-400" />
             <h2 className="text-lg font-bold text-slate-900 dark:text-white">Curriculum Coverage</h2>
           </div>
           
           {loading ? (
             <div className="py-8 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
           ) : (
             <div className="space-y-4">
               {curriculumStats.map((topic, i) => (
                 <div key={i}>
                   <div className="flex justify-between text-sm mb-1.5">
                     <span className="font-medium text-slate-700 dark:text-slate-300">{topic.subject}</span>
                     <span className="text-slate-500">{topic.coverage}%</span>
                   </div>
                   <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                     <div 
                       className={`h-full rounded-full transition-all duration-1000 ${topic.coverage < 30 ? 'bg-warning' : 'bg-primary'}`} 
                       style={{ width: `${topic.coverage}%` }}
                     ></div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-4 p-0 overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
               Recent Sessions
               {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Class Type</th>
                  <th className="px-6 py-3">Ecological Topic</th>
                  <th className="px-6 py-3">Attendees</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {recentClasses.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No sessions logged yet. Click "Log Session" to start tracking!
                    </td>
                  </tr>
                )}
                {recentClasses.map((cls) => (
                  <tr 
                    key={cls.id} 
                    onClick={() => navigate(`/class/${cls.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                       <div className="font-medium text-slate-700 dark:text-slate-300">{cls.date}</div>
                       <div className="text-xs text-slate-400">{cls.time}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{cls.class_type}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{cls.topic}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white">{cls.attendees}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}
