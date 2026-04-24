import { useState, useEffect } from 'react';
import { Printer, ChevronLeft, Settings, Save, Loader2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Exercise, User } from '../types';

export default function PrintView({ user, exerciseId, onNavigate }: { user: User, exerciseId: string | null, onNavigate: (page: string) => void }) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [fontSettings, setFontSettings] = useState({
    title: 18,
    indicators: 12,
    description: 14,
    question: 16,
    option: 16
  });
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [zoom, setZoom] = useState(0.7);

  useEffect(() => {
    const apiBase = '/server.cjs';
    fetch(`${apiBase}/api/exercises/${exerciseId}?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setExercise(data);
        const content = JSON.parse(data.content);
        if (content.fontSettings) {
          setFontSettings(content.fontSettings);
        }
        if (content.itemsPerPage) {
          setItemsPerPage(content.itemsPerPage);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [exerciseId]);

  const handleSaveSettings = async () => {
    if (!exercise) return;
    setSavingSettings(true);
    const content = JSON.parse(exercise.content);
    const updatedContent = { ...content, fontSettings, itemsPerPage };
    
    const apiBase = '/server.cjs';
    try {
      const res = await fetch(`${apiBase}/api/exercises/${exercise.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: exercise.title,
          course: exercise.course,
          grade: exercise.grade,
          indicators: exercise.indicators,
          content: updatedContent
        })
      });
      if (res.ok) {
        setExercise({ ...exercise, content: JSON.stringify(updatedContent) });
        alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      }
    } catch (err) {
      alert('บันทึกไม่สำเร็จ');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePrintNewWindow = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printArea = document.getElementById('unified-print-area');
    if (!printArea) return;
    
    // Create a clone to strip transformations
    const clone = printArea.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.zoom = '1';
    const html = clone.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>EduGen AI - ${exercise.title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@100;200;300;400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            @page { 
              size: A4; 
              margin: 0 !important; 
            }
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Sarabun', sans-serif; 
              background: white; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            
            .a4-sheet {
              width: 210mm;
              height: 297mm;
              display: block;
              position: relative;
              overflow: hidden;
              background: white;
              box-sizing: border-box;
              page-break-after: always;
              font-family: 'Sarabun', sans-serif !important;
            }

            /* Manual overrides for common layout classes to ensure they work in print window */
            [class*="px-[20mm]"] { padding-left: 20mm !important; padding-right: 20mm !important; }
            [class*="h-[30mm]"] { height: 30mm !important; }
            [class*="h-[242mm]"] { height: 242mm !important; }
            [class*="h-[25mm]"] { height: 25mm !important; }
            
            .header { height: 30mm; width: 100%; border-bottom: 3px solid black; padding: 0 20mm; display: flex; align-items: flex-end; box-sizing: border-box; }
            .content { padding: 0 20mm; height: 242mm; display: flex; flex-direction: column; box-sizing: border-box; position: relative; }
            
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-center { justify-content: center !important; }
            .justify-end { justify-content: flex-end !important; }
            .items-center { align-items: center !important; }
            .items-end { align-items: flex-end !important; }
            .items-stretch { align-items: stretch !important; }
            .flex-1 { flex: 1 1 0% !important; }
            .shrink-0 { flex-shrink: 0 !important; }
            .w-full { width: 100% !important; }
            .gap-3 { gap: 12px !important; }
            .gap-4 { gap: 16px !important; }
            
            .border-b { border-bottom: 1.5px solid black !important; }
            .border-b-2 { border-bottom: 2.2px solid black !important; }
            .border-b-[3px] { border-bottom: 3.2px solid black !important; }
            .border-t-[3px] { border-top: 3.2px solid black !important; }
            .border-t-2 { border-top: 2.2px solid black !important; }
            .border-l-2 { border-left: 2.2px solid black !important; }
            .border-black { border-color: black !important; }
            
            .mb-2 { margin-bottom: 8px !important; }
            .mb-4 { margin-bottom: 16px !important; }
            .mb-6 { margin-bottom: 24px !important; }
            .mb-10 { margin-bottom: 40px !important; }
            .mt-8 { margin-top: 32px !important; }
            .pb-1 { padding-bottom: 4px !important; }
            .pb-5 { padding-bottom: 20px !important; }
            .pr-1 { padding-right: 4px !important; }
            .pr-4 { padding-right: 16px !important; }
            .pl-6 { padding-left: 24px !important; }
            
            .font-bold { font-weight: 700 !important; }
            .font-black { font-weight: 900 !important; }
            .font-extrabold { font-weight: 800 !important; }
            .text-center { text-align: center !important; }
            .text-left { text-align: left !important; }
            .text-slate-500 { color: #64748b !important; }
            .text-slate-600 { color: #475569 !important; }
            .text-slate-800 { color: #1e293b !important; }
            .text-indigo-600 { color: #4f46e5 !important; }
            
            .dotted-line { 
              border-bottom: 2px dotted #000 !important; 
              flex: 1 !important; 
              height: 20px !important; 
              margin-bottom: 4px !important;
              min-width: 30px;
            }

            .opt-circle { 
              width: 26px; height: 26px; border: 2.2px solid black; border-radius: 50%; 
              display: flex; align-items: center; justify-content: center; 
              font-weight: 800; font-size: 11pt; flex-shrink: 0; margin-top: 4px;
            }
            
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
            .gap-x-12 { column-gap: 48px !important; }
            .gap-y-4 { row-gap: 16px !important; }

            /* Ensure everything is 100% width and centered */
            #print-content { width: 210mm; margin: 0 auto; }
            
            /* Helper for matching exercises or long lines */
            .border-dotted { border-style: dotted !important; }
            .opacity-50 { opacity: 0.5 !important; }
            .bg-slate-50 { background-color: #f8fafc !important; border-left: 6px solid black !important; }
          </style>
        </head>
        <body>
          <div id="print-content">
            ${html}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Ensure styles are applied before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 2000);
  };

  if (loading) return <div className="text-center py-20">กำลังจัดเตรียมไฟล์...</div>;
  if (!exercise) return <div className="text-center py-20">ไม่พบแบบฝึกหัด</div>;

  const contentData = JSON.parse(exercise.content);
  const allItems = contentData.sections 
    ? contentData.sections.flatMap((s: any) => s.items) 
    : contentData.items;

  const chunks = [];
  for (let i = 0; i < allItems.length; i += itemsPerPage) {
    chunks.push(allItems.slice(i, i + itemsPerPage));
  }

  return (
    <div className="space-y-8 pb-20 max-w-[1400px] mx-auto px-4 relative font-sarabun text-left">
      {/* 1. UI Controls - Screen Only */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm no-print sticky top-4 z-[100]">
        <button onClick={() => onNavigate('history')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
          <ChevronLeft size={20} />
          <span>ย้อนกลับคลังแบบฝึกหัด</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 mr-2">
            <button onClick={() => setZoom(Math.max(0.3, zoom - 0.1))} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm transition-all"><ZoomOut size={16} /></button>
            <div className="px-3 text-[11px] font-black text-slate-600 min-w-[50px] text-center">{Math.round(zoom * 100)}%</div>
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm transition-all"><ZoomIn size={16} /></button>
            <button onClick={() => setZoom(0.7)} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm transition-all"><Maximize size={16} /></button>
          </div>

          <button onClick={handleSaveSettings} disabled={savingSettings} className="px-6 py-3 bg-white text-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 border border-slate-200 disabled:opacity-50 shadow-sm transition-all">
            {savingSettings ? <Loader2 size={18} className="animate-spin text-indigo-600" /> : <Save size={18} className="text-slate-400" />}
            <span>บันทึกตั้งค่า</span>
          </button>
          
          <button 
            onClick={handlePrintNewWindow}
            className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            <Printer size={18} />
            <span>เตรียมพิมพ์ (A4)</span>
          </button>
        </div>
      </div>

      {/* Main Working Area */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch h-[850px] no-print">
        
        {/* Left Sidebar: Controls (Hidden on Print) */}
        <div className="w-full lg:w-[320px] no-print space-y-6 flex-shrink-0 text-left">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-full overflow-y-auto no-scrollbar">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <Settings size={24} className="text-indigo-500" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2 text-left">จูนรูปเล่มเอกสาร</h3>
            <p className="text-[11px] text-slate-400 mb-8 leading-relaxed text-left">ปรับแต่งขนาดตัวอักษรและจำนวนข้อต่อแผ่นเพื่อให้ได้รูปแบบที่ต้องการครับ</p>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">จำนวนข้อต่อแผ่น</label>
                  <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{itemsPerPage} ข้อ</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button onClick={() => setItemsPerPage(Math.max(1, itemsPerPage - 1))} className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200 font-bold active:scale-95 text-slate-600">-</button>
                  <input type="range" min="1" max="15" value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value))} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  <button onClick={() => setItemsPerPage(Math.min(20, itemsPerPage + 1))} className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200 font-bold active:scale-95 text-slate-600">+</button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-6">
                <FontSizeInput label="ส่วนหัวข้อ" value={fontSettings.title} onChange={(v) => setFontSettings({...fontSettings, title: v})} />
                <FontSizeInput label="มาตรฐาน/ตัวชี้วัด" value={fontSettings.indicators} onChange={(v) => setFontSettings({...fontSettings, indicators: v})} />
                <FontSizeInput label="คำชี้แจง" value={fontSettings.description} onChange={(v) => setFontSettings({...fontSettings, description: v})} />
                <FontSizeInput label="โจทย์คำถาม" value={fontSettings.question} onChange={(v) => setFontSettings({...fontSettings, question: v})} />
                <FontSizeInput label="ตัวเลือก" value={fontSettings.option} onChange={(v) => setFontSettings({...fontSettings, option: v})} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Zone - Beautiful UI + Physical Precision */}
        <div className="flex-1 w-full bg-slate-200/50 rounded-3xl border border-slate-200 h-full overflow-y-auto p-20 no-print custom-scrollbar">
          <div className="min-w-fit flex justify-center py-10">
            <div 
              id="unified-print-area" 
              className="flex flex-col items-center gap-16"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              {chunks.map((chunk, pageIdx) => (
                <div 
                  key={pageIdx}
                  className="a4-sheet bg-white text-black font-sarabun relative flex flex-col shadow-sm overflow-hidden text-left"
                  style={{ 
                    width: '210mm', 
                    height: '297mm', 
                    minHeight: '297mm', 
                    boxSizing: 'border-box', 
                    display: 'block',
                    border: '1px solid #d1d5db'
                  }}
                >
                  {/* HEADER (30mm) */}
                  <div className="h-[30mm] w-full flex flex-col justify-end px-[20mm]">
                    <div className="flex justify-between items-end pb-1 pr-1 font-bold">
                      <div className="text-[14px] truncate pr-4 text-black">แบบฝึกหัด: {exercise.title}</div>
                      <div className="text-[11px] shrink-0 text-black">หน้า {pageIdx + 1} / {chunks.length}</div>
                    </div>
                    <div className="border-t-[3px] border-black mb-4"></div>
                  </div>

                  {/* CONTENT (242mm) */}
                  <div className="h-[242mm] px-[20mm] py-4 flex flex-col overflow-hidden text-left">
                    {pageIdx === 0 && (
                      <>
                        <div className="border-b-[3px] border-black pb-5 mb-10 text-[16pt] font-black flex items-stretch w-full">
                          <div className="flex items-center gap-3 flex-1 min-w-0 pr-6">
                            <span className="shrink-0">ชื่อ-นามสกุล:</span>
                            <div className="dotted-line"></div>
                          </div>
                          <div className="flex items-center gap-3 w-[120px] shrink-0 pl-6">
                            <span className="shrink-0">เลขที่:</span>
                            <div className="dotted-line"></div>
                          </div>
                          <div className="flex items-center gap-3 w-[180px] shrink-0 pl-6">
                            <span className="shrink-0">ชั้น:</span>
                            <div className="dotted-line"></div>
                            <span className="shrink-0">/</span>
                            <div className="dotted-line"></div>
                          </div>
                        </div>

                        <div className="mb-6 text-center">
                          <h1 className="font-extrabold mb-1" style={{ fontSize: `${fontSettings.title + 2}pt` }}>{exercise.title}</h1>
                          <p className="text-slate-800 font-bold italic mb-5" style={{ fontSize: `${fontSettings.indicators + 2}pt` }}>
                            มาตรฐาน/ตัวชี้วัด: {contentData.indicators || exercise.indicators}
                          </p>
                          <div className="bg-slate-50 p-5 border-l-[8px] border-black italic text-left leading-relaxed shadow-sm" style={{ fontSize: `${fontSettings.description + 1.5}pt` }}>
                            <span className="font-extrabold not-italic mr-3 underline">คำชี้แจง:</span>
                            {contentData.description}
                          </div>
                          <div className="mt-8 border-t-2 border-black w-full opacity-20"></div>
                        </div>
                      </>
                    )}

                    <div className="space-y-8 flex-1">
                      {chunk.map((item: any, idx: number) => {
                        const globalIdxVal = (pageIdx * itemsPerPage) + idx + 1;
                        const isMatching = contentData.type === 'matching' || (item.type === 'matching');
                        
                        // Collect and sort answers alphabetically for deterministic matching options
                        const sectionAnswers = isMatching ? chunk.map((it: any) => it.answer).sort((a: string, b: string) => a.localeCompare(b, 'th')) : [];

                        return (
                          <div key={idx} className="display-block" style={{ marginBottom: '10mm' }}>
                            <div className={`flex gap-6 items-center ${isMatching ? 'mb-2' : 'mb-4'}`} style={{ fontSize: `${fontSettings.question + 1.5}pt` }}>
                              <span className="font-bold shrink-0">
                                {isMatching ? <span className="mr-3">( &nbsp;&nbsp;&nbsp; )</span> : null}
                                {globalIdxVal}.
                              </span>
                              
                              <div className="flex-1 flex justify-between items-center gap-4">
                                <div className="flex items-center gap-6 flex-1">
                                  {isMatching && item.imageKeyword && (
                                    <div className="w-[22mm] h-[22mm] shrink-0 border-[2px] border-black rounded-lg overflow-hidden bg-white shadow-sm">
                                      <img 
                                        src={`https://loremflickr.com/200/200/${encodeURIComponent(item.imageKeyword)}?lock=${idx}`} 
                                        alt={item.imageKeyword}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  )}
                                  <div className="font-bold leading-relaxed">{item.question}</div>
                                </div>

                                {isMatching && (
                                  <>
                                    {/* Middle connector dots for drawing lines */}
                                    <div className="flex items-center gap-1 opacity-40 mx-4">
                                      <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                                      <div className="w-16 h-[1.5px] border-t border-dashed border-black"></div>
                                      <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                                    </div>

                                    <div className="w-[42%] flex items-start gap-4 pl-6 border-l-[2px] border-black py-2">
                                      <span className="font-black shrink-0">{String.fromCharCode(3585 + idx)}.</span>
                                      <span className="leading-tight font-bold">{sectionAnswers[idx]}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {!isMatching && (
                              item.options ? (
                                <div className="grid grid-cols-2 gap-x-12 gap-y-4 ml-10 text-slate-900 text-left">
                                  {item.options.map((opt: string, oIdx: number) => (
                                    <div key={oIdx} className="flex items-start gap-3" style={{ fontSize: `${fontSettings.option + 1.5}pt` }}>
                                      <div className="opt-circle">
                                        {String.fromCharCode(65 + oIdx)}
                                      </div>
                                      <span className="leading-tight">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="ml-10 space-y-4 pr-6">
                                  <div className="border-b border-dotted border-slate-600 h-10 w-full opacity-50"></div>
                                  {(contentData.type === 'essay' || contentData.type === 'math_steps') && (
                                    <>
                                      <div className="border-b border-dotted border-slate-600 h-10 w-full opacity-50"></div>
                                      <div className="border-b border-dotted border-slate-600 h-10 w-full opacity-50"></div>
                                    </>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* FOOTER (25mm) */}
                  <div className="h-[25mm] w-full flex flex-col justify-center px-[20mm] pb-4 absolute bottom-0 left-0 bg-white">
                    <div className="border-t-2 border-black pt-4 flex justify-between items-center text-[11pt] font-bold">
                      <div className="flex flex-wrap items-center gap-x-8">
                        <span className="uppercase text-slate-600">วิชา: {exercise.course}</span>
                        <span>ครูผู้สอน: คร.{user.name} {user.surname}</span>
                      </div>
                      <span className="text-[10pt] font-black text-indigo-600 tracking-tighter">EduGen AI Tool</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Answer Key Section (Bottom) */}
      <div className="bg-white p-12 rounded-3xl border border-slate-200 no-print mt-12 shadow-sm text-left">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">?</div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">เฉลยแบบฝึกหัด</h2>
            <p className="text-xs text-slate-400 font-medium">เฉพาะสำหรับคุณครูใช้ตรวจงาน</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {allItems.map((item: any, idx: number) => (
            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-indigo-200 hover:bg-white transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">{idx + 1}</div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5 tracking-widest">คำตอบที่ถูกต้อง</span>
                <span className="text-lg font-black text-indigo-700 leading-none">{item.answer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&family=IBM+Plex+Sans+Thai+Looped:wght@100;200;300;400;500;600;700&display=swap');
        .font-thai { font-family: 'IBM Plex Sans Thai', sans-serif; }
        .font-sarabun { font-family: 'Sarabun', sans-serif; }
        
        .dotted-line { 
          border-bottom: 2px dotted #000 !important; 
          flex: 1 !important; 
          height: 20px !important; 
          margin-bottom: 4px !important;
          min-width: 30px;
        }

        .opt-circle { 
          width: 26px; height: 26px; border: 2.2px solid black; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          font-weight: 800; font-size: 11pt; flex-shrink: 0; margin-top: 4px;
        }

        @media screen {
          .a4-sheet {
             font-family: 'Sarabun', sans-serif !important;
          }
        }

        @media print {
          @page { size: A4; margin: 0 !important; }
          
          /* Hide everything except our print mode container */
          body > #root > div:not(.print-mode-active),
          header, nav, footer, .no-print {
            display: none !important;
          }

          /* Force correct print layout */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            background: white !important;
            overflow: visible !important;
          }

          /* Main Container Control - NO POSITION ABSOLUTE */
          #print-content {
            display: block !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            position: static !important;
            visibility: visible !important;
          }

          .a4-sheet {
            display: block !important;
            width: 210mm !important;
            height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            position: relative !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}

function FontSizeInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</label>
        <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{value}pt</span>
      </div>
      <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100 italic">
        <button onClick={() => onChange(Math.max(8, value - 0.5))} className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200 hover:text-indigo-600 transition-all font-bold active:scale-90">-</button>
        <input type="range" min="8" max="32" step="0.5" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        <button onClick={() => onChange(Math.min(48, value + 0.5))} className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200 hover:text-indigo-600 transition-all font-bold active:scale-90">+</button>
      </div>
    </div>
  );
}
