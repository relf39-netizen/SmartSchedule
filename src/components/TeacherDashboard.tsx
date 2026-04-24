import { useState, useEffect } from 'react';
import { Key, PlusCircle, History, UserCheck, AlertCircle, FileText, ChevronRight, Calendar, Users, BookOpen, Warehouse } from 'lucide-react';
import { User } from '../types';

export default function TeacherDashboard({ user, onNavigate, onUserUpdate }: { user: User, onNavigate: (page: string, param?: string) => void, onUserUpdate: (updatedUser: User) => void }) {
  const [aiKey, setAiKey] = useState(user.ai_key || '');
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({ teachers: 0, subjects: 0, rooms: 0, classes: 0 });

  useEffect(() => {
    // In a real app, we would fetch stats from the backend
    setStats({
      teachers: 12,
      subjects: 25,
      rooms: 8,
      classes: 6
    });
  }, []);

  const handleUpdateKey = async () => {
    setUpdating(true);
    const apiBase = '/server.cjs';
    const res = await fetch(`${apiBase}/api/profile/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ai_key: aiKey })
    });
    
    if (res.ok) {
      onUserUpdate({ ...user, ai_key: aiKey });
      alert('บันทึก API Key สำเร็จ');
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
    
    setUpdating(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <header className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">แดชบอร์ดจัดการตารางสอน</span>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">สวัสดีครับคุณครู {user.name}</h1>
              <p className="text-slate-500 text-sm">ยินดีต้อนรับสู่ระบบจัดตารางสอนอัตโนมัติ SmartSchedule AI</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard 
              title="จัดตารางสอนใหม่" 
              desc="ใช้ระบบอัตโนมัติคำนวณคาบเรียนและคัดกรองความซ้ำซ้อน"
              icon={<Calendar size={28} />}
              color="bg-indigo-600 shadow-indigo-100"
              onClick={() => onNavigate('generator')}
            />
            <ActionCard 
              title="ข้อมูลพื้นฐาน" 
              desc="จัดการรายชื่อครู วิชา ห้องเรียน และชั้นเรียน"
              icon={<Warehouse size={28} />}
              color="bg-slate-900 shadow-slate-200"
              onClick={() => onNavigate('resources')}
            />
          </div>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                สรุปทรัพยากรที่มีอยู่
              </h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="ครูทั้งหมด" value={stats.teachers} icon={<Users className="text-blue-500" />} />
              <StatCard label="รายวิชา" value={stats.subjects} icon={<BookOpen className="text-emerald-500" />} />
              <StatCard label="ห้องเรียน" value={stats.rooms} icon={<Warehouse className="text-amber-500" />} />
              <StatCard label="กลุ่มเรียน" value={stats.classes} icon={<History className="text-purple-500" />} />
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-lg">คำแนะนำการใช้งาน</h4>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    ก่อนเริ่มจัดตารางสอนอัตโนมัติ กรุณาตรวจสอบให้มั่นใจว่าข้อมูลรายชื่อครู รายวิชา และชั้นเรียนได้รับการบันทึกครบถ้วนสมบูรณ์ เพื่อความแม่นยำในการคำนวณของระบบ
                  </p>
                  <button 
                    onClick={() => onNavigate('resources')}
                    className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                  >
                    ไปที่การจัดการข้อมูลพื้นฐาน →
                  </button>
                </div>
             </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Key size={18} />
              </div>
              <h3 className="font-bold uppercase tracking-wider text-sm">การเชื่อมต่อ AI</h3>
            </div>
            
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">
              สแกนข้อมูลและจัดตารางด้วย Gemini AI ประสิทธิภาพสูง
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block tracking-widest">GEMINI API KEY</label>
                <input 
                  type="password"
                  value={aiKey}
                  onChange={(e) => setAiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-transparent border-none outline-none text-indigo-300 font-mono text-sm"
                />
              </div>
              <button 
                onClick={handleUpdateKey}
                disabled={updating}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/50"
              >
                {updating ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
              <Calendar size={120} />
            </div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">ตารางสอนล่าสุด</h4>
            <div className="space-y-3">
               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 truncate mr-2">ตารางเรียน ภาคเรียนที่ 1/2567</div>
                  <ChevronRight size={14} className="text-slate-300" />
               </div>
               <p className="text-[10px] text-slate-400 text-center italic">ไม่พบตารางสอนอื่นๆ ที่บันทึกไว้</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`${color} text-white p-8 rounded-2xl shadow-lg transition-all hover:-translate-y-1 active:scale-95 text-left group min-h-[220px] flex flex-col justify-end`}
    >
      <div className="mb-auto group-hover:scale-110 transition-transform bg-white/10 w-fit p-3 rounded-xl">{icon}</div>
      <div>
        <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">{title}</h3>
        <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number, icon: any }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight mb-1">{label}</div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}
