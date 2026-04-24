import { useState, useEffect } from 'react';
import { 
  UserCheck, UserX, Clock, Search, School, User as UserIcon, 
  Database, Users, ShieldAlert, Trash2, FileText, LogIn, Activity,
  Settings, Calendar, Layout, Plus, CheckCircle2, AlertCircle, Save,
  Coffee, BookMarked, MapPin, GraduationCap, X, Hash
} from 'lucide-react';
import { Teacher, SystemSettings, FixedPeriod, Subject, ClassGrade, Room, TeachingAssignment, User } from '../types';

export default function AdminDashboard({ user, initialTab = 'members' }: { user: User, initialTab?: 'members' | 'system' | 'planning' | 'assignments' | 'teachers' | 'subjects' | 'classes' | 'rooms' }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'planning' | 'assignments' | 'system' | 'teachers' | 'subjects' | 'classes' | 'rooms'>(initialTab as any);
  
  const isSuperAdmin = user.id === 0 || user.citizen_id === 'peyarm';
  const apiBase = '/server.cjs';

  useEffect(() => {
    setActiveTab(initialTab as any);
    if (!isSuperAdmin && initialTab === 'members') {
      setActiveTab('system');
    }
  }, [initialTab, isSuperAdmin]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const res = await fetch(`${apiBase}/api/admin/teachers`);
    const data = await res.json();
    setTeachers(data);
    setLoading(false);
  };

  const handleApprove = async (id: number, status: 'active' | 'rejected' | 'pending') => {
    const res = await fetch(`${apiBase}/api/admin/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    const data = await res.json();
    if (data.success) fetchTeachers();
  };

  const handleRoleChange = async (id: number, role: 'teacher' | 'admin') => {
    const res = await fetch(`${apiBase}/api/admin/change-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role })
    });
    const data = await res.json();
    if (data.success) fetchTeachers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณต้องการลบสมาชิกรายนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) return;
    const res = await fetch(`${apiBase}/api/admin/delete-teacher`, {
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
    t.citizen_id?.includes(filter)
  );

  const pendingCount = teachers.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">ADMINISTRATOR CONTROL PANEL</span>
            <h1 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
               {isSuperAdmin ? 'ระบบจัดการส่วนกลาง' : 'การจัดการโรงเรียน'}
            </h1>
            <p className="text-slate-500 text-xs">บริหารจัดการสมาชิก ข้อมูลพื้นฐาน ภาระหน้าที่สอน และการตั้งค่าระบบจัดตาราง</p>
          </div>
          
          <nav className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl shrink-0 gap-1">
            {isSuperAdmin ? (
              <NavTab active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={<Users size={16} />} label="สมาชิก" count={pendingCount} />
            ) : (
              <>
                <NavTab active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Settings size={16} />} label="ข้อมูลโรงเรียน" />
                <NavTab active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} icon={<BookMarked size={16} />} label="รายวิชา" />
                <NavTab active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} icon={<GraduationCap size={16} />} label="ชั้นเรียน/กลุ่ม" />
                <NavTab active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} icon={<MapPin size={16} />} label="ห้องเรียน" />
                <NavTab active={activeTab === 'assignments'} onClick={() => setActiveTab('assignments')} icon={<FileText size={16} />} label="ภาระงานสอน" />
              </>
            )}
            <NavTab active={activeTab === 'planning'} onClick={() => setActiveTab('planning')} icon={<Database size={16} />} label="จัดการฐานข้อมูล" />
          </nav>
        </div>
      </header>

      <div className="bg-[#f8fafc] min-h-[600px]">
        {activeTab === 'members' && isSuperAdmin && (
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

        {activeTab === 'system' && !isSuperAdmin && <SystemSettingsView />}
        {activeTab === 'assignments' && !isSuperAdmin && <AssignmentManager teachers={teachers} />}
        {activeTab === 'planning' && <DatabaseSyncView />}
        
        {/* Resource Tabs */}
        {activeTab === 'subjects' && !isSuperAdmin && <SubjectManagerTab />}
        {activeTab === 'classes' && !isSuperAdmin && <ClassManagerTab />}
        {activeTab === 'rooms' && !isSuperAdmin && <RoomManagerTab />}
      </div>
    </div>
  );
}

