import React, { useState } from 'react';
import { User as UserIcon, Lock, ShieldCheck, Mail } from 'lucide-react';

export default function Login({ onLogin, onNavigate }: { onLogin: (user: any) => void, onNavigate: (page: string) => void }) {
  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiBase = '/server.cjs';
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizen_id: citizenId, password })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200 mb-6 rotate-3">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">EduGen AI</h1>
          <p className="text-slate-500 font-medium italic">ระบบสร้างแบบฝึกหัดสำหรับคุณครูไทย</p>
        </div>

        <div className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">ชื่อผู้ใช้งานหรือหมายเลขประจำตัวประชาชน</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm placeholder:text-slate-300"
                  placeholder="กรุณากรอกเลขประจำตัวประชาชน"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm placeholder:text-slate-300"
                  placeholder="กรุณากรอกรหัสผ่าน"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {loading ? 'กำลังดำเนินการ...' : 'ล็อกอินเข้าสู่ระบบ'}
            </button>
          </form>

          <footer className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-500 text-sm">
              ยังไม่มีบัญชีเข้าใช้งาน?{' '}
              <button 
                onClick={() => onNavigate('register')} 
                className="text-indigo-600 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                ลงทะเบียนครูใหม่
              </button>
            </p>
          </footer>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-xs">
          © 2026 EduGen AI . พัฒนาขึ้นเพื่อสนับสนุนการศึกษาไทย
        </p>
      </div>
    </div>
  );
}
