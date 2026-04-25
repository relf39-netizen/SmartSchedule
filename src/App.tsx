import { useState, useEffect } from 'react';
import { 
  FilePlus, 
  List, 
  ShieldCheck, 
  LogOut, 
  BookOpen, 
  Library,
  ChevronRight,
  Menu,
  Users,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from './types';

// Components
import Login from './components/Login';
import Register from './components/Register';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import TimetableGenerator from './components/TimetableGenerator';
import ScheduleHistory from './components/ScheduleHistory';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [activeParam, setActiveParam] = useState<string | null>(null);

  useEffect(() => {
    const apiBase = '/server.cjs';
    fetch(`${apiBase}/api/auth/me`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          if (data.user.role === 'admin') setCurrentPage('admin');
        } else {
          setCurrentPage('login');
        }
        setLoading(false);
      })
      .catch(() => {
        setCurrentPage('login');
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    const apiBase = '/server.cjs';
    await fetch(`${apiBase}/api/auth/logout`, { method: 'POST' });
    setUser(null);
    setCurrentPage('login');
    window.location.reload();
  };

  const navigateTo = (page: string, param: string | null = null) => {
    setCurrentPage(page);
    setActiveParam(param);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  const isSuperAdmin = user?.id === 0 || user?.citizen_id === 'peyarm';

  const renderContent = () => {
    if (!user) {
      if (currentPage === 'register') return <Register onNavigate={navigateTo} />;
      return <Login onLogin={(u) => { setUser(u); navigateTo(u.id === 0 || u.citizen_id === 'peyarm' ? 'admin' : 'home'); }} onNavigate={navigateTo} />;
    }

    const onUserUpdate = (updatedUser: User) => setUser(updatedUser);

    if (user.role === 'admin') {
      switch (currentPage) {
        case 'admin_db': return <AdminDashboard user={user} initialTab="planning" />;
        case 'members': return <AdminDashboard user={user} initialTab="members" />;
        default: return <AdminDashboard user={user} initialTab={isSuperAdmin ? 'members' : 'system'} />;
      }
    }

    switch (currentPage) {
      case 'generator': return <TimetableGenerator onNavigate={navigateTo} />;
      case 'schedules': return <ScheduleHistory onNavigate={navigateTo} />;
      case 'settings': return <AdminDashboard user={user} initialTab="system" />;
      default: return <TeacherDashboard user={user} onNavigate={navigateTo} onUserUpdate={onUserUpdate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-slate-800 flex flex-col">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
            {renderContent()}
          </motion.div>
        ) : (
          <div key="app" className="flex flex-col h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
            {/* Top Navigation Bar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-50 no-print shadow-sm">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => navigateTo('home')} 
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                    <Database size={22} className="text-white" />
                  </div>
                  <h1 className="font-bold text-xl text-indigo-900 tracking-tight">Smart<span className="text-indigo-600">Schedule</span></h1>
                </div>
              </div>

              {/* Center Navigation Links */}
              <nav className="hidden md:flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-[22px] border border-slate-200/60 backdrop-blur-sm">
                {isSuperAdmin ? (
                  <>
                    <HeaderLink 
                      active={currentPage === 'admin' || currentPage === 'members'} 
                      onClick={() => navigateTo('admin')} 
                      label="จัดการสมาชิก" 
                    />
                    <HeaderLink 
                      active={currentPage === 'admin_db'} 
                      onClick={() => navigateTo('admin_db')} 
                      label="จัดการฐานข้อมูล" 
                    />
                  </>
                ) : (
                  <>
                    <HeaderLink 
                      active={currentPage === 'settings'} 
                      onClick={() => navigateTo('settings')} 
                      label="ข้อมูลโรงเรียน" 
                    />
                    <HeaderLink 
                      active={currentPage === 'generator'} 
                      onClick={() => navigateTo('generator')} 
                      label="จัดตารางอัตโนมัติ" 
                    />
                  </>
                )}
                <HeaderLink 
                  active={currentPage === 'schedules'} 
                  onClick={() => navigateTo('schedules')} 
                  label="ตารางที่บันทึกไว้" 
                />
              </nav>

              {/* Right Side Info & Logout */}
              <div className="flex items-center gap-4 border-l border-slate-100 pl-6 ml-2">
                <div className="text-right hidden sm:flex flex-col justify-center">
                  <div className="text-sm font-bold text-slate-900 leading-none">{user.name} {user.surname}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
                    title="ออกจากระบบ"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative bg-[#f3f4f6] print:block print:bg-white custom-scrollbar">
              <div className="max-w-7xl mx-auto p-8 print:p-0 print:max-w-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="print:opacity-100 print:!transform-none print:!block print:static"
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeaderLink({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center min-w-[120px] ${
        active 
          ? 'text-white bg-indigo-600 shadow-[0_8px_20px_-4px_rgba(79,70,229,0.4)] scale-105' 
          : 'text-slate-500 hover:text-indigo-600 hover:bg-white/80 border border-transparent hover:border-indigo-100'
      }`}
    >
      {label}
    </button>
  );
}
