import { useState, useEffect } from 'react';
import { Users, BookOpen, Warehouse, History, Plus, Trash2, Edit2, Save, X, ChevronRight, Hash, GraduationCap, MapPin, Building } from 'lucide-react';
import { Teacher, Subject, ClassGrade, Room } from '../types';

export default function ResourceManager({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [activeTab, setActiveTab] = useState<'teachers' | 'subjects' | 'classes' | 'rooms'>('teachers');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">การจัดการข้อมูลพื้นฐาน</h2>
          <p className="text-slate-500 text-sm">ตั้งค่าข้อมูลครู รายวิชา ห้องเรียน และชั้นเรียนเพื่อเตรียมจัดตาราง</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-2">
          <TabButton 
            active={activeTab === 'teachers'} 
            onClick={() => setActiveTab('teachers')} 
            icon={<Users size={18} />} 
            label="รายชื่อครู" 
          />
          <TabButton 
            active={activeTab === 'subjects'} 
            onClick={() => setActiveTab('subjects')} 
            icon={<BookOpen size={18} />} 
            label="รายวิชา" 
          />
          <TabButton 
            active={activeTab === 'classes'} 
            onClick={() => setActiveTab('classes')} 
            icon={<GraduationCap size={18} />} 
            label="กลุ่มเรียน / ชั้นเรียน" 
          />
          <TabButton 
            active={activeTab === 'rooms'} 
            onClick={() => setActiveTab('rooms')} 
            icon={<Warehouse size={18} />} 
            label="ห้องเรียน" 
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {activeTab === 'teachers' && <TeacherManager />}
          {activeTab === 'subjects' && <SubjectManager />}
          {activeTab === 'classes' && <ClassManager />}
          {activeTab === 'rooms' && <RoomManager />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
        active 
          ? 'bg-white text-indigo-600 shadow-sm border border-slate-200 ring-4 ring-indigo-50' 
          : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// --- Sub-Managers ---

function TeacherManager() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/teachers')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-xl tracking-tight">รายชื่อคณะครู</h3>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
          {items.length} คน
        </span>
      </div>
      
      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase text-xs tracking-widest">กำลังโหลด...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">ชื่อ-นามสกุล / ตำแหน่ง</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">เลขประจำตัว</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{t.name} {t.surname}</div>
                    <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">{t.position}</div>
                  </td>
                  <td className="p-4 text-sm font-mono text-slate-500">{t.citizen_id}</td>
                  <td className="p-4 text-right">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                      t.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {t.status === 'active' ? 'พร้อมสอน' : 'รออนุมัติ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SubjectManager() {
  const [items, setItems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState({ code: '', name: '', level: 'ม.1', weekly_hours: 1, color: '#4f46e5' });

  const fetchSubjects = () => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/subjects', {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-xl tracking-tight">คลังรายวิชา</h3>
        <button onClick={() => setShowAdd(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
          <Plus size={16} />
          เพิ่มวิชาใหม่
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
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
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">ยกเลิก</button>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all">บันทึกวิชา</button>
          </div>
        </form>
      )}

      {loading ? <div className="py-20 text-center text-slate-400 animate-pulse text-xs font-bold uppercase tracking-widest">กำลังโหลด...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(s => (
            <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group">
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

function ClassManager() {
  const [items, setItems] = useState<ClassGrade[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', level: 'ม.1', main_room_id: '' });

  const fetchData = async () => {
    const [cRes, rRes] = await Promise.all([fetch('/api/classes'), fetch('/api/rooms')]);
    setItems(await cRes.json());
    setRooms(await rRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass)
    });
    if (res.ok) {
      setShowAdd(false);
      fetchData();
      setNewClass({ name: '', level: 'ม.1', main_room_id: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-xl tracking-tight">การจัดการชั้นเรียน</h3>
        <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all">
          <Plus size={16} />
          เพิ่มกลุ่มเรียน
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">ชื่อกลุ่มเรียน</label>
              <input required value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} className="w-full bg-white border border-indigo-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-indigo-500" placeholder="เช่น ม.1/1" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">ระดับชั้น</label>
              <select value={newClass.level} onChange={e => setNewClass({...newClass, level: e.target.value})} className="w-full bg-white border border-indigo-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-indigo-500">
                {['ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">ห้องประจำ</label>
              <select value={newClass.main_room_id} onChange={e => setNewClass({...newClass, main_room_id: e.target.value})} className="w-full bg-white border border-indigo-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-indigo-500">
                <option value="">-- ไม่ระบุ --</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">ยกเลิก</button>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700">ยืนยันการเพิ่ม</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs">
                {c.level}
              </div>
              <div>
                <h4 className="font-black text-slate-900 leading-none">{c.name}</h4>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Main Group</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
              <MapPin size={14} className="text-slate-400" />
              <span>ห้องประจำ: {c.room_name || 'ไม่ระบุ'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomManager() {
  const [items, setItems] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', type: 'ทั่วไป', capacity: 40 });

  const fetchRooms = () => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoom)
    });
    if (res.ok) {
      setShowAdd(false);
      fetchRooms();
      setNewRoom({ name: '', type: 'ทั่วไป', capacity: 40 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-xl tracking-tight">การจัดการห้องเรียน</h3>
        <button onClick={() => setShowAdd(true)} className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-amber-700 transition-all">
          <Plus size={16} />
          เพิ่มห้องเรียน
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-amber-50 p-6 rounded-2xl border border-amber-100 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-1">ชื่อห้อง</label>
              <input required value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} className="w-full bg-white border border-amber-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-amber-500" placeholder="เช่น ห้อง 211" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-1">ประเภท</label>
              <select value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})} className="w-full bg-white border border-amber-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-amber-500">
                <option value="ทั่วไป">ทั่วไป</option>
                <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
                <option value="วิทยาศาสตร์">วิทยาศาสตร์</option>
                <option value="ศิลปะ">ศิลปะ</option>
                <option value="พละศึกษา">พละศึกษา</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-1">ความจุ (คน)</label>
              <input type="number" required value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})} className="w-full bg-white border border-amber-200 px-4 py-2 rounded-xl text-sm outline-none focus:border-amber-500" min="1" max="100" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">ยกเลิก</button>
            <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-amber-700">บันทึกข้อมูล</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(r => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-200 transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Building size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 leading-none mb-1">{r.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">{r.type}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.capacity} Seats</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
