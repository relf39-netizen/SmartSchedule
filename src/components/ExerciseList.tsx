import { useState, useEffect } from 'react';
import { FileText, Printer, Search, Calendar, ChevronRight, Edit2, Trash2, Library } from 'lucide-react';
import { Exercise } from '../types';

export default function ExerciseList({ onNavigate }: { onNavigate: (page: string, param?: string) => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    const apiBase = '/server.cjs';
    try {
      const res = await fetch(`${apiBase}/api/exercises`);
      const data = await res.json();
      setExercises(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('ยืนยันการลบแบบฝึกหัดนี้?')) return;
    
    const apiBase = '/server.cjs';
    try {
      const res = await fetch(`${apiBase}/api/exercises/${id}/delete`, { method: 'POST' });
      if (res.ok) {
        setExercises(prev => prev.filter(ex => ex.id !== id));
      } else {
        const errorText = await res.text();
        alert('ลบไม่สำเร็จ: ' + errorText);
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาดในการลบ: ' + e.message);
    }
  };

  const filtered = exercises.filter(ex => 
    ex.title.toLowerCase().includes(search.toLowerCase()) || 
    ex.course.toLowerCase().includes(search.toLowerCase())
  );

  // Group by Grade
  const grades = Array.from(new Set(filtered.map(ex => ex.grade))).sort();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Library</span>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">คลังแบบฝึกหัดส่วนตัว</h1>
            <p className="text-slate-500 text-sm">เรียกดู แก้ไข หรือสั่งพิมพ์แบบฝึกหัดที่คุณเคยสร้างไว้ โดยแบ่งตามระดับชั้น</p>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="ค้นหาชื่อ หรือวิชา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none w-full md:w-80 text-sm transition-all placeholder:text-slate-300"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse font-bold tracking-widest uppercase text-xs">กำลังโหลดข้อมูล...</div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-xs">
          <Library className="mx-auto mb-4 opacity-20" size={48} />
          <p>ยังไม่มีแบบฝึกหัดที่บันทึกไว้</p>
        </div>
      ) : grades.map(grade => (
        <section key={grade} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm">{grade}</span>
              ระดับชั้น {grade}
            </h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.filter(ex => ex.grade === grade).map(ex => (
              <div 
                key={ex.id} 
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                onClick={() => onNavigate('print', String(ex.id))}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                      <FileText size={18} />
                    </div>
                    <div className="flex items-center gap-1 no-print">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate('generate', String(ex.id)); }}
                        className="p-2 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                        title="แก้ไขแบบฝึกหัด"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, ex.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-indigo-500 tracking-widest leading-none">{ex.course}</p>
                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors uppercase truncate">
                      {ex.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-6">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                    <Calendar size={12} />
                    <span>{new Date(ex.created_at).toLocaleDateString('th-TH')}</span>
                  </div>
                  <div className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>PRINT PAGE</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
