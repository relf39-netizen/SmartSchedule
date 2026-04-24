import { useState, useEffect } from 'react';
import { 
  UserCheck, UserX, Clock, Search, School, User as UserIcon, 
  Database, Users, ShieldAlert, Trash2, FileText, LogIn, Activity,
  Settings, Calendar, Layout, Plus, CheckCircle2, AlertCircle, Save,
  Coffee, BookMarked, MapPin, GraduationCap, X, Hash
} from 'lucide-react';
import { Teacher, SystemSettings, FixedPeriod, Subject, ClassGrade, Room, TeachingAssignment } from '../types';

export default function AdminDashboard({ initialTab = 'members' }: { initialTab?: 'members' | 'system' | 'planning' | 'assignments' }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'planning' | 'assignments' | 'system'>(initialTab as any);
  
  useEffect(() => {
    setActiveTab(initialTab as any);
  }, [initialTab]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const res = await fetch('/api/admin/teachers');
    const data = await res.json();
    setTeachers(data);
    setLoading(false);
  };

  const handleApprove = async (id: number, status: 'active' | 'rejected' | 'pending') => {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    const data = await res.json();
    if (data.success) fetchTeachers();
  };

  const handleRoleChange = async (id: number, role: 'teacher' | 'admin') => {
    const res = await fetch('/api/admin/change-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role })
    });
    const data = await res.json();
    if (data.success) fetchTeachers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณต้องการลบสมาชิกรายนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) return;
    const res = await fetch('/api/admin/delete-teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) fetchTeachers();
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(filter.toLowerCase()) || 
    t.school.toLowerCase().includes(filter.toLowerCase()) ||
    t.citizen_id.includes(filter)
  );

  const pendingCount = teachers.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">ADMINISTRATOR CONTROL PANEL</span>
            <h1 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">การจัดการระบบการศึกษา</h1>
            <p className="text-slate-500 text-xs">บริหารจัดการสมาชิก ข้อมูลพื้นฐาน ภาระหน้าที่สอน และการตั้งค่าระบบจัดตาราง</p>
          </div>
          
          <nav className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl shrink-0 gap-1">
            <NavTab active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={<Users size={16} />} label="สมาชิก" count={pendingCount} />
            <NavTab active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Settings size={16} />} label="ตั้งค่าโรงเรียน" />
            <NavTab active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} icon={<FileText size={16} />} label="ภาระงานสอน" />
            <NavTab active={activeTab === 'planning'} onClick={() => setActiveTab('planning')} icon={<Database size={16} />} label="ฐานข้อมูล" />
          </nav>
        </div>
      </header>

      <div className="bg-[#f8fafc] min-h-[600px]">
        {activeTab === 'members' && (
          <div className="space-y-6">
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
                <div className="text-center py-20 text-slate-400 animate-pulse font-bold uppercase text-xs tracking-widest">กำลังโหลดข้อมูล...</div>
              ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-xs">ไม่พบข้อมูลสมาชิก</div>
              ) : (
                filteredTeachers.map(t => (
                  <TeacherRow key={t.id} t={t} onApprove={handleApprove} onRoleChange={handleRoleChange} onDelete={handleDelete} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'system' && <SystemSettingsView />}
        {activeTab === 'assignments' && <AssignmentManager teachers={teachers} />}
        {activeTab === 'planning' && <DatabaseSyncView />}
      </div>
    </div>
  );
}

function NavTab({ active, onClick, icon, label, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
        active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
      }`}
    >
      {icon}
      {label}
      {count > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{count}</span>}
    </button>
  );
}

function TeacherRow({ t, onApprove, onRoleChange, onDelete }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm shrink-0 ${
          t.status === 'active' ? 'bg-indigo-600 text-white' : 
          t.status === 'rejected' ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white'
        }`}>
          <UserIcon size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-black text-slate-900 text-base">{t.name} {t.surname}</h3>
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border tracking-widest ${
               t.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>{t.status === 'active' ? 'ACTIVE' : 'PENDING'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold mb-3">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
              <School size={12} className="text-slate-400" />
              <span>{t.school}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-tight">
              <Hash size={12} className="text-slate-400" />
              <span className="font-mono">{t.citizen_id}</span>
            </div>
            <div className={`px-2 py-1 rounded-lg uppercase tracking-widest text-[9px] ${t.role === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
              ROLE: {t.role}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><Activity size={12} /> {t.position}</div>
            <div className="flex items-center gap-1.5"><LogIn size={12} /> {t.login_count || 0} LOGINS</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onRoleChange(t.id, t.role === 'admin' ? 'teacher' : 'admin')} className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all">CHANGE ROLE</button>
        {t.status === 'pending' ? (
          <>
            <button onClick={() => onApprove(t.id, 'active')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95 uppercase text-[10px]">APPROVE</button>
            <button onClick={() => onDelete(t.id)} className="bg-white text-red-500 border border-red-100 px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all uppercase text-[10px]">REJECT</button>
          </>
        ) : (
          <button onClick={() => onDelete(t.id)} className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"><Trash2 size={16} /></button>
        )}
      </div>
    </div>
  );
}

function SystemSettingsView() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [fixedPeriods, setFixedPeriods] = useState<FixedPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newFixed, setNewFixed] = useState({ activity_name: '', day_of_week: 'Monday', period_number: 1, is_lunch_break: false });

  const fetchData = async () => {
    const [sRes, fRes] = await Promise.all([fetch('/api/settings'), fetch('/api/fixed-periods')]);
    setSettings(await sRes.json());
    setFixedPeriods(await fRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveSettings = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    setSaving(false);
    alert('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
  };

  const handleAddFixed = async (e: any) => {
    e.preventDefault();
    await fetch('/api/fixed-periods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFixed)
    });
    setNewFixed({ activity_name: '', day_of_week: 'Monday', period_number: 1, is_lunch_break: false });
    fetchData();
  };

  const handleDeleteFixed = async (id: number) => {
    await fetch(`/api/fixed-periods/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse font-bold uppercase text-xs">กำลังโหลด...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><School size={20} /></div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">ข้อมูลพื้นฐานสถานศึกษา</h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ชื่อโรงเรียน</label>
            <input required value={settings?.school_name} onChange={e => setSettings({...settings!, school_name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ปีการศึกษา</label>
              <input required value={settings?.academic_year} onChange={e => setSettings({...settings!, academic_year: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="เช่น 2567" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ภาคเรียน</label>
              <select value={settings?.semester} onChange={e => setSettings({...settings!, semester: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="ฤดูร้อน">ฤดูร้อน</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">จำนวนคาบ/วัน</label>
              <input type="number" required value={settings?.periods_per_day} onChange={e => setSettings({...settings!, periods_per_day: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-sm font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">เวลาคาบละ (นาที)</label>
              <input type="number" required value={settings?.period_duration} onChange={e => setSettings({...settings!, period_duration: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-sm font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">เวลาเริ่มคาบแรก</label>
              <input type="time" required value={settings?.start_time} onChange={e => setSettings({...settings!, start_time: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-sm font-bold outline-none" />
            </div>
          </div>
          <button disabled={saving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <Save size={18} />
            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าระบบ'}
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">คาบกิจกรรมคงที่ (Fixed Periods)</h3>
        </div>
        
        <form onSubmit={handleAddFixed} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ชื่อกิจกรรม</label>
              <input required value={newFixed.activity_name} onChange={e => setNewFixed({...newFixed, activity_name: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm outline-none" placeholder="เช่น ชุมนุม, พักเที่ยง" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">วันในสัปดาห์</label>
              <select value={newFixed.day_of_week} onChange={e => setNewFixed({...newFixed, day_of_week: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm outline-none">
                {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">คาบเรียนที่</label>
              <input type="number" required value={newFixed.period_number} onChange={e => setNewFixed({...newFixed, period_number: parseInt(e.target.value)})} className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm outline-none" min="1" max="15" />
            </div>
            <div className="flex items-center gap-2 h-full pt-4">
              <input type="checkbox" id="islunch" checked={newFixed.is_lunch_break} onChange={e => setNewFixed({...newFixed, is_lunch_break: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
              <label htmlFor="islunch" className="text-xs font-bold text-slate-600 cursor-pointer select-none">เป็นช่วงพักกลางวัน</label>
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
            <Plus size={14} /> เพิ่มภาระคงที่เข้าสู่ระบบ
          </button>
        </form>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {fixedPeriods.map(f => (
            <div key={f.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group hover:border-amber-200 transition-all">
              <div>
                <div className="text-xs font-black text-slate-900">{f.activity_name}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.day_of_week} • คาบที่ {f.period_number}</div>
              </div>
              <button onClick={() => handleDeleteFixed(f.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><X size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssignmentManager({ teachers }: { teachers: Teacher[] }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newAssign, setNewAssign] = useState({
    teacher_id: '',
    subject_id: '',
    class_id: '',
    hours_per_week: 1,
    is_double_period: false,
    main_room_id: '',
    backup_room_id: ''
  });

  const fetchData = async () => {
    const [subRes, clsRes, rmsRes, assRes] = await Promise.all([
      fetch('/api/subjects'),
      fetch('/api/classes'),
      fetch('/api/rooms'),
      fetch('/api/teaching-assignments')
    ]);
    setSubjects(await subRes.json());
    setClasses(await clsRes.json());
    setRooms(await rmsRes.json());
    setAssignments(await assRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    await fetch('/api/teaching-assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssign)
    });
    setNewAssign({
      teacher_id: '',
      subject_id: '',
      class_id: '',
      hours_per_week: 1,
      is_double_period: false,
      main_room_id: '',
      backup_room_id: ''
    });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/teaching-assignments/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse font-bold uppercase text-xs">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><BookMarked size={20} /></div>
           กำหนดภาระงานสอน
        </h3>

        <form onSubmit={handleAdd} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ผู้สอน</label>
              <select required value={newAssign.teacher_id} onChange={e => setNewAssign({...newAssign, teacher_id: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all">
                <option value="">-- เลือกครูผู้สอน --</option>
                {teachers.filter(t => t.status === 'active').map(t => <option key={t.id} value={t.id}>{t.name} {t.surname}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">กลุ่มเรียน</label>
              <select required value={newAssign.class_id} onChange={e => setNewAssign({...newAssign, class_id: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all">
                <option value="">-- เลือกกลุ่มเรียน --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">รายวิชา</label>
              <select required value={newAssign.subject_id} onChange={e => setNewAssign({...newAssign, subject_id: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all">
                <option value="">-- เลือกวิชา --</option>
                {subjects
                  .filter(s => !newAssign.class_id || s.level === classes.find(c => c.id.toString() === newAssign.class_id)?.level)
                  .map(s => <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>)
                }
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">จำนวนคาบ/สัปดาห์</label>
              <input type="number" required value={newAssign.hours_per_week} onChange={e => setNewAssign({...newAssign, hours_per_week: parseInt(e.target.value)})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold outline-none" min="1" max="15" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ห้องเรียนหลัก</label>
              <select value={newAssign.main_room_id} onChange={e => setNewAssign({...newAssign, main_room_id: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl text-sm font-bold outline-none">
                <option value="">-- อิงตามห้องประจำชั้น --</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
              </select>
            </div>

            <div className="flex items-end pb-3">
               <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                 <Plus size={16} /> บันทึกภาระงาน
               </button>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {assignments.map(a => (
            <div key={a.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">{a.class_name}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{a.subject_code}</span>
                </div>
                <h4 className="font-black text-slate-900 mb-1">{a.subject_name}</h4>
                <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                   <UserIcon size={12} className="text-slate-400" />
                   {a.teacher_name} {a.teacher_surname}
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                      <Clock size={12} /> {a.hours_per_week} คาบ
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                      <MapPin size={12} /> {a.main_room_name || 'ห้องประจำ'}
                   </div>
                </div>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-slate-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DatabaseSyncView() {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleDbSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatus('ปรับปรุงโครงสร้างฐานข้อมูลสำเร็จ ระบบพร้อมใช้งาน');
      } else {
        setSyncStatus(`เกิดข้อผิดพลาด: ${data.message}`);
      }
    } catch (e) {
      setSyncStatus('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
    setSyncing(false);
  };

  return (
    <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-inner">
        <Database size={48} className={syncing ? 'animate-bounce' : ''} />
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">การจัดการทรัพยากรระดับสูง</h3>
        <p className="text-slate-500 max-w-md mx-auto text-sm">อัปเดตและปรับแต่งโครงสร้างข้อมูล หากคุณทำการเปลี่ยนแปลงชุดข้อมูลขนาดใหญ่ผ่านสคริปต์ภายนอก หรือระบบแจ้งเตือนว่าฐานข้อมูลไม่ตรงกัน</p>
      </div>
      
      <button 
        onClick={handleDbSync}
        disabled={syncing}
        className={`px-10 py-5 rounded-3xl font-black text-white transition-all flex items-center gap-3 shadow-xl ${syncing ? 'bg-slate-400' : 'bg-slate-900 hover:bg-indigo-600 shadow-slate-200 active:scale-95'}`}
      >
        {syncing ? <Activity size={20} className="animate-spin" /> : <ShieldAlert size={20} />}
        {syncing ? 'กำลังปรับแต่งฐานข้อมูล...' : 'ตรวจสอบและอัปเดตระบบฐานข้อมูล'}
      </button>
      
      {syncStatus && (
        <div className={`mt-4 p-6 rounded-3xl text-sm font-black flex items-center gap-4 ${syncStatus.includes('สำเร็จ') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {syncStatus.includes('สำเร็จ') ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          {syncStatus}
        </div>
      )}
    </div>
  );
}
