import { Card } from '../ui/Card';
import { bjjData } from '../../data/bjj-library';

export function ConstraintsList() {
  return (
    <Card className="col-span-1 md:col-span-1 lg:col-span-1">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">CLA Constraints Status</h2>
      <div className="space-y-5">
        {bjjData.constraintsProgress.map((constraint, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">{constraint.name}</span>
              <span className="text-slate-500">{constraint.proficiency}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  constraint.proficiency >= 85 ? 'bg-success' : 
                  constraint.proficiency >= 60 ? 'bg-warning' : 'bg-danger'
                }`} 
                style={{ width: `${constraint.proficiency}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
