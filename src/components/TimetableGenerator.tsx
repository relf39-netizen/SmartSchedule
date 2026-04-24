import { useState } from 'react';
import { Calendar, Sparkles, Download, Save, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Hash, Clock, Users, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Teacher, Subject, ClassGrade, Room, ClassSchedule, ScheduleSlot } from '../types';

export default function TimetableGenerator({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [scheduleResult, setScheduleResult] = useState<ClassSchedule[] | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setScheduleResult(null);

    // Mock automatic generation with a slight delay
    setTimeout(() => {
        const mockResult: ClassSchedule[] = [
            {
                classId: 'G1-1',
                slots: [
                    { day: 0, period: 1, subjectId: 'MATH1', teacherId: 1, roomId: 'R101' },
                    { day: 0, period: 2, subjectId: 'ENG1', teacherId: 2, roomId: 'R101' },
                    { day: 0, period: 3, subjectId: 'THAI1', teacherId: 3, roomId: 'R101' },
                    { day: 1, period: 1, subjectId: 'SCI1', teacherId: 4, roomId: 'LAB1' },
                ]
            }
        ];
        setScheduleResult(mockResult);
        setGenerating(false);
        setStep(3);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">จัดตารางสอนอัตโนมัติ</h2>
          <p className="text-slate-500 text-sm">ระบบจะประมวลผลคาบเรียนที่เหมาะสมที่สุดเพื่อป้องกันการซ้อนทับ</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            <div className="w-8 h-0.5 bg-slate-100"></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            <div className="w-8 h-0.5 bg-slate-100"></div>
            <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Hash className="text-indigo-600" size={20} />
                ตั้งค่าพื้นฐาน
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">จำลองคาบเรียนต่อวัน</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                    <option>6 คาบ</option>
                    <option selected>8 คาบ</option>
                    <option>10 คาบ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">วันทำการ</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                    <option selected>จันทร์ - ศุกร์</option>
                    <option>จันทร์ - เสาร์</option>
                    <option>ทุกวัน</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">พ่วงคาบพักเบรก</label>
                   <div className="flex items-center gap-4 py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <input type="checkbox" checked className="w-4 h-4 rounded text-indigo-600" />
                      <span className="text-sm font-bold text-slate-600">อัตโนมัติ (หลังคาบ 4)</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                   <h4 className="font-bold mb-4 flex items-center gap-2">
                      <AlertCircle className="text-amber-500" size={18} />
                      เงื่อนไขการตรวจสอบ
                   </h4>
                   <ul className="space-y-3 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" /> 
                        ครูหนึ่งคนสอนได้ไม่เกิน 1 ห้องในเวลาเดียวกัน
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" /> 
                        ห้องเรียนหนึ่งห้องรับได้ทีละ 1 วิชา
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" /> 
                        เฉลี่ยคาบเรียนวิชาหนักให้ไม่ติดกันเกิน 2 คาบ
                      </li>
                   </ul>
                </div>
                <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between">
                   <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xl mb-1">พร้อมประมวลผล?</h4>
                        <p className="text-indigo-100 text-xs">ระบบ AI จะช่วยคำนวณและเสนอแนะตารางที่ดีที่สุด</p>
                      </div>
                      <Sparkles className="text-indigo-300" />
                   </div>
                   <button 
                    onClick={() => setStep(2)}
                    className="mt-8 w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                   >
                     เริ่มประมวลผลข้อมูล
                     <ChevronRight size={18} />
                   </button>
                </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 space-y-8">
             <div className="relative">
                <div className="w-32 h-32 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-indigo-600 animate-pulse" size={40} />
                </div>
             </div>
             <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900 mb-2">SmartSchedule AI กำลังประมวลผล</h3>
                <p className="text-slate-400 text-sm">กำลังคำนวณคาบเรียน ตรวจสอบครูว่าง และจัดสรรห้องปฏิบัติการ...</p>
             </div>
             {!generating && (
                <button onClick={handleGenerate} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">
                    จำลองการประมวลผลเสร็จสิ้น
                </button>
             )}
          </motion.div>
        )}

        {step === 3 && scheduleResult && (
          <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm px-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-black uppercase text-slate-400 tracking-tight">ประมวลผลสำเร็จ</div>
                        <div className="font-bold text-slate-900">พบตารางสอนที่ไม่มีการซ้อนทับ 100%</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200">
                        <Save size={20} />
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                        <Download size={18} />
                        ส่งออกตาราง (PDF)
                    </button>
                </div>
             </div>

             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users size={18} className="text-indigo-600" />
                        <h4 className="font-bold">ตารางเรียนชั้นมัธยมศึกษาปีที่ 1/1</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-500 tracking-tight uppercase">ห้องประจำ 101</span>
                    </div>
                </div>
                <div className="overflow-x-auto p-4">
                   <table className="w-full min-w-[1000px] border-separate border-spacing-2">
                       <thead>
                            <tr>
                                <th className="w-24 p-2"></th>
                                {[1,2,3,4,5,6,7,8].map(p => (
                                    <th key={p} className="p-4 bg-slate-100/50 rounded-2xl">
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">คาบ {p}</div>
                                        <div className="text-xs font-bold text-slate-600 tracking-tight">
                                            {p+7}:30 - {p+8}:20
                                        </div>
                                    </th>
                                ))}
                            </tr>
                       </thead>
                       <tbody>
                           {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'].map((day, dIdx) => (
                               <tr key={day}>
                                   <td className="p-4 bg-slate-900 text-white rounded-2xl text-center font-black text-sm">
                                       {day}
                                   </td>
                                   {[1,2,3,4,5,6,7,8].map(p => (
                                       <td key={p} className="relative group">
                                           {Math.random() > 0.4 ? (
                                                <div className={`p-4 rounded-3xl border ${dIdx % 2 === 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'} h-full min-h-[100px] flex flex-col justify-between transition-all group-hover:scale-105 group-hover:shadow-xl cursor-pointer group-hover:z-10`}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="text-xs font-black text-slate-900">{dIdx % 2 === 0 ? 'คณิตศาสตร์' : 'ภาษาอังกฤษ'}</div>
                                                        <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest bg-white border border-slate-100 rounded px-1">ค11101</div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-4">
                                                        <div className="w-6 h-6 bg-white rounded-full border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">ส</div>
                                                        <span className="text-[10px] font-bold text-slate-500 truncate">อ.สมชาย</span>
                                                    </div>
                                                </div>
                                           ) : (
                                                <div className="p-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/30 h-full min-h-[100px] flex items-center justify-center opacity-40">
                                                    <Plus size={14} className="text-slate-300" />
                                                </div>
                                           )}
                                       </td>
                                   ))}
                               </tr>
                           ))}
                       </tbody>
                   </table>
                </div>
             </div>

             <div className="flex items-center justify-center pt-8">
                 <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                 >
                    <ChevronLeft size={18} />
                    กลับไปแก้ไขการตั้งค่า
                 </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
