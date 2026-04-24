import { useState, useEffect } from 'react';
import { Calendar, Sparkles, Download, Save, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Hash, Clock, Users, BookOpen, GraduationCap, MapPin, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Teacher, Subject, ClassGrade, Room, SystemSettings, FixedPeriod, TeachingAssignment, ScheduleSlot } from '../types';

export default function TimetableGenerator({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<{
    settings: SystemSettings | null,
    fixed: FixedPeriod[],
    teachers: Teacher[],
    subjects: Subject[],
    classes: ClassGrade[],
    rooms: Room[],
    assignments: TeachingAssignment[]
  }>({
    settings: null, fixed: [], teachers: [], subjects: [], classes: [], rooms: [], assignments: []
  });
  const apiBase = '/server.cjs';

  const [masterSchedule, setMasterSchedule] = useState<ScheduleSlot[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [sSet, sFix, sTea, sSub, sCla, sRoo, sAss] = await Promise.all([
      fetch(`${apiBase}/api/settings`).then(r => r.json()),
      fetch(`${apiBase}/api/fixed-periods`).then(r => r.json()),
      fetch(`${apiBase}/api/admin/teachers`).then(r => r.json()),
      fetch(`${apiBase}/api/subjects`).then(r => r.json()),
      fetch(`${apiBase}/api/classes`).then(r => r.json()),
      fetch(`${apiBase}/api/rooms`).then(r => r.json()),
      fetch(`${apiBase}/api/teaching-assignments`).then(r => r.json()),
    ]);
    setData({ settings: sSet, fixed: sFix, teachers: sTea, subjects: sSub, classes: sCla, rooms: sRoo, assignments: sAss });
    if (sCla.length > 0) setSelectedClassId(sCla[0].id);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setMasterSchedule([]);

    setTimeout(() => {
      const schedule: ScheduleSlot[] = [];
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const periodsPerDay = data.settings?.periods_per_day || 8;

      // 1. Add Fixed Periods
      data.fixed.forEach(fp => {
        data.classes.forEach(cls => {
          schedule.push({
            day: fp.day_of_week,
            period: fp.period_number,
            subjectId: 0,
            teacherId: 0,
            isFixed: true,
            activityName: fp.activity_name,
            classId: cls.id
          } as any);
        });
      });

      // 2. Assign Teaching Tasks (Simple)
      let currentAssignments = JSON.parse(JSON.stringify(data.assignments));
      
      days.forEach(day => {
        for (let p = 1; p <= periodsPerDay; p++) {
          data.classes.forEach(cls => {
            if (schedule.find(s => s.day === day && s.period === p && (s as any).classId === cls.id)) return;

            const possibleAssign = currentAssignments.find((a: any) => a.class_id === cls.id && a.hours_per_week > 0);
            
            if (possibleAssign) {
              const teacherBusy = schedule.find(s => s.day === day && s.period === p && s.teacherId === possibleAssign.teacher_id);
              const roomBusy = schedule.find(s => s.day === day && s.period === p && s.roomId === (possibleAssign.main_room_id || cls.main_room_id));

              if (!teacherBusy && !roomBusy) {
                  schedule.push({
                    day: day,
                    period: p,
                    subjectId: possibleAssign.subject_id,
                    teacherId: possibleAssign.teacher_id,
                    roomId: possibleAssign.main_room_id || cls.main_room_id || 0,
                    classId: cls.id
                  } as any);
                  possibleAssign.hours_per_week--;
              }
            }
          });
        }
      });

      setMasterSchedule(schedule);
      setGenerating(false);
      setStep(3);
    }, 2000);
  };

  const classSchedule = masterSchedule.filter(s => (s as any).classId === selectedClassId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">SmartSchedule AI: ระบบจัดตารางอัตโนมัติ</h2>
          <p className="text-slate-500 text-sm mt-1">ประมวลผลตารางสอนโดยคำนึงถึงภาระงานและคาบที่กำหนดไว้คงที่</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm shrink-0">
            <div className={`w-3 h-3 rounded-full transition-all ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            <div className="w-8 h-0.5 bg-slate-100"></div>
            <div className={`w-3 h-3 rounded-full transition-all ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            <div className="w-8 h-0.5 bg-slate-100"></div>
            <div className={`w-3 h-3 rounded-full transition-all ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
              <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Hash size={18} /></div>
                ข้อมูลเตรียมความพร้อม
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <StatCard icon={<Users size={16} />} label="คุณครู" value={data.teachers.filter(t => t.status === 'active').length} />
                 <StatCard icon={<BookOpen size={16} />} label="รายวิชา" value={data.subjects.length} />
                 <StatCard icon={<GraduationCap size={16} />} label="กลุ่มเรียน" value={data.classes.length} />
                 <StatCard icon={<Calendar size={16} />} label="ภาระงานสอน" value={data.assignments.length} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                   <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                      <AlertCircle className="text-amber-500" size={18} />
                      กฎของการจัดตาราง
                   </h4>
                   <ul className="space-y-4 text-xs font-bold text-slate-500">
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 size={12} className="text-green-500" /></div>
                        <span>ครูไม่สอนซ้อน / ห้องเรียนไม่ใช้วิชาซ้อน</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 size={12} className="text-green-500" /></div>
                        <span>กำหนดวิชาคงที่ (เช่น ชุมนุม, พักเที่ยง) ลงทุกตาราง</span>
                      </li>
                   </ul>
                </div>
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                   <div className="relative">
                      <h4 className="font-black text-2xl mb-2 tracking-tight">พร้อมประมวลผลหรือไม่?</h4>
                      <p className="text-slate-400 text-xs font-medium">ระบบจะจัดสรรภาระงานที่ Admin กำหนดทั้งหมดลงในตารางให้เหมาะสมที่สุด</p>
                   </div>
                   <button 
                    onClick={() => setStep(2)}
                    className="mt-8 w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                   >
                     เริ่มประมวลผลตารางสอน
                     <ChevronRight size={18} />
                   </button>
                </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 space-y-8">
             <div className="w-40 h-40 border-8 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
             <div className="text-center">
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">SmartSchedule AI กำลังรวบรวมข้อมูล</h3>
                <p className="text-slate-500 text-sm font-medium">กำลังจัดสรรภาระงานสอนลงในตารางสัปดาห์...</p>
             </div>
             {!generating && (
                <button onClick={handleGenerate} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">
                    ดูผลลัพธ์
                </button>
             )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">การประมวลผลเสร็จสิ้น</div>
                        <div className="font-black text-slate-900 text-lg tracking-tight">ตารางเรียนถูกจัดเรียงตามเงื่อนไขสำเร็จ</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                   <select value={selectedClassId || ''} onChange={e => setSelectedClassId(parseInt(e.target.value))} className="bg-slate-100 border-none rounded-xl px-4 py-2 text-xs font-black text-slate-700 outline-none">
                      {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                   <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        ส่งออกข้อมูล
                    </button>
                </div>
             </div>

             <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-6 overflow-x-auto">
                   <table className="w-full min-w-[1200px] border-separate border-spacing-3">
                       <thead>
                            <tr>
                                <th className="w-24"></th>
                                {Array.from({length: data.settings?.periods_per_day || 8}).map((_, i) => (
                                    <th key={i} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">PERIOD {i+1}</div>
                                        <div className="text-[10px] font-black text-slate-900">
                                            {formatTime(data.settings?.start_time || '08:30:00', i, data.settings?.period_duration || 50)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                       </thead>
                       <tbody>
                           {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                               <tr key={day}>
                                   <td className="p-4 bg-slate-900 text-white rounded-3xl text-center font-black text-[10px] uppercase tracking-widest w-16">
                                       {day}
                                   </td>
                                   {Array.from({length: data.settings?.periods_per_day || 8}).map((_, i) => {
                                       const p = i + 1;
                                       const slot = classSchedule.find(s => s.day === day && s.period === p);
                                       const subject = slot ? data.subjects.find(s => s.id === slot.subjectId) : null;
                                       const teacher = slot ? data.teachers.find(t => t.id === slot.teacherId) : null;
                                       const room = slot ? data.rooms.find(r => r.id === slot.roomId) : null;

                                       return (
                                           <td key={p} className="h-28 min-w-[140px]">
                                               {slot ? (
                                                  <div className={`p-4 rounded-[28px] border h-full flex flex-col justify-between transition-all hover:scale-105 ${slot.isFixed ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                                                      <div className="flex flex-col gap-1">
                                                         <div className={`text-[8px] font-black uppercase tracking-tighter w-fit px-1.5 py-0.5 rounded ${slot.isFixed ? 'bg-amber-200 text-amber-700' : 'bg-indigo-50 text-indigo-600'}`}>
                                                            {slot.isFixed ? 'FIXED' : subject?.code}
                                                         </div>
                                                         <div className="text-[11px] font-black text-slate-900 leading-tight">
                                                            {slot.isFixed ? slot.activityName : subject?.name}
                                                         </div>
                                                      </div>
                                                      {!slot.isFixed && (
                                                        <div className="mt-2 space-y-1">
                                                           <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                                              <Users size={10} /> {teacher?.name}
                                                           </div>
                                                           <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                                              <MapPin size={10} /> {room?.name}
                                                           </div>
                                                        </div>
                                                      )}
                                                  </div>
                                               ) : (
                                                  <div className="p-4 rounded-[28px] border border-dashed border-slate-200 h-full flex items-center justify-center opacity-30 italic text-[10px] text-slate-400">
                                                     EMPTY
                                                  </div>
                                               )}
                                           </td>
                                       );
                                   })}
                               </tr>
                           ))}
                       </tbody>
                   </table>
             </div>

             <div className="flex items-center justify-center pt-8">
                  <button onClick={() => setStep(1)} className="flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all">
                     <ChevronLeft size={16} /> กลับไปตั้งค่าใหม่
                  </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
       <div className="w-10 h-10 bg-white border border-slate-100 text-slate-600 rounded-xl flex items-center justify-center shadow-sm">{icon}</div>
       <div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
          <div className="text-lg font-black text-slate-900">{value}</div>
       </div>
    </div>
  );
}

function formatTime(startTime: string, periodIndex: number, duration: number) {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + (periodIndex * duration);
  const startH = Math.floor(totalMinutes / 60);
  const startM = totalMinutes % 60;
  const endMinutes = totalMinutes + duration;
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  return `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')} - ${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}
