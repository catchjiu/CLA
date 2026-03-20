import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import Dashboard from './pages/Dashboard';
import LogClass from './pages/LogClass';
import ClassDetails from './pages/ClassDetails';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans flex flex-col">
        <Header />
        <main className="flex-1 w-full bg-slate-50 dark:bg-slate-950">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/log-class" element={<LogClass />} />
            <Route path="/edit-class/:id" element={<LogClass />} />
            <Route path="/class/:id" element={<ClassDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
