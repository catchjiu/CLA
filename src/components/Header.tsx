import { Search, Bell, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bjjData } from '../data/bjj-library';

export function Header() {
  return (
    <header className="h-[72px] sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase flex items-center gap-2">
          <span className="text-primary tracking-normal">CATCH</span> JIU JITSU
        </h1>
        
        <div className="hidden md:flex relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search classes or curriculum..." 
            className="pl-10 pr-4 py-2 w-80 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 transition-all focus:w-96 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300">
          <Shield className="w-4 h-4 text-primary" />
          <span className="tabular-nums">Coach Mode</span>
        </div>

        <button className="relative p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-950"></span>
        </button>

        <Link to="/log-class" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-primary/20 transition-all active:scale-95">
          Log Training Session
        </Link>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <img src={bjjData.user.avatar} alt="User Avatar" className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-sm" />
          <div className="hidden lg:block text-sm">
            <div className="font-semibold text-slate-900 dark:text-white leading-none">{bjjData.user.name}</div>
            <div className="text-xs text-primary font-medium mt-1">Head Coach</div>
          </div>
        </div>
      </div>
    </header>
  );
}
