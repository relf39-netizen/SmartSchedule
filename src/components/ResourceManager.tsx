import { useState } from 'react';
import { Users, BookOpen, Warehouse, History, Plus, Trash2, Edit2, Save, X, ChevronRight } from 'lucide-react';
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

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
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
            icon={<History size={18} />} 
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
  const [items, setItems] = useState<Teacher[]>([]); // Mock or fetch
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-xl tracking-tight">รายชื่อคณะครู</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
          <Plus size={16} />
          เพิ่มรายชื่อครู
        </button>
      </div>
      
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">ชื่อ-นามสกุล</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">ตำแหน่ง</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="p-4">
                <div className="font-bold text-slate-900 text-sm">สมชาย รักเรียน</div>
                <div className="text-[10px] text-slate-400 font-medium">Citizen ID: 1234567890123</div>
              </td>
              <td className="p-4 text-sm text-slate-600 font-medium">ครูชำนาญการ</td>
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                  <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubjectManager() {
  return (
    <div className="space-y-6 text-center py-20">
      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen size={32} className="text-indigo-600" />
      </div>
      <h3 className="font-bold text-slate-900">จัดการรายวิชา</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">ฟีเจอร์นี้กำลังเชื่อมต่อกับระบบฐานข้อมูล กรุณารอสักครู่...</p>
    </div>
  );
}

function ClassManager() {
  return (
    <div className="space-y-6 text-center py-20">
      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <History size={32} className="text-white" />
      </div>
      <h3 className="font-bold text-slate-900">จัดการกลุ่มเรียน</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">กำหนดชั้นเรียน และห้องประจำของแต่ละกลุ่มเรียน</p>
    </div>
  );
}

function RoomManager() {
  return (
    <div className="space-y-6 text-center py-20">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Warehouse size={32} className="text-amber-600" />
      </div>
      <h3 className="font-bold text-slate-900">จัดการห้องเรียน</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">เพิ่มรายชื่อบุคลากรและห้องเรียนที่คุณต้องการจัดตาราง</p>
    </div>
  );
}
