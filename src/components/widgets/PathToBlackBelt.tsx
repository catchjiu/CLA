import { Card } from '../ui/Card';
import { bjjData } from '../../data/bjj-library';
import { Target, Medal } from 'lucide-react';

export function PathToBlackBelt() {
  return (
    <Card className="col-span-1 md:col-span-1 lg:col-span-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Path to Black Belt</h2>
        <Medal className="text-primary w-5 h-5" />
      </div>
      <div className="space-y-4">
        {bjjData.milestones.map((milestone) => {
          const progress = Math.min(100, Math.round((milestone.current / milestone.target) * 100));
          return (
            <div key={milestone.id} className="relative flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700">
                   <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-300 dark:text-slate-600"
                        strokeDasharray="100, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="text-primary transition-all duration-1000 ease-out"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                    </svg>
                    <Target className="absolute w-4 h-4 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{milestone.name}</h3>
                  <p className="text-xs text-slate-500">Due: {milestone.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{milestone.current}</span>
                <span className="text-xs text-slate-500"> / {milestone.target}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
