import { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Search, School, User as UserIcon, Database, Users, ShieldAlert, Trash2, FileText, LogIn, Activity } from 'lucide-react';
import { Teacher } from '../types';

export default function AdminDashboard({ initialTab = 'members' }: { initialTab?: 'members' | 'system' }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'system'>(initialTab);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const apiBase = '/server.cjs';
    const res = await fetch(`${apiBase}/api/admin/teachers`);
    const data = await res.json();
    setTeachers(data);
    setLoading(false);
  };

  const handleApprove = async (id: number, status: 'active' | 'rejected' | 'pending') => {
    const apiBase = '/server.cjs';
    const res = await fetch(`${apiBase}/api/admin/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    const data = await res.json();
    if (data.success) {
      fetchTeachers();
    }
  };

  const handleRoleChange = async (id: number, role: 'teacher' | 'admin') => {
    const apiBase = '/server.cjs';
    const res = await fetch(`${apiBase}/api/admin/change-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role })
    });
    const data = await res.json();
    if (data.success) {
      fetchTeachers();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณต้องการลบสมาชิกรายนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) return;
    const apiBase = '/server.cjs';
    const res = await fetch(`${apiBase}/api/admin/delete-teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      fetchTeachers();
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(filter.toLowerCase()) || 
    t.school.toLowerCase().includes(filter.toLowerCase()) ||
    t.citizen_id.includes(filter)
  );

  const handleDbSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const apiBase = '/server.cjs';
      const res = await fetch(`${apiBase}/api/admin/db-sync`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatus('ปรับปรุงฐานข้อมูลเรียบร้อยแล้ว');
      } else {
        setSyncStatus('เกิดข้อผิดพลาด: ' + data.message);
      }
    } catch (err) {
      setSyncStatus('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setSyncing(false);
    }
  };

  const pendingCount = teachers.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">ADMINISTRATOR</span>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">หน้าจัดการระบบระบบ</h1>
            <p className="text-slate-500 text-xs">ดูแลสมาชิก ปรับปรุงฐานข้อมูล และตรวจสอบความปลอดภัย</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 relative ${activeTab === 'members' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users size={16} />
              จัดการสมาชิก
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'system' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Database size={16} />
              จัดการฐานข้อมูล
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'members' ? (
        <>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Search className="text-slate-400 ml-2" size={20} />
            <input 
              type="text" 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="ค้นหาตามชื่อ, โรงเรียน, หรือเลขบัตรประชาชน..."
              className="flex-1 bg-transparent border-none outline-none py-2 text-sm placeholder:text-slate-300"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="text-center py-20 text-slate-400 animate-pulse font-bold tracking-widest uppercase text-xs">กำลังโหลดข้อมูล...</div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-xs">
                ไม่พบข้อมูลสมาชิก
              </div>
            ) : (
              filteredTeachers.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm shrink-0 ${
                      t.status === 'active' ? 'bg-green-600 text-white shadow-green-100' : 
                      t.status === 'rejected' ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white shadow-amber-100'
                    }`}>
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-slate-900 leading-none">{t.name} {t.surname}</h3>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                           t.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 
                           t.status === 'rejected' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {t.status === 'active' ? 'อนุมัติแล้ว' : t.status === 'rejected' ? 'ปฏิเสธ' : 'รออนุมัติ'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-500">
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                          <School size={12} className="text-slate-400" />
                          <span className="font-bold text-slate-700">{t.school}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest leading-none">เลขบัตร:</span>
                          <span className="font-mono">{t.citizen_id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                          <Activity size={10} />
                          <span>{t.position}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 font-black text-[9px] uppercase border px-2 py-1 rounded-lg ${t.role === 'admin' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          <span>สิทธิ์: {t.role === 'admin' ? 'ผู้บริหารระบบ' : 'คุณครูทั่วไป'}</span>
                        </div>
                      </div>

                      {/* Statistics Section */}
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 group/stat">
                          <FileText size={14} className="text-indigo-500" />
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-indigo-400 uppercase leading-none">แบบฝึกที่สร้าง</span>
                            <span className="text-sm font-black text-indigo-700 leading-tight">{t.exercise_count || 0} รายการ</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                          <LogIn size={14} className="text-emerald-500" />
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-emerald-400 uppercase leading-none">เข้าใช้งาน</span>
                            <span className="text-sm font-black text-emerald-700 leading-tight">{t.login_count || 0} ครั้ง</span>
                          </div>
                        </div>

                        {t.last_login && (
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <Clock size={14} className="text-slate-400" />
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-400 uppercase leading-none">ล่าสุดเมื่อ</span>
                              <span className="text-[10px] font-bold text-slate-600 leading-tight">
                                {new Date(t.last_login).toLocaleDateString('th-TH', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: '2-digit', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleRoleChange(t.id, t.role === 'admin' ? 'teacher' : 'admin')}
                      className="bg-slate-50 text-[9px] font-bold text-slate-500 uppercase px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      {t.role === 'admin' ? 'ลดสิทธิ์' : 'เพิ่มเป็นแอดมิน'}
                    </button>
                    {t.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(t.id, 'active')}
                          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase text-[10px] tracking-widest"
                        >
                          <UserCheck size={14} />
                          <span>อนุมัติ</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="bg-white text-red-500 border border-red-100 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all uppercase text-[10px] tracking-widest"
                        >
                          <UserX size={14} />
                          <span>ไม่รับอนุมัติ (ลบ)</span>
                        </button>
                      </>
                    )}
                    {t.status !== 'pending' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleApprove(t.id, 'pending')}
                          className="text-slate-400 text-[9px] font-bold uppercase tracking-widest hover:text-indigo-600 px-3 py-1.5 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
                        >
                          ตรวจสอบใหม่
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-100"
                          title="ลบสมาชิก"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Database size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">จัดการโครงสร้างฐานข้อมูล</h3>
                <p className="text-slate-500 text-sm">ตรวจสอบและอัปเดตตารางฐานข้อมูลให้เป็นเวอร์ชันล่าสุด</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
              <div className="flex items-start gap-4">
                <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                <div className="text-sm text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-1">คำแนะนำการใช้งาน:</p>
                  ปุ่มนี้จะทำการ "Sync" ตารางที่จำเป็นทั้งหมดโดยอัตโนมัติ หากมีฟีเจอร์ใหม่หรือตารางที่ขาดหายไป 
                  ระบบจะทำการสร้าง (CREATE) ให้โดยไม่ลบข้อมูลเดิมที่มีอยู่
                </div>
              </div>
            </div>

            <button 
              onClick={handleDbSync}
              disabled={syncing}
              className={`w-full md:w-auto min-w-[200px] px-8 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${syncing ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
            >
              <Database size={20} />
              {syncing ? 'กำลังปรับปรุงฐานข้อมูล...' : 'อัปเดต / ปรับปรุงฐานข้อมูล'}
            </button>
            
            {syncStatus && (
              <div className={`mt-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${syncStatus.includes('สำเร็จ') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                <div className={`w-2 h-2 rounded-full ${syncStatus.includes('สำเร็จ') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {syncStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
