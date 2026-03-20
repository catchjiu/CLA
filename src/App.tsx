import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import Dashboard from './pages/Dashboard';
import LogClass from './pages/LogClass';
import ClassDetails from './pages/ClassDetails';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans flex flex-col">
          <Header />
          <main className="flex-1 w-full bg-slate-50 dark:bg-slate-950 flex flex-col">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/log-class" element={<ProtectedRoute requireRole="coach"><LogClass /></ProtectedRoute>} />
              <Route path="/edit-class/:id" element={<ProtectedRoute requireRole="coach"><LogClass /></ProtectedRoute>} />
              <Route path="/class/:id" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
