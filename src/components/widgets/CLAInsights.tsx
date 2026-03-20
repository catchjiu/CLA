import { Card } from '../ui/Card';
import { bjjData } from '../../data/bjj-library';
import { Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react';

export function CLAInsights() {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-slate-900 border border-slate-800 shadow-xl shadow-slate-900/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-warning/20 rounded-md">
          <Lightbulb className="w-5 h-5 text-amber-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Ecological Insights</h2>
      </div>
      <div className="space-y-4">
        {bjjData.insights.map((insight) => (
          <div key={insight.id} className="flex gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors rounded-xl border border-slate-700/50">
            <div className="shrink-0 mt-0.5">
              {insight.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {insight.text}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
