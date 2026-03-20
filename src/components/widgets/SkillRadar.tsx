import { Card } from '../ui/Card';
import { bjjData } from '../../data/bjj-library';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SkillRadar() {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Skill Acquisition Radar</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Submission Entry vs Defensive Retention (Last 4 Weeks)</p>
      </div>
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={bjjData.radarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDef" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E293B" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
            <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Area type="monotone" dataKey="submissionEntry" name="Submission Entry" stroke="#D97706" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" />
            <Area type="monotone" dataKey="defensiveRetention" name="Defensive Retention" stroke="#1E293B" strokeWidth={3} fillOpacity={1} fill="url(#colorDef)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
