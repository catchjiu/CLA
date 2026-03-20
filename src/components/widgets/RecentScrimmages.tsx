import { Card, cn } from '../ui/Card';
import { bjjData } from '../../data/bjj-library';
import { UserCircle } from 'lucide-react';

export function RecentScrimmages() {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2 overflow-hidden p-0">
      <div className="p-6 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Ecological Scrimmages</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Live resistance mapping and insights</p>
      </div>
      <div className="overflow-x-auto px-6 pb-6">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-lg dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Date</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Skill Theme</th>
              <th className="px-4 py-3 rounded-r-lg">Outcome / Insight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {bjjData.recentScrimmages.map((match) => (
              <tr key={match.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-4 text-slate-500 whitespace-nowrap">{match.date}</td>
                <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-slate-400" />
                    {match.partner}
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{match.theme}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0 shadow-sm",
                      match.outcome === 'success' ? 'bg-success shadow-success/50' : 
                      match.outcome === 'warning' ? 'bg-warning shadow-warning/50' : 'bg-danger shadow-danger/50'
                    )}></span>
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">{match.insight}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
