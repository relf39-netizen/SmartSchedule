import React, { useState } from 'react';
import { User, School, Book, IdCard, Lock, ChevronLeft } from 'lucide-react';

export default function Register({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [formData, setFormData] = useState({
    citizen_id: '',
    name: '',
    surname: '',
    school: '',
    position: 'ครูอัตราจ้าง',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const apiBase = '/server.cjs';
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'ลงทะเบียนไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">ลงทะเบียนสำเร็จ!</h2>
          <p className="text-slate-600 mb-8">บัญชีของคุณกำลังรอการตรวจสอบจากผู้ดูแลระบบ</p>
          <button 
            onClick={() => onNavigate('login')}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest"
          >
            ไปที่หน้าล็อกอิน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="grid md:grid-cols-5 h-full">
          {/* Left Panel */}
          <div className="md:col-span-2 bg-indigo-600 p-10 text-white flex flex-col justify-between">
            <div>
              <button onClick={() => onNavigate('login')} className="inline-flex items-center text-indigo-100 hover:text-white transition-colors mb-8 bg-transparent border-none p-0 cursor-pointer">
                <ChevronLeft size={20} />
                <span className="text-sm font-bold">กลับไปหน้าล็อกอิน</span>
              </button>
              <h1 className="text-3xl font-black mb-4">ลงทะเบียนครู</h1>
              <p className="text-indigo-100 text-sm leading-relaxed">
                ร่วมเป็นส่วนหนึ่งของระบบสนับสนุนการเรียนรู้ เพื่อช่วยลดภาระงานครูและยกระดับประสิทธิภาพของนักเรียน
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-xs font-medium">ข้อมูลปลอดภัยและเป็นส่วนตัว</span>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="md:col-span-3 p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <InputGroup 
                  label="เลขประจำตัวประชาชน" 
                  icon={<IdCard size={18} />} 
                  value={formData.citizen_id}
                  onChange={(v) => setFormData({...formData, citizen_id: v})}
                  placeholder="กรอกเลข 13 หลัก"
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup 
                    label="ชื่อ" 
                    icon={<User size={18} />} 
                    value={formData.name}
                    onChange={(v) => setFormData({...formData, name: v})}
                    placeholder="ชื่อจริง"
                    required
                  />
                  <InputGroup 
                    label="นามสกุล" 
                    icon={<User size={18} />} 
                    value={formData.surname}
                    onChange={(v) => setFormData({...formData, surname: v})}
                    placeholder="นามสกุล"
                    required
                  />
                </div>

                <InputGroup 
                  label="โรงเรียน" 
                  icon={<School size={18} />} 
                  value={formData.school}
                  onChange={(v) => setFormData({...formData, school: v})}
                  placeholder="ชื่อสถานศึกษา"
                  required
                />

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">ตำแหน่ง</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Book size={18} /></div>
                    <select
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none text-sm appearance-none"
                    >
                      <option value="ครูอัตราจ้าง">ครูอัตราจ้าง</option>
                      <option value="พนักงานราชการ">พนักงานราชการ</option>
                      <option value="ครูผู้ช่วย">ครูผู้ช่วย</option>
                      <option value="ครู คศ.1">ครู คศ.1</option>
                      <option value="ครู คศ.2">ครู คศ.2</option>
                      <option value="ครู คศ.3">ครู คศ.3</option>
                      <option value="ครู คศ.4">ครู คศ.4</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup 
                    label="รหัสผ่าน" 
                    type="password"
                    icon={<Lock size={18} />} 
                    value={formData.password}
                    onChange={(v) => setFormData({...formData, password: v})}
                    placeholder="••••••••"
                    required
                  />
                  <InputGroup 
                    label="ยืนยันรหัสผ่าน" 
                    type="password"
                    padding="pl-2"
                    value={formData.confirmPassword}
                    onChange={(v) => setFormData({...formData, confirmPassword: v})}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลเพื่อรอการอนุมัติ'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, value, onChange, placeholder, type = 'text', required, padding }: any) {
  return (
    <div>
      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? 'pl-11' : padding || 'pl-4'} pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none text-sm`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function ShieldCheck({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