function SubjectManagerTab() {
  const [items, setItems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState({ code: '', name: '', level: 'ม.1', weekly_hours: 1, color: '#4f46e5' });
  const apiBase = '/server.cjs';

  const fetchSubjects = () => {
    fetch(`${apiBase}/api/subjects`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const res = await fetch(`${apiBase}/api/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSub)
    });
    if (res.ok) {
      setShowAdd(false);
      fetchSubjects();
      setNewSub({ code: '', name: '', level: 'ม.1', weekly_hours: 1, color: '#4f46e5' });
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-3">
           <BookMarked size={24} className="text-indigo-600" />
           การจัดการรายวิชา
        </h3>
        <button onClick={() => setShowAdd(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
          <Plus size={16} /> เพิ่มวิชาใหม่
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">รหัสวิชา</label>
              <input required value={newSub.code} onChange={e => setNewSub({...newSub, code: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-indigo-500" placeholder="เช่น ท21101" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ชื่อวิชา</label>
              <input required value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-indigo-500" placeholder="เช่น ภาษาไทย" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ระดับชั้น</label>
              <select value={newSub.level} onChange={e => setNewSub({...newSub, level: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-indigo-500">
                {['ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">คาบ/สัปดาห์</label>
              <input type="number" required value={newSub.weekly_hours} onChange={e => setNewSub({...newSub, weekly_hours: parseInt(e.target.value)})} className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-indigo-500" min="1" max="10" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">ยกเลิก</button>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700">บันทึกวิชา</button>
          </div>
        </form>
      )}

      {loading ? <div className="py-20 text-center text-slate-400 animate-pulse text-xs font-bold tracking-widest uppercase">กำลังโหลดข้อมูล...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(s => (
            <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs" style={{backgroundColor: s.color || '#4f46e5'}}>
                  <Hash size={16} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.code}</div>
                  <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{s.level}</div>
                </div>
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{s.name}</h4>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock size={12} />
                <span>{s.weekly_hours} คาบต่อสัปดาห์</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClassManagerTab() {
  const [items, setItems] = useState<ClassGrade[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newClass, setNewClass] = useState({ level: 'ป.1', room_number: '1' });
  const apiBase = '/server.cjs';

  const fetchData = async () => {
    const [cRes, rRes] = await Promise.all([
      fetch(`${apiBase}/api/classes`),
      fetch(`${apiBase}/api/rooms`)
    ]);
    setItems(await cRes.json());
    setRooms(await rRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    // Transform to existing schema: name = level/room_number
    const payload = {
      name: `${newClass.level}/${newClass.room_number}`,
      level: newClass.level,
      main_room_id: null
    };
    const res = await fetch(`${apiBase}/api/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setShowAdd(false);
      fetchData();
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-3">
          <GraduationCap size={24} className="text-indigo-600" />
          การจัดการชั้นเรียน/กลุ่มเรียน
        </h3>
        <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all">
          <Plus size={16} /> เพิ่มชั้นเรียน
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">ระดับชั้น</label>
              <select value={newClass.level} onChange={e => setNewClass({...newClass, level: e.target.value})} className="w-full bg-white border border-indigo-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-indigo-500">
                {['อ.1','อ.2','อ.3','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">ห้องที่ (เช่น 1, 2, ก, ข)</label>
              <input required value={newClass.room_number} onChange={e => setNewClass({...newClass, room_number: e.target.value})} className="w-full bg-white border border-indigo-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-indigo-500" placeholder="เช่น 1" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs font-bold text-slate-400">ยกเลิก</button>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700">บันทึกข้อมูล</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs">
                {c.level}
              </div>
              <h4 className="font-black text-slate-900 leading-none">{c.name}</h4>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ระดับ {c.level}</div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="col-span-full py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl text-sm">ยังไม่มีข้อมูลชั้นเรียน</div>
        )}
      </div>
    </div>
  );
}

function RoomManagerTab() {
  const [items, setItems] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoom, setNewRoom] = useState({ code: '', name: '' });
  const apiBase = '/server.cjs';

  const fetchRooms = () => {
    fetch(`${apiBase}/api/rooms`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    // code + name combined or used separately
    // The schema was { school, name, type, capacity }
    // We'll map code/name to name/type or just use as is
    const payload = {
      name: newRoom.name,
      type: newRoom.code, // Store code in type for now or vice versa
      capacity: 40
    };
    const res = await fetch(`${apiBase}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setShowAdd(false);
      fetchRooms();
      setNewRoom({ code: '', name: '' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบห้องเรียนนี้?')) return;
    await fetch(`${apiBase}/api/rooms/${id}`, { method: 'DELETE' });
    fetchRooms();
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-3">
          <MapPin size={24} className="text-indigo-600" />
          การจัดการห้องเรียน
        </h3>
        <button onClick={() => setShowAdd(true)} className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-amber-700 transition-all">
          <Plus size={16} /> เพิ่มห้องเรียน
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-1">รหัสห้องเรียน</label>
              <input required value={newRoom.code} onChange={e => setNewRoom({...newRoom, code: e.target.value})} className="w-full bg-white border border-amber-200 px-4 py-2 rounded-xl text-sm outline-none" placeholder="เช่น 211" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-1">ชื่อห้องเรียน</label>
              <input required value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} className="w-full bg-white border border-amber-200 px-4 py-2 rounded-xl text-sm outline-none" placeholder="เช่น ห้องปฏิบัติการทางภาษา" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs font-bold text-slate-400">ยกเลิก</button>
            <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded-xl text-xs font-bold">บันทึกข้อมูล</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(r => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-200 transition-all group relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-900 mb-0.5 truncate">{r.name}</h4>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">CODE: {r.type}</div>
              </div>
            </div>
            <button onClick={() => handleDelete(r.id)} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <X size={14} />
            </button>
          </div>
        ))}
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
  
  const [newFixed, setNewFixed] = useState({ activity_name: '', day_of_week: 'Monday', period_number: 8, is_lunch_break: false });
  const [lunchPeriod, setLunchPeriod] = useState(4);
  const apiBase = '/server.cjs';

  const fetchData = async () => {
    const [sRes, fRes] = await Promise.all([fetch(`${apiBase}/api/settings`), fetch(`${apiBase}/api/fixed-periods`)]);
    setSettings(await sRes.json());
    setFixedPeriods(await fRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveSettings = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`${apiBase}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    setSaving(false);
    alert('บันทึกข้อมูลเรียบร้อยแล้ว');
  };

  const handleAddFixed = async (e: any) => {
    e.preventDefault();
    await fetch(`${apiBase}/api/fixed-periods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFixed)
    });
    setNewFixed({ activity_name: '', day_of_week: 'Monday', period_number: 8, is_lunch_break: false });
    fetchData();
  };

  const handleSaveLunch = async () => {
    await fetch(`${apiBase}/api/fixed-periods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity_name: 'พักรับประทานอาหารกลางวัน',
        day_of_week: 'Monday',
        period_number: lunchPeriod,
        is_lunch_break: true,
        apply_all_week: true
      })
    });
    fetchData();
    alert('บันทึกเวลาพักกลางวัน 5 วันเรียบร้อยแล้ว');
  };

  const handleDeleteFixed = async (id: number) => {
    await fetch(`${apiBase}/api/fixed-periods/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse font-bold uppercase text-xs">กำลังโหลด...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="space-y-8">
        {/* School Base Settings */}
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
            <button disabled={saving} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <Save size={18} />
              {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าขอมูลโรงเรียน'}
            </button>
          </form>
        </div>

        {/* Separate Lunch Break Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Coffee size={20} /></div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">กำหนดเวลาพักกลางวัน</h3>
          </div>
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <p className="text-xs font-bold text-orange-700 mb-4">* ระบบจะทำการบล็อกคาบที่เลือกนี้ทั้ง 5 วัน (จันทร์-ศุกร์) เพื่อเป็นเวลาพักกลางวัน</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1">เลือกคาบที่พักกลางวัน</label>
                <select value={lunchPeriod} onChange={e => setLunchPeriod(parseInt(e.target.value))} className="w-full bg-white border border-orange-200 px-4 py-3 rounded-xl text-sm font-bold outline-none">
                  {[1,2,3,4,5,6,7,8,9,10].map(p => <option key={p} value={p}>คาบที่ {p}</option>)}
                </select>
              </div>
              <button onClick={handleSaveLunch} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all mt-5">บันทึกเวลาพัก</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Fixed Activity (Non-Lunch) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">กิจกรรมคงที่ (เช่น ชุมนุม, ประชุม)</h3>
          </div>
          
          <form onSubmit={handleAddFixed} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ชื่อกิจกรรม</label>
                <input required value={newFixed.activity_name} onChange={e => setNewFixed({...newFixed, activity_name: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm outline-none" placeholder="เช่น กิจกรรมชุมนุม" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">วันในสัปดาห์</label>
                <select value={newFixed.day_of_week} onChange={e => setNewFixed({...newFixed, day_of_week: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm outline-none">
                  {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">คาบเรียนที่</label>
              <input type="number" required value={newFixed.period_number} onChange={e => setNewFixed({...newFixed, period_number: parseInt(e.target.value)})} className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm outline-none" min="1" max="15" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
              <Plus size={14} /> เพิ่มกิจกรรมคงที่
            </button>
          </form>

          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">รายการที่กำหนดไว้</h4>
             <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {fixedPeriods.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 rounded-2xl">ยังไม่มีกิจกรรมที่บันทึกไว้</div>
              ) : fixedPeriods.sort((a,b) => a.day_of_week.localeCompare(b.day_of_week) || a.period_number - b.period_number).map(f => (
                <div key={f.id} className={`flex items-center justify-between p-4 border rounded-2xl group transition-all ${f.is_lunch_break ? 'bg-orange-50 border-orange-100' : 'bg-white border-slate-100 hover:border-amber-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${f.is_lunch_break ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                      {f.is_lunch_break ? <Coffee size={14} /> : <Calendar size={14} />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{f.activity_name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.day_of_week} • คาบที่ {f.period_number}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteFixed(f.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
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
  const apiBase = '/server.cjs';

  const fetchData = async () => {
    const [subRes, clsRes, rmsRes, assRes] = await Promise.all([
      fetch(`${apiBase}/api/subjects`),
      fetch(`${apiBase}/api/classes`),
      fetch(`${apiBase}/api/rooms`),
      fetch(`${apiBase}/api/teaching-assignments`)
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
    await fetch(`${apiBase}/api/teaching-assignments`, {
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
    await fetch(`${apiBase}/api/teaching-assignments/${id}`, { method: 'DELETE' });
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
    const apiBase = '/server.cjs';
    try {
      const res = await fetch(`${apiBase}/api/admin/db-sync`, { method: 'POST' });
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
