import { Card } from '../ui/Card';
import { bjjData } from '../../data/bjj-library';
import { TrendingUp, Activity } from 'lucide-react';

export function GamePlayStatus() {
  const { matHoursThisMonth, matHoursTrend, topGameEfficiency, bottomGameEfficiency } = bjjData.metrics;

  return (
    <Card className="bg-gradient-to-br from-primary/90 to-slate-900 text-white border-none col-span-1 md:col-span-2 lg:col-span-1">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-slate-200 text-sm font-medium uppercase tracking-wider">Mat Hours (This Month)</h2>
          <div className="text-4xl font-bold mt-2">{matHoursThisMonth} <span className="text-xl text-slate-300 font-normal">hrs</span></div>
        </div>
        <div className="bg-white/20 p-2 rounded-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1 text-sm bg-success/20 text-green-400 px-2 py-1 rounded-full font-medium">
          <TrendingUp className="w-4 h-4" /> +{matHoursTrend}%
        </span>
        <span className="text-sm text-slate-300">Positional Dominance</span>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">Top Game Efficiency</span>
            <span className="font-medium">{topGameEfficiency}%</span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${topGameEfficiency}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">Bottom Game Efficiency</span>
            <span className="font-medium">{bottomGameEfficiency}%</span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${bottomGameEfficiency}%` }}></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
