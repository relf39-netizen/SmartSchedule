import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, MoreHorizontal, FileText, Trash2, Download, Printer, User, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ScheduleHistory({ onNavigate }: { onNavigate: (p: string, param?: string) => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">คลังตารางที่บันทึกไว้</h2>
          <p className="text-slate-500 text-sm">เรียกดู จัดการ หรือส่งออกตารางสอนที่ระบบเคยประมวลผลไว้</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[28px] border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อตาราง หรือวันที่บันทึก..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
            <button className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 border border-slate-100 transition-all">
                <Filter size={18} />
            </button>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-slate-200 hover:scale-105 transition-transform active:scale-95">
                ค้นหาข้อมูล
            </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-bold">กำลังดึงข้อมูลตารางสอน...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ScheduleCard 
            title="ตารางเรียนภาคเรียนที่ 1/2567" 
            date="24 เม.ย. 2567" 
            classes={6}
            teachers={12}
            status="Complete"
          />
          <ScheduleCard 
            title="ตารางเรียนปรับพื้นฐาน" 
            date="10 เม.ย. 2567" 
            classes={2}
            teachers={4}
            status="Draft"
          />
          <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-300 transition-all hover:bg-indigo-50/20" onClick={() => onNavigate('generator')}>
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="text-slate-300 group-hover:text-indigo-400" size={32} />
             </div>
             <p className="text-slate-400 text-sm font-bold group-hover:text-indigo-900">เริ่มจัดตารางใหม่</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleCard({ title, date, classes, teachers, status }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group transition-all hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/5">
      <div className="flex items-start justify-between mb-8">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500 shadow-sm">
          <Calendar size={24} />
        </div>
        <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${status === 'Complete' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
          {status}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-2 truncate pr-4">{title}</h3>
      <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-tight mb-8">
         <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <Clock size={12} />
            {date}
         </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
         <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-400 mb-1 uppercase font-black tracking-tight">ชั้นเรียน</div>
            <div className="text-sm font-black text-slate-700">{classes} ห้อง</div>
         </div>
         <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-400 mb-1 uppercase font-black tracking-tight">ครูผู้สอน</div>
            <div className="text-sm font-black text-slate-700">{teachers} คน</div>
         </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
         <button className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
            เปิดดูรายละเอียด
            <ChevronRight size={14} />
         </button>
         <button className="p-3.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl border border-slate-100 transition-all">
            <Trash2 size={18} />
         </button>
      </div>
    </motion.div>
  );
}
