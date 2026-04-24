import { useState, useEffect, useRef } from 'react';
import { Sparkles, Printer, ChevronLeft, Loader2, Wand2, Type, CheckSquare, Layers, FileText, Settings, Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { User, ExerciseType } from '../types';
import { GoogleGenAI, Type as GeminiType } from "@google/genai";

const EXERCISE_TYPES = [
  { id: 'multiple_choice', label: 'แบบปรนัย (ตัวเลือก)', icon: <CheckSquare size={18} /> },
  { id: 'subjective', label: 'แบบอัตนัย (เติมคำ)', icon: <Type size={18} /> },
  { id: 'matching', label: 'แบบจับคู่', icon: <Layers size={18} /> },
  { id: 'essay', label: 'แบบเขียนเรียงความ', icon: <FileText size={18} /> },
  { id: 'math_steps', label: 'โจทย์คณิตศาสตร์ (แสดงวิธีทำ)', icon: <Layers size={18} /> },
  { id: 'image_sentence', label: 'แบบแต่งประโยคจากภาพ', icon: <Sparkles size={18} /> },
];

interface FontSettings {
  title: number;
  indicators: number;
  description: number;
  question: number;
  option: number;
}

function ExerciseRender({ 
  result, 
  exerciseType, 
  sectionIdx, 
  fonts, 
  startIdx = 1,
  editable = false,
  onUpdateItem,
  onAddItem,
  onAddAiItems,
  onRemoveItem,
  onUpdateHeader
}: { 
  result: any, 
  exerciseType: string, 
  sectionIdx?: number, 
  fonts?: any, 
  startIdx?: number,
  editable?: boolean,
  onUpdateItem?: (idx: number, field: string, value: any) => void,
  onAddItem?: () => void,
  onAddAiItems?: (topic: string, count: number) => void,
  onRemoveItem?: (idx: number) => void,
  onUpdateHeader?: (field: string, value: string) => void
}) {
  const f = fonts || { title: 18, indicators: 12, description: 14, question: 16, option: 16 };
  
  return (
    <div className={`mb-12 last:mb-0 relative group/section ${editable ? 'p-6 border-2 border-transparent hover:border-slate-100 rounded-3xl transition-all' : ''}`}>
      <div className="text-center border-b border-black pb-4 mb-6">
        {editable ? (
          <div className="space-y-2">
            <input 
              className="w-full text-center font-bold bg-transparent border-none outline-none focus:bg-white focus:ring-1 focus:ring-indigo-200 rounded px-2"
              style={{ fontSize: `${f.title}pt` }}
              value={result.title}
              onChange={(e) => onUpdateHeader?.('title', e.target.value)}
              placeholder="หัวข้อตอนที่..."
            />
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ตัวชี้วัด:</span>
              <input 
                className="flex-1 max-w-md text-center text-slate-600 font-bold italic bg-transparent border-none outline-none focus:bg-white focus:ring-1 focus:ring-indigo-200 rounded px-2"
                style={{ fontSize: `${f.indicators}pt` }}
                value={result.indicators || ''}
                onChange={(e) => onUpdateHeader?.('indicators', e.target.value)}
                placeholder="มาตรฐาน/ตัวชี้วัด..."
              />
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-bold" style={{ fontSize: `${f.title}pt` }}>
              {sectionIdx !== undefined && <span>ตอนที่ {sectionIdx}: </span>}
              {result.title}
            </h3>
            {result.indicators && (
              <div className="mt-1 text-slate-500 font-bold uppercase tracking-tight italic" style={{ fontSize: `${f.indicators}pt` }}>
                มาตรฐาน/ตัวชี้วัด: {result.indicators}
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="mb-6 bg-slate-50 p-4 border-l-4 border-black relative">
        {editable ? (
          <textarea 
            className="w-full font-bold leading-relaxed bg-transparent border-none outline-none focus:bg-white focus:ring-1 focus:ring-indigo-200 rounded px-2 resize-none"
            style={{ fontSize: `${f.description}pt` }}
            value={result.description}
            onChange={(e) => onUpdateHeader?.('description', e.target.value)}
            placeholder="คำชี้แจง..."
            rows={1}
            onInput={(e: any) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        ) : (
          <p className="font-bold leading-relaxed" style={{ fontSize: `${f.description}pt` }}>{result.description}</p>
        )}
      </div>

      <div className="space-y-8">
        {result.items.map((item: any, idx: number) => (
          <div key={idx} className={`space-y-4 relative group/item break-inside-avoid ${editable ? 'p-4 border border-transparent hover:border-slate-100 rounded-xl hover:bg-slate-50/50 transition-all' : ''}`}>
            {editable && (
              <div className="absolute -left-12 top-4 flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity no-print">
                <button 
                  onClick={() => onRemoveItem?.(idx)}
                  className="p-1.5 bg-white text-red-500 rounded-lg border border-red-100 hover:bg-red-500 hover:text-white shadow-sm transition-all"
                  title="ลบข้อนี้"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
            
            <div className="font-bold leading-relaxed flex gap-3" style={{ fontSize: `${f.question}pt` }}>
              <span className="shrink-0">{startIdx + idx}.</span>
              <div className="flex-1">
                {editable ? (
                  <div className="space-y-4">
                    <textarea 
                      className="w-full bg-transparent border-none outline-none focus:bg-white focus:ring-1 focus:ring-indigo-200 rounded px-2 resize-none"
                      value={item.question}
                      onChange={(e) => onUpdateItem?.(idx, 'question', e.target.value)}
                      placeholder="โจทย์คำถาม..."
                      rows={1}
                      onInput={(e: any) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = (e.target as any).scrollHeight + 'px';
                      }}
                    />
                    {exerciseType === 'matching' && (
                      <div className="flex flex-wrap gap-4 pt-2 no-print">
                        <div className="flex-1 min-w-[200px] border-l-4 border-indigo-500 pl-4 bg-indigo-50/50 py-2 rounded-r-xl shadow-sm">
                          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">คำตอบที่ถูกต้อง (ฝั่งขวา)</label>
                          <input 
                            className="w-full bg-white border border-indigo-100 outline-none focus:ring-2 focus:ring-indigo-200 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700"
                            value={item.answer}
                            onChange={(e) => onUpdateItem?.(idx, 'answer', e.target.value)}
                            placeholder="ความหมาย หรือคำแปล..."
                          />
                        </div>
                        <div className="w-[200px] border-l-4 border-amber-500 pl-4 bg-amber-50/50 py-2 rounded-r-xl shadow-sm">
                          <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">คำค้นหาภาพ (Image Keyword)</label>
                          <input 
                            className="w-full bg-white border border-amber-100 outline-none focus:ring-2 focus:ring-amber-200 rounded-lg px-3 py-2 text-xs font-medium"
                            value={item.imageKeyword || ''}
                            onChange={(e) => onUpdateItem?.(idx, 'imageKeyword', e.target.value)}
                            placeholder="เช่น cat, dog, apple..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  exerciseType === 'matching' ? (
                    <div className="flex justify-between items-center gap-12 w-full border-b border-black pb-4 hover:bg-slate-50 transition-colors rounded-lg group/match">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <span className="not-italic opacity-30 shrink-0 font-normal">( &nbsp;&nbsp;&nbsp; )</span>
                        <div className="flex items-center gap-4 flex-1">
                          {item.imageKeyword && (
                            <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover/match:scale-110 transition-transform">
                              <img 
                                src={`https://loremflickr.com/150/150/${encodeURIComponent(item.imageKeyword)}?lock=${idx}`} 
                                alt={item.imageKeyword}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div className="font-bold leading-relaxed truncate">{item.question}</div>
                        </div>
                      </div>
                      
                      <div className="w-[80px] h-[2px] bg-slate-100 relative after:content-[''] after:absolute after:right-0 after:-top-1 after:w-2 after:h-2 after:bg-slate-300 after:rounded-full before:content-[''] before:absolute before:left-0 before:-top-1 before:w-2 before:h-2 before:bg-slate-300 before:rounded-full"></div>

                      <div className="w-[40%] flex items-start gap-4 pl-8 border-l-[2px] border-slate-200 text-left">
                        <span className="font-black text-indigo-600 shrink-0">{String.fromCharCode(3585 + idx)}.</span>
                        <div className="leading-tight font-medium">{item.answer}</div>
                      </div>
                    </div>
                  ) : (
                    <span>{item.question}</span>
                  )
                )}
              </div>
            </div>
            
            {exerciseType === 'multiple_choice' && item.options && (
              <div className="grid grid-cols-2 gap-x-12 gap-y-3 pl-8">
                {item.options.map((opt: string, oIdx: number) => (
                  <div key={oIdx} className="flex items-center gap-3 italic" style={{ fontSize: `${f.option}pt` }}>
                    <div className="rounded-full border border-black flex items-center justify-center font-bold shrink-0" style={{ width: `${f.option * 1.8}px`, height: `${f.option * 1.8}px`, fontSize: `${f.option * 0.75}pt` }}>
                      {String.fromCharCode(65 + oIdx)}
                    </div>
                    {editable ? (
                      <input 
                        className="flex-1 bg-transparent border-none outline-none focus:bg-white focus:ring-1 focus:ring-indigo-200 rounded px-2"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...item.options];
                          newOpts[oIdx] = e.target.value;
                          onUpdateItem?.(idx, 'options', newOpts);
                        }}
                        placeholder={`ตัวเลือก ${String.fromCharCode(65 + oIdx)}...`}
                      />
                    ) : (
                      <span>{opt}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {exerciseType === 'math_steps' && (
              <div className="pl-8 space-y-5">
                <p className="text-slate-500 font-bold" style={{ fontSize: `${f.description}pt` }}>วิธีทำ:</p>
                <div className="space-y-4">
                  <div className="border-b border-dotted border-slate-400 h-8 w-full"></div>
                  <div className="border-b border-dotted border-slate-400 h-8 w-full"></div>
                  <div className="border-b border-dotted border-slate-400 h-8 w-full"></div>
                  <div className="border-b border-dotted border-slate-400 h-8 w-full"></div>
                  <div className="flex items-end gap-3 pt-2">
                    <span className="font-black shrink-0" style={{ fontSize: `${f.description}pt` }}>ตอบ:</span>
                    <div className="border-b border-dotted border-slate-400 h-8 flex-1"></div>
                  </div>
                </div>
              </div>
            )}

            {(exerciseType === 'subjective' || exerciseType === 'essay' || exerciseType === 'image_sentence') && (
              <div className="pl-8 space-y-3">
                <div className="border-b border-dotted border-slate-400 h-8"></div>
                {exerciseType === 'essay' && (
                  <>
                    <div className="border-b border-dotted border-slate-400 h-8"></div>
                    <div className="border-b border-dotted border-slate-400 h-8"></div>
                    <div className="border-b border-dotted border-slate-400 h-8"></div>
                    <div className="border-b border-dotted border-slate-400 h-8"></div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {editable && (
          <div className="pt-8 flex justify-center no-print border-t border-slate-100 mt-8">
            <button 
              onClick={onAddItem}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase hover:bg-slate-200 transition-all border border-slate-200"
            >
              <Plus size={16} />
              เพิ่มข้อสอบแบบพิมพ์เอง (+1 ข้อ)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const GRADES = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3'];

const CORE_SUBJECTS = [
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และเทคโนโลยี',
  'สังคมศึกษา ศาสนา และวัฒนธรรม',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะ',
  'การงานอาชีพ',
  'ภาษาต่างประเทศ (ภาษาอังกฤษ)'
];

export default function Generator({ user, onNavigate, exerciseId }: { user: User, onNavigate: (page: string, param?: string) => void, exerciseId?: string | null }) {
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    grade: 'ป.1',
    type: 'multiple_choice' as ExerciseType,
    count: 5,
    topic: '',
    useVisuals: false
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [combinedResults, setCombinedResults] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [existingFontSettings, setExistingFontSettings] = useState<any>(null);

  // New states for Appender
  const [appenderTopic, setAppenderTopic] = useState('');
  const [appenderCount, setAppenderCount] = useState(5);
  const [isAppenderGenerating, setIsAppenderGenerating] = useState(false);

  useEffect(() => {
    if (exerciseId) {
      setResult(null);
      setCombinedResults([]);
      setIsEditing(false);
      const apiBase = '/server.cjs';
      fetch(`${apiBase}/api/exercises/${exerciseId}`)
        .then(res => res.json())
        .then(found => {
          if (found) {
            const content = JSON.parse(found.content);
            if (content.fontSettings) {
              setExistingFontSettings(content.fontSettings);
            }
            if (Array.isArray(content.sections)) {
              setCombinedResults(content.sections.map((s: any) => ({ ...s, indicators: s.indicators || found.indicators })));
            } else {
              setResult({ ...content, indicators: content.indicators || found.indicators });
            }
            setFormData({
              ...formData,
              title: found.title,
              course: found.course,
              grade: found.grade
            });
            setIsEditing(true);
          }
        });
    }
  }, [exerciseId]);

  const handleGenerate = async () => {
    if (!user.ai_key) {
      alert('กรุณาตั้งค่า API Key ในแดชบอร์ดก่อนใช้งาน');
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: user.ai_key });
      const systemInstruction = `You are a professional educational content creator for Thai ministry of education. Generate exercises in Thai based on the Thai Core Curriculum Standards.`;

      const prompt = `สร้างแบบฝึกหัดเรื่อง: "${formData.topic}" สำหรับวิชา: ${formData.course} ระดับชั้น: ${formData.grade} รูปแบบ: ${formData.type} จำนวน: ${formData.count} ข้อ 
      สำคัญ: 
      1. ให้ระบุ มาตรฐานและตัวชี้วัดแบบย่อ ในฟิลด์ indicators (ตัวย่างเช่น "มาตรฐาน ค 1.1 ป.4/1, ป.4/2")
      2. ในส่วนของ explanation สำหรับครู ให้เขียนคำอธิบายเหตุผลของคำตอบที่ชัดเจนและเข้าใจง่าย
      ${formData.type === 'matching' ? '3. สำหรับรูปแบบจับคู่ (matching): ฟิลด์ "question" คือข้อความฝั่งซ้าย และฟิลด์ "answer" คือข้อความที่ถูกต้องฝั่งขวา' : ''}
      ${formData.useVisuals ? '4. (สำคัญ) สำหรับรูปภาพ: ให้ระบุ keyword ภาษาอังกฤษสั้นๆ (1-2 คำ) ในฟิลด์ "imageKeyword" เพื่อใช้แสดงรูปภาพประกอบในข้อนั้นๆ เช่น "bird", "apple", "bicycle"' : ''}
      ให้ตอบกลับเป็น JSON ภาษาไทย`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: GeminiType.OBJECT,
            properties: {
              title: { type: GeminiType.STRING },
              description: { type: GeminiType.STRING },
              indicators: { type: GeminiType.STRING, description: "ตัวอย่าง: มาตรฐาน ค 1.1 ป.4/1 อ่านและเขียนจำนวนนับได้" },
              items: {
                type: GeminiType.ARRAY,
                items: {
                  type: GeminiType.OBJECT,
                  properties: {
                    question: { type: GeminiType.STRING },
                    options: { type: GeminiType.ARRAY, items: { type: GeminiType.STRING } },
                    answer: { type: GeminiType.STRING },
                    explanation: { type: GeminiType.STRING },
                    imageKeyword: { type: GeminiType.STRING, description: "Keyword for image search (e.g., 'lion', 'car')" }
                  },
                  required: ["question", "answer", "explanation"]
                }
              }
            },
            required: ["title", "description", "items", "indicators"]
          }
        },
      });

      setResult(JSON.parse(response.text));
    } catch (error: any) {
      if (error.message?.includes('503') || error.message?.includes('high demand')) {
        alert('ขณะนี้ AI มีผู้ใช้งานเป็นจำนวนมากครับ กรุณารอประมาณ 5-10 วินาทีแล้วกดปุ่ม "สร้างเพิ่ม" หรือ "สร้างแบบฝึกใหม่" อีกครั้งนะครับ');
      } else {
        alert('เกิดข้อผิดพลาด: ' + error.message);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (combinedResults.length === 0 && !result) {
      alert('คุณยังไม่ได้สร้างแบบฝึกหัด กรุณากดปุ่ม "สร้างด้วย AI" ก่อนครับ');
      return;
    }

    const finalContent: any = combinedResults.length > 0 
      ? { sections: combinedResults } 
      : { ...result };
    
    // รักษาค่า FontSettings เดิมไว้ (ถ้ามี)
    if (existingFontSettings) {
      finalContent.fontSettings = existingFontSettings;
    }
    
    setSaving(true);
    try {
      const apiBase = '/server.cjs';
      const isUpdating = isEditing && exerciseId;
      const url = isUpdating ? `${apiBase}/api/exercises/${exerciseId}/update` : `${apiBase}/api/exercises`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || result?.title || combinedResults[0]?.title || 'แบบฝึกหัดใหม่',
          course: formData.course,
          grade: formData.grade,
          indicators: result?.indicators || combinedResults[0]?.indicators || 'อ้างอิงหลักสูตรแกนกลางอัตโนมัติ',
          content: finalContent
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert(isEditing ? 'อัปเดตสำเร็จ' : 'บันทึกสำเร็จ');
        const idToPrint = (isEditing && exerciseId) ? exerciseId : data.id;
        onNavigate('print', String(idToPrint));
      } else {
        const err = await res.text();
        console.error('Save failed:', err);
        alert('บันทรึกไม่สำเร็จ: ' + err);
      }
    } catch (err: any) {
      console.error('Save error:', err);
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = () => {
    if (result) {
      setCombinedResults([...combinedResults, { ...result, type: formData.type }]);
      setResult(null);
      setFormData({ ...formData, topic: '' }); // ล้างหัวข้อเพื่อเตรียมสร้างส่วนถัดไป
    }
  };

  const handleClear = () => {
    setCombinedResults([]);
    setResult(null);
  };

  const updateItem = (sectionIdx: number | null, itemIdx: number, field: string, value: any) => {
    if (sectionIdx === null) {
      if (!result) return;
      const newItems = [...result.items];
      newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
      setResult({ ...result, items: newItems });
    } else {
      const newSections = [...combinedResults];
      const newItems = [...newSections[sectionIdx].items];
      newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
      newSections[sectionIdx] = { ...newSections[sectionIdx], items: newItems };
      setCombinedResults(newSections);
    }
  };

  const addItemToSection = (sectionIdx: number | null) => {
    const defaultOptions = formData.type === 'multiple_choice' ? ['ตัวเลือก ก', 'ตัวเลือก ข', 'ตัวเลือก ค', 'ตัวเลือก ง'] : undefined;
    const newItem = { question: 'ตั้งโจทย์ใหม่...', options: defaultOptions, answer: '', explanation: 'คำอธิบาย...' };
    
    if (sectionIdx === null) {
      if (!result) return;
      setResult({ ...result, items: [...result.items, newItem] });
    } else {
      const newSections = [...combinedResults];
      newSections[sectionIdx] = { ...newSections[sectionIdx], items: [...newSections[sectionIdx].items, newItem] };
      setCombinedResults(newSections);
    }
  };

  const removeItemFromSection = (sectionIdx: number | null, itemIdx: number) => {
    if (!confirm('ยืนยันการลบข้อสอบนี้?')) return;
    
    if (sectionIdx === null) {
      if (!result) return;
      const newItems = result.items.filter((_: any, i: number) => i !== itemIdx);
      setResult({ ...result, items: newItems });
    } else {
      const newSections = [...combinedResults];
      const newItems = newSections[sectionIdx].items.filter((_: any, i: number) => i !== itemIdx);
      newSections[sectionIdx] = { ...newSections[sectionIdx], items: newItems };
      setCombinedResults(newSections);
    }
  };

  const updateHeader = (sectionIdx: number | null, field: string, value: string) => {
    if (sectionIdx === null) {
      if (!result) return;
      setResult({ ...result, [field]: value });
    } else {
      const newSections = [...combinedResults];
      newSections[sectionIdx] = { ...newSections[sectionIdx], [field]: value };
      setCombinedResults(newSections);
    }
  };

  const handleAppenderSubmit = async () => {
    if (!appenderTopic) return alert('กรุณาระบุหัวข้อที่ต้องการเพิ่มครับ');
    setIsAppenderGenerating(true);
    try {
      // Determine which section to append to: 
      // Prefer appending to `result` if it exists, otherwise last section of `combinedResults`
      const targetSectionIdx = result ? null : (combinedResults.length > 0 ? combinedResults.length - 1 : null);
      await handleAddAiItemsToSection(targetSectionIdx, appenderTopic, appenderCount);
      setAppenderTopic('');
      alert('สร้างโจทย์เพิ่มสำเร็จแล้วครับ!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsAppenderGenerating(false);
    }
  };

  const handleAddAiItemsToSection = async (sectionIdx: number | null, topic: string, count: number) => {
    if (!user.ai_key) throw new Error('API Key Missing');

    const ai = new GoogleGenAI({ apiKey: user.ai_key });
    const systemInstruction = `You are a professional educational content creator for Thai ministry of education.`;
    
    const currentType = sectionIdx === null ? formData.type : (combinedResults[sectionIdx].type || formData.type);
    const currentGrade = formData.grade;

    const prompt = `สร้างคำถามเพิ่มจำนวน ${count} ข้อ ในหัวข้อ: "${topic}" สำหรับระดับชั้น ${currentGrade} โดยเป็นข้อสอบรูปแบบ: ${currentType}. 
    เฉลยคำตอบในฟิลด์ answer และให้คำอธิบายใน explanation. 
    ${formData.useVisuals ? 'สำคัญ: ให้ระบุ keyword ภาษาอังกฤษสั้นๆ (1-2 คำ) ในฟิลด์ "imageKeyword" สำหรับแสดงรูปภาพประกอบด้วย' : ''}
    ตอบเป็น JSON array ของ items เท่านั้น [{ "question": "...", "options": ["..."], "answer": "...", "explanation": "..." ${formData.useVisuals ? ', "imageKeyword": "..."' : ''} }]`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: GeminiType.ARRAY,
            items: {
              type: GeminiType.OBJECT,
              properties: {
                question: { type: GeminiType.STRING },
                options: { type: GeminiType.ARRAY, items: { type: GeminiType.STRING } },
                answer: { type: GeminiType.STRING },
                explanation: { type: GeminiType.STRING },
                imageKeyword: { type: GeminiType.STRING }
              },
              required: ["question", "answer", "explanation"]
            }
          }
        },
      });

      const newItems = JSON.parse(response.text);
      
      if (sectionIdx === null) {
        if (!result) return;
        setResult({ ...result, items: [...result.items, ...newItems] });
      } else {
        const newSections = [...combinedResults];
        newSections[sectionIdx] = { ...newSections[sectionIdx], items: [...newSections[sectionIdx].items, ...newItems] };
        setCombinedResults(newSections);
      }
    } catch (error: any) {
      if (error.message?.includes('503') || error.message?.includes('high demand')) {
        throw new Error('ขณะนี้ AI มีผู้ใช้งานเป็นจำนวนมากครับ กรุณารอประมาณ 5-10 วินาทีแล้วกดปุ่ม "สร้างเพิ่ม" อีกครั้งนะครับ');
      }
      throw error;
    }
  };

  const printArea = () => {
    const f = existingFontSettings || { title: 18, indicators: 12, description: 14, question: 16, option: 16 };
    
    return (
      <div id="printable-area" className="print-doc-container bg-white text-black font-sarabun mx-auto relative shadow-2xl overflow-hidden">
        <table className="w-full border-collapse print-table">
          <thead className="table-header-group">
            <tr>
              <td className="p-0 border-none">
                <div className="repeating-header-box h-[25mm] w-full bg-white flex flex-col justify-end px-12 pb-4">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2">
                    <div className="text-[14px] font-extrabold uppercase text-left">
                      แบบฝึกหัด: {formData.title || result?.title || combinedResults[0]?.title || 'ไม่มีหัวข้อ'}
                    </div>
                    <div className="text-[12px] font-bold page-counter-indicator"></div>
                  </div>
                </div>
              </td>
            </tr>
          </thead>
          
          <tbody className="table-row-group">
            <tr>
              <td className="p-0 border-none">
                <div className="printable-content px-12 pt-6 pb-12 flex flex-col min-h-[200mm]">
                  <div className="border-b-2 border-black pb-4 mb-8 text-[13px] font-bold flex items-center gap-6 bg-white first-page-header-box">
                    <div className="flex items-center gap-2 flex-[2]">
                      <span className="shrink-0">ชื่อ-นามสกุล:</span>
                      <div className="border-b border-dotted border-black flex-1 h-4 min-w-[150px]"></div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 max-w-[100px]">
                      <span className="shrink-0">เลขที่:</span>
                      <div className="border-b border-dotted border-black flex-1 h-4"></div>
                    </div>
                    <div className="flex items-center gap-2 flex-1 max-w-[130px]">
                      <span className="shrink-0">ชั้น:</span>
                      <div className="border-b border-dotted border-black flex-1 h-4"></div>
                      <span className="shrink-0">/</span>
                      <div className="border-b border-dotted border-black flex-1 h-4"></div>
                    </div>
                  </div>

                  <div className="printable-body leading-normal flex-1">
                    {(result || combinedResults.length > 0) && (
                      <div className="mb-8 border-b border-black pb-4 text-center first-page-topic">
                        <h1 className="font-black mb-1 uppercase tracking-tighter" style={{ fontSize: `${f.title}pt` }}>{formData.title || result?.title || combinedResults[0]?.title}</h1>
                        {(result?.indicators || combinedResults[0]?.indicators) && (
                          <p className="text-slate-500 font-bold italic mb-4" style={{ fontSize: `${f.indicators}pt` }}>
                            มาตรฐาน/ตัวชี้วัด: {result?.indicators || combinedResults[0]?.indicators}
                          </p>
                        )}
                        <div className="bg-slate-50 p-4 border-l-4 border-black italic text-left leading-relaxed shadow-sm" style={{ fontSize: `${f.description}pt` }}>
                          <span className="font-bold not-italic mr-2">คำชี้แจง:</span>
                          {result?.description || combinedResults[0]?.description || 'ให้นักเรียนเลือกคำตอบที่ถูกต้องที่สุด'}
                        </div>
                      </div>
                    )}

                    <div className="printable-questions-container">
                      {combinedResults.length > 0 ? (
                        combinedResults.map((res, rIdx) => {
                          const prevItemsCount = combinedResults.slice(0, rIdx).reduce((acc, curr) => acc + curr.items.length, 0);
                          const startIdx = prevItemsCount + 1;
                          return (
                            <div key={rIdx} className="mb-12 last:mb-0 text-left">
                              <h3 className="font-bold text-center border-b border-black pb-2 mb-6" style={{ fontSize: `${f.title}pt` }}>ตอนที่ {rIdx + 1}: {res.title}</h3>
                              <ExerciseRender 
                                result={res} 
                                exerciseType={res.type || formData.type} 
                                sectionIdx={rIdx + 1} 
                                startIdx={startIdx} 
                                editable={true}
                                onUpdateItem={(iIdx, f, v) => updateItem(rIdx, iIdx, f, v)}
                                onAddItem={() => addItemToSection(rIdx)}
                                onAddAiItems={(t, c) => handleAddAiItemsToSection(rIdx, t, c)}
                                onRemoveItem={(iIdx) => removeItemFromSection(rIdx, iIdx)}
                                onUpdateHeader={(f, v) => updateHeader(rIdx, f, v)}
                              />
                            </div>
                          );
                        })
                      ) : result ? (
                        <div className="text-left">
                          <ExerciseRender 
                            result={result} 
                            exerciseType={formData.topic ? formData.type : 'multiple_choice'} 
                            editable={true}
                            onUpdateItem={(iIdx, f, v) => updateItem(null, iIdx, f, v)}
                            onAddItem={() => addItemToSection(null)}
                            onAddAiItems={(t, c) => handleAddAiItemsToSection(null, t, c)}
                            onRemoveItem={(iIdx) => removeItemFromSection(null, iIdx)}
                            onUpdateHeader={(f, v) => updateHeader(null, f, v)}
                          />
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-300 font-bold uppercase tracking-widest text-sm no-print items-center">
                          ยังไม่มีเนื้อหาแบบฝึกหัด
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>

          <tfoot className="table-footer-group">
            <tr>
              <td className="p-0 border-none">
                <div className="repeating-footer-box h-[20mm] w-full bg-white flex flex-col justify-center px-12">
                  <div className="border-t border-black pt-3 flex justify-between items-center text-[11px] font-bold">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 uppercase text-left">
                      <span>วิชา: {formData.course}</span>
                      <span>ผู้สอน: {user.name} {user.surname}</span>
                      <span>{user.position || user.school || 'ครูผู้สอน'}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 italic font-normal shrink-0 ml-4">Generated by EduGen AI System</span>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>

        <style>{`
          @media screen {
            .print-doc-container {
              width: 210mm;
              margin: 0 auto;
              background-color: white;
              position: relative;
              transform: scale(0.65);
              transform-origin: top center;
              margin-bottom: -25%;
              background-image: linear-gradient(to bottom, transparent 296mm, #ddd 296mm, #ddd 297mm, transparent 297mm);
              background-size: 100% 297mm;
            }
            .repeating-header-box, .repeating-footer-box {
              background-color: #fbfbfb !important;
              border-left: 4px solid #6366f1;
            }
            .no-screen { display: none !important; }
          }

          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body { 
              background: white !important; 
              counter-reset: page;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #root, main, .main-layout-class {
               overflow: visible !important;
               display: block !important;
               position: static !important;
               height: auto !important;
            }
            .print-doc-container {
              width: 210mm !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
              box-shadow: none !important;
              display: block !important;
              position: static !important;
              background-image: none !important;
              transform: none !important;
            }
            .no-print { display: none !important; }
            .no-screen { display: flex !important; }
            .print-table {
              width: 100%;
              border-spacing: 0;
              border-collapse: collapse;
              table-layout: fixed;
            }
            .table-header-group { display: table-header-group !important; }
            .table-footer-group { display: table-footer-group !important; }
            .page-counter-indicator::after { content: "หน้า " counter(page); }
            .break-inside-avoid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            thead td, tfoot td { background-color: white !important; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('home')} className="p-2 hover:bg-white rounded-lg border border-slate-200 transition-all text-slate-500 shadow-sm"><ChevronLeft size={20} /></button>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-0.5">Workspace</span>
            <h1 className="text-2xl font-bold text-slate-900">{isEditing ? 'แก้ไขแบบฝึกหัด' : 'สร้างแบบฝึกหัดด้วย AI'}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 h-[calc(100vh-160px)]">
        {/* Left Sidebar: AI Settings Card */}
        <div className="col-span-12 lg:col-span-4 h-full overflow-y-auto no-print custom-scrollbar pr-2">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 flex items-center justify-center rounded-xl text-indigo-600">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">AI Settings</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">หัวข้อเรื่อง</label>
                <textarea 
                  value={formData.topic} 
                  onChange={(e) => setFormData({...formData, topic: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm h-32 resize-none focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" 
                  placeholder="เช่น การบวกเลขไม่เกิน 100" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">วิชา / ระดับชั้น</label>
                  <input 
                    list="subjects" 
                    value={formData.course} 
                    onChange={(e) => setFormData({...formData, course: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" 
                    placeholder="วิชา" 
                  />
                  <datalist id="subjects">{CORE_SUBJECTS.map(s => <option key={s} value={s} />)}</datalist>
                </div>
                <div className="space-y-2 pt-6">
                  <select 
                    value={formData.grade} 
                    onChange={(e) => setFormData({...formData, grade: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none"
                  >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">ความยาก</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none">
                  <option>ง่าย</option>
                  <option selected>ปานกลาง</option>
                  <option>ยาก</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 ml-1 block">ประเภทโจทย์ (เลือกหลายรายการได้)</label>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 h-48 overflow-y-auto custom-scrollbar space-y-2">
                  {EXERCISE_TYPES.map(t => (
                    <label key={t.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.type === t.id}
                        onChange={() => setFormData({...formData, type: t.id as ExerciseType})}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-sm text-slate-700">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.type === 'matching' && formData.grade.startsWith('ป') && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.useVisuals}
                      onChange={(e) => setFormData({...formData, useVisuals: e.target.checked})}
                      className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500" 
                    />
                    <div>
                      <span className="text-sm font-black text-amber-900 block tracking-tight">เพิ่มรูปภาพประกอบ</span>
                      <span className="text-[11px] text-amber-700">เหมาะสำหรับเด็กประถม (AI จะช่วยหารูปที่เหมาะสมมาเพิ่มให้)</span>
                    </div>
                  </label>
                </div>
              )}
              
              <button 
                onClick={handleGenerate} 
                disabled={generating} 
                className={`w-full text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all active:scale-95 ${combinedResults.length > 0 ? 'bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {generating ? <Loader2 className="animate-spin" size={22} /> : <Sparkles size={22} />}
                <span className="text-lg">สร้างแบบฝึกใหม่ด้วย AI</span>
              </button>

              {/* AI Appender - Replaced with a simpler button / interaction if needed, keeping it as is but styled */}
              {(result || combinedResults.length > 0) && (
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                    ปรับจูนโจทย์เพิ่มเติม
                  </h4>
                  <input 
                    className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="สั่งเพิ่มโจทย์..."
                    value={appenderTopic}
                    onChange={(e) => setAppenderTopic(e.target.value)}
                  />
                  <button 
                    onClick={handleAppenderSubmit}
                    disabled={isAppenderGenerating}
                    className="w-full py-3 bg-white text-indigo-600 rounded-xl text-xs font-bold uppercase hover:bg-indigo-600 hover:text-white border border-indigo-200 transition-all"
                  >
                    {isAppenderGenerating ? 'กำลังสร้าง...' : 'สร้างเพิ่ม'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Main Content: Document Preview Card */}
        <div className="col-span-12 lg:col-span-8 h-full">
          <div className="bg-white rounded-[32px] border border-slate-200 h-full flex flex-col overflow-hidden shadow-sm relative">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white absolute top-0 left-0 right-0 z-10 no-print">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Document View</span>
              { (result || combinedResults.length > 0) && (
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-indigo-700 transition-all shadow-md">
                    {saving ? 'กำลังบันทึก...' : 'บันทึก & สั่งพิมพ์'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 pt-24 bg-slate-50 flex flex-col items-center custom-scrollbar">
              {(result || combinedResults.length > 0) ? (
                <div className="flex flex-col gap-4 print-root-container">
                  <div className="flex justify-center gap-2 mb-8 no-print shrink-0">
                    <button onClick={handleAddSection} className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase border border-indigo-100 hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm">
                      <Plus size={14} /> เพิ่มส่วนใหม่
                    </button>
                    <button onClick={handleClear} className="bg-white text-red-500 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase border border-red-100 hover:bg-red-50 transition-all shadow-sm">ล้างหน้าเอกสาร</button>
                  </div>
                  {printArea()}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                   <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                      <FileText size={40} className="text-slate-200" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-300 tracking-tight mb-2">ยังไม่มีแบบฝึกหัด</h3>
                   <p className="text-sm text-slate-400 max-w-xs">กรุณาใช้ AI Generate ด้านซ้ายมือเพื่อเริ่มสร้างเนื้อหาแบบฝึกหัดของคุณครูครับ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
