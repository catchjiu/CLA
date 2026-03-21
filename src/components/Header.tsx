import { Search, Bell, Shield, LogOut, Loader2, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bjjData } from '../data/bjj-library';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function Header() {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        setShowDropdown(true);

        const safeTerm = searchTerm.replace(/"/g, '');
        const term = `%${safeTerm}%`;
        const { data, error } = await supabase
          .from('classes')
          .select('id, class_type, topic, date')
          .or(`topic.ilike."${term}",constraint_1.ilike."${term}",constraint_2.ilike."${term}",constraint_3.ilike."${term}",class_type.ilike."${term}"`)
          .order('date', { ascending: false })
          .limit(6);

        if (cancelled) return;
        if (!error && data) {
          setResults(data);
        }
        setIsSearching(false);
      })();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleSelectResult = (id: string) => {
    navigate(`/class/${id}`);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="h-[72px] sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <Link to="/dashboard">
          <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-primary tracking-normal">ECO</span> CLA
          </h1>
        </Link>
        
        <div className="hidden md:flex relative group" ref={searchRef}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => { if (searchTerm) setShowDropdown(true); }}
            placeholder="Search classes or curriculum..." 
            className="pl-10 pr-4 py-2 w-80 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 transition-all focus:w-96 outline-none"
          />
          
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 flex items-center justify-center text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <ul className="max-h-80 overflow-y-auto">
                  {results.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => handleSelectResult(r.id)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                      >
                        <div className="font-semibold text-sm text-slate-900 dark:text-white capitalize truncate">{r.topic || r.class_type}</div>
                        <div className="text-xs text-slate-500 mt-1 flex gap-2 items-center">
                          <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3 h-3"/> {new Date(r.date).toLocaleDateString()}</span>
                          <span className="truncate opacity-75">&bull; {r.class_type}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  No matches found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
              <Shield className="w-4 h-4 text-primary" />
              <span className="tabular-nums">
                {role === 'coach'
                  ? 'Coach Mode'
                  : role === 'member'
                    ? 'Member Mode'
                    : authLoading
                      ? '…'
                      : 'Pending'}
              </span>
            </div>

            <button className="relative p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-950"></span>
            </button>

            {role === 'coach' && (
              <Link to="/log-class" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-primary/20 transition-all active:scale-95">
                Log Training Session
              </Link>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <img src={bjjData.user.avatar} alt="User Avatar" className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-sm" />
              <div className="hidden lg:block text-sm mr-2">
                <div className="font-semibold text-slate-900 dark:text-white leading-none">{user.email?.split('@')[0] || 'User'}</div>
                <div className="text-xs text-primary font-medium mt-1 capitalize">
                  {role === 'coach' ? 'Coach' : role === 'member' ? 'Member' : authLoading ? '…' : '—'}
                </div>
              </div>
              <button onClick={handleSignOut} className="p-2 text-slate-400 hover:text-danger transition-colors group" title="Sign Out">
                 <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="px-4 py-2 bg-primary hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-primary/20 transition-all">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
