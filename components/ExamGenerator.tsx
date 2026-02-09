
import React, { useState, useRef } from 'react';
import { ScrollText, Loader2, Sparkles, Wand2, X, ArrowLeft, Zap, CheckCircle2, Download, Printer, FileText, Layout, Settings, FileDown, History, Trash2, Clipboard, Search, Filter, ShieldCheck, ChevronRight, GraduationCap, Clock, Award, FileType, Link as LinkIcon, Share2 } from 'lucide-react';
import { generateExamPaper } from '../services/geminiService';
import { ExamPaper } from '../types';

type Mode = 'quick' | 'architect' | 'manual';

const ExamGenerator: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeMode, setActiveMode] = useState<Mode>('quick');
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [guestCode, setGuestCode] = useState<string | null>(null);

  // Configuration States
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('High School');
  const [chapters, setChapters] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [difficulty, setDifficulty] = useState({ easy: 30, medium: 50, hard: 20 });
  const [blueprint, setBlueprint] = useState({ mcq: 20, short: 30, long: 50 });

  const handleSynthesize = async () => {
    if (!subject || !chapters) {
      setError("Institutional parameters incomplete. Define Subject and Chapters.");
      return;
    }
    setLoading(true);
    setError(null);
    setPaper(null);
    setGuestCode(null);
    try {
      const result = await generateExamPaper({
        subject,
        grade,
        chapters,
        totalMarks,
        difficulty,
        blueprint,
        mode: activeMode
      });
      setPaper(result);
    } catch (e: any) {
      setError("Neural synthesis timed out. Re-initializing engine...");
    } finally {
      setLoading(false);
    }
  };

  const generateGuestLink = () => {
    if (!paper) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const storageKey = `guest_exam_${code}`;
    localStorage.setItem(storageKey, JSON.stringify(paper));
    setGuestCode(code);
  };

  const exportPDF = (isAnswerKey: boolean = false) => {
    if (!paper) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${paper.title} - ${isAnswerKey ? 'MASTER KEY' : 'OFFICIAL PAPER'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 60px; color: #1e293b; max-width: 900px; margin: 0 auto; line-height: 1.6; }
            .header { border-bottom: 4px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
            .school-header { font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; }
            .exam-title { font-size: 18px; font-weight: 700; color: #475569; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; border: 1.5px solid #e2e8f0; padding: 15px; border-radius: 12px; font-size: 13px; font-weight: 700; color: #64748b; }
            .instr { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; font-size: 13px; border-left: 5px solid #6366f1; }
            .section-title { font-size: 16px; font-weight: 800; text-transform: uppercase; margin: 40px 0 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: flex; justify-content: space-between; }
            .q-block { margin-bottom: 30px; page-break-inside: avoid; }
            .q-meta { font-size: 11px; font-weight: 800; color: #6366f1; text-transform: uppercase; margin-bottom: 8px; }
            .q-text { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 15px; display: flex; gap: 12px; }
            .q-num { background: #1e293b; color: white; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; }
            .options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-left: 40px; }
            .opt { border: 1.5px solid #e2e8f0; padding: 10px 15px; border-radius: 8px; font-size: 13px; }
            .marks { font-weight: 800; color: #1e293b; }
            .ans-box { border: 2px solid #10b981; background: #f0fdf4; padding: 15px; border-radius: 12px; margin-top: 15px; font-size: 13px; }
            .footer { margin-top: 80px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
            @media print { .options { grid-template-columns: 1fr; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-header">HORIZON ACADEMY GLOBAL</div>
            <div class="exam-title">${paper.title} ${isAnswerKey ? '(MASTER KEY)' : ''}</div>
          </div>
          <div class="info-grid">
            <div>SUBJECT: ${paper.subject}</div>
            <div>GRADE: ${paper.grade}</div>
            <div>DURATION: ${paper.duration}</div>
            <div>TOTAL MARKS: ${paper.totalMarks}</div>
            <div>STUDENT NAME: ________________________</div>
            <div>DATE: ____________________</div>
          </div>
          <div class="instr">
            <strong>INSTRUCTIONS TO CANDIDATES:</strong>
            <ul style="margin-top: 10px; margin-bottom: 0;">
              ${paper.instructions.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>
          ${paper.sections.map(sec => `
            <div class="section-title">
              <span>${sec.name} - ${sec.description}</span>
            </div>
            ${sec.questions.map((q, idx) => `
              <div class="q-block">
                <div class="q-meta">${q.bloomLevel} | Estimated: ${q.estimatedTime}</div>
                <div class="q-text">
                  <div class="q-num">${idx + 1}</div>
                  <div style="flex: 1">${q.question}</div>
                  <div class="marks">[${q.marks}]</div>
                </div>
                ${q.options ? `
                  <div class="options">
                    ${q.options.map(o => `<div class="opt">□ ${o}</div>`).join('')}
                  </div>
                ` : `<div style="height: 150px; border-bottom: 1px dashed #cbd5e1; margin-left: 40px;"></div>`}
                ${isAnswerKey ? `
                  <div class="ans-box">
                    <strong>Correct Answer:</strong> ${q.answerKey || 'N/A'}<br/>
                    <div style="margin-top: 10px;"><strong>Marking Scheme:</strong></div>
                    <ul style="margin-top: 5px;">${(q.markingScheme || []).map(m => `<li>${m}</li>`).join('')}</ul>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          `).join('')}
          <div class="footer">Synthesized via ENTRANCE AI Exam Studio • Verified Institutional Resource</div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <button onClick={onBack} className="flex items-center gap-3 text-sm font-black text-slate-500 hover:text-rose-500 transition-all group uppercase tracking-widest">
          <div className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 group-hover:border-rose-500/50 shadow-sm"><ArrowLeft size={18} /></div>
          Dashboard
        </button>
        <div className="flex items-center gap-4">
           <div className="px-6 py-2.5 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3"><ScrollText size={16} className="animate-pulse" /> Exam Studio Core</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Control Panel */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white dark:bg-[#0B1221] p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-3xl flex flex-col gap-8">
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-[2rem] border border-slate-200 dark:border-white/10">
                 {(['quick', 'architect', 'manual'] as Mode[]).map(m => (
                   <button 
                    key={m} 
                    onClick={() => setActiveMode(m)}
                    className={`flex-1 py-3 rounded-[1.6rem] text-[9px] font-black uppercase tracking-widest transition-all ${activeMode === m ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-xl' : 'text-slate-400'}`}
                   >
                    {m}
                   </button>
                 ))}
              </div>

              <div className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Assessment Title / Subject</label>
                   <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Astrophysics 101" className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 outline-none focus:ring-8 focus:ring-rose-500/5 transition-all font-bold text-sm" />
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Syllabus Coverage (Chapters)</label>
                   <textarea value={chapters} onChange={e => setChapters(e.target.value)} placeholder="e.g. Ch 1-4, Gravitation, Black Holes" className="w-full h-32 px-6 py-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 outline-none focus:ring-8 focus:ring-rose-500/5 transition-all font-bold text-sm resize-none" />
                 </div>

                 {activeMode === 'architect' && (
                   <div className="space-y-6 animate-in slide-in-from-top-4">
                      <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-3xl border border-slate-200 dark:border-white/5">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Question Blueprint (%)</label>
                        <div className="grid grid-cols-3 gap-4">
                           {Object.keys(blueprint).map((key) => (
                             <div key={key} className="text-center">
                               <input 
                                 type="number" 
                                 value={blueprint[key as keyof typeof blueprint]} 
                                 onChange={e => setBlueprint({...blueprint, [key]: Number(e.target.value)})}
                                 className="w-full bg-white dark:bg-slate-800 border-none rounded-xl p-3 text-center font-black text-xs" 
                               />
                               <span className="text-[8px] uppercase font-black text-slate-400 mt-2 block">{key}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                 )}

                 <button onClick={handleSynthesize} disabled={loading} className="w-full py-6 premium-gradient text-white rounded-[2.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50">
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <Wand2 size={24} />}
                    {loading ? 'Synthesizing Neural Paper...' : 'Synthesize Official Paper'}
                 </button>
              </div>

              {paper && (
                <div className="mt-4 pt-8 border-t border-slate-100 dark:border-white/10">
                  {!guestCode ? (
                    <button 
                      onClick={generateGuestLink}
                      className="w-full py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center justify-center gap-3 hover:bg-slate-200 transition-all"
                    >
                      <LinkIcon size={16} /> Deploy Guest Assessment Code
                    </button>
                  ) : (
                    <div className="bg-indigo-500 rounded-3xl p-6 text-white animate-in zoom-in-95">
                      <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">Guest Access Key</div>
                      <div className="text-4xl font-mono font-black tracking-[0.2em] mb-6 text-center select-all">{guestCode}</div>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(guestCode); }}
                        className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Share2 size={14} /> Copy Key to Clipboard
                      </button>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center gap-4 animate-in shake duration-300">
                  <X size={20} />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
                </div>
              )}
           </div>
        </div>

        {/* Paper Workspace */}
        <div className="lg:col-span-8">
           <div className="bg-white dark:bg-[#0B1221] min-h-[800px] rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex flex-wrap items-center justify-between gap-6 px-12">
                 <div className="flex items-center gap-6">
                    <button onClick={() => setShowAnswerKey(false)} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${!showAnswerKey ? 'text-rose-500 border-b-2 border-rose-500 pb-1' : 'text-slate-400'}`}>Official Draft</button>
                    <button onClick={() => setShowAnswerKey(true)} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${showAnswerKey ? 'text-rose-500 border-b-2 border-rose-500 pb-1' : 'text-slate-400'}`}>Master Key</button>
                 </div>
                 {paper && (
                   <div className="flex items-center gap-3">
                      <button onClick={() => exportPDF(false)} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 shadow-sm transition-all" title="Print Paper"><Printer size={18} /></button>
                      <button onClick={() => exportPDF(true)} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 shadow-sm transition-all" title="Print Answer Key"><ShieldCheck size={18} /></button>
                      <button className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 shadow-sm transition-all" title="Export to Word"><FileType size={18} /></button>
                   </div>
                 )}
              </div>

              <div className="flex-1 p-12 md:p-20 overflow-y-auto custom-scrollbar bg-slate-50/20 dark:bg-black/20">
                 {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-10">
                       <div className="relative">
                          <Loader2 size={100} className="animate-spin text-rose-500/20" strokeWidth={1} />
                          <GraduationCap size={40} className="absolute inset-0 m-auto text-rose-500 animate-bounce" />
                       </div>
                       <div className="text-center space-y-3">
                          <h4 className="text-xl font-black tracking-[0.4em] uppercase text-rose-500">Synthesizing Rigor</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Balancing Syllabus Weightage & Bloom's Taxonomy</p>
                       </div>
                    </div>
                 ) : paper ? (
                    <div className="animate-in fade-in duration-1000 space-y-12">
                       <div className="text-center space-y-2 border-b-4 border-slate-900 dark:border-white pb-8">
                          <h2 className="text-3xl font-black uppercase tracking-tighter">Horizon Academy Global</h2>
                          <p className="text-lg font-bold text-slate-500 dark:text-slate-400">{paper.title} {showAnswerKey && '(MASTER KEY)'}</p>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 border border-slate-200 dark:border-white/10 rounded-3xl bg-white dark:bg-black/40">
                          <div>
                             <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Subject</span>
                             <span className="text-xs font-black uppercase tracking-tight">{paper.subject}</span>
                          </div>
                          <div>
                             <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Duration</span>
                             <span className="text-xs font-black uppercase tracking-tight">{paper.duration}</span>
                          </div>
                          <div>
                             <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Total Marks</span>
                             <span className="text-xs font-black uppercase tracking-tight">{paper.totalMarks} pts</span>
                          </div>
                          <div>
                             <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Grade Level</span>
                             <span className="text-xs font-black uppercase tracking-tight">{paper.grade}</span>
                          </div>
                       </div>

                       <div className="p-8 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5">
                          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Award size={14} className="text-rose-500" /> General Instructions
                          </h4>
                          <ul className="space-y-2">
                             {paper.instructions.map((ins, i) => <li key={i} className="text-xs font-bold text-slate-600 dark:text-slate-300 flex gap-3"><span className="text-rose-500">{i+1}.</span> {ins}</li>)}
                          </ul>
                       </div>

                       {paper.sections.map((section, si) => (
                          <div key={si} className="space-y-8">
                             <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                                <h3 className="text-xl font-black uppercase tracking-tighter">{section.name}</h3>
                                <span className="text-[10px] font-black text-slate-400 uppercase">{section.description}</span>
                             </div>

                             <div className="space-y-10">
                                {section.questions.map((q, qi) => (
                                   <div key={qi} className="group relative">
                                      <div className="flex items-start gap-6">
                                         <div className="w-10 h-10 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl flex items-center justify-center text-sm font-black shadow-lg flex-shrink-0">{qi + 1}</div>
                                         <div className="flex-1 space-y-6">
                                            <div className="flex justify-between items-start gap-4">
                                               <p className="text-lg font-bold leading-relaxed">{q.question}</p>
                                               <span className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">[{q.marks}M]</span>
                                            </div>
                                            
                                            {q.options && (
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                 {q.options.map((opt, oi) => (
                                                   <div key={oi} className="p-4 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-bold bg-white dark:bg-black/20">
                                                      □ {opt}
                                                   </div>
                                                 ))}
                                              </div>
                                            )}

                                            {!q.options && !showAnswerKey && (
                                              <div className="h-32 border-b-2 border-dashed border-slate-100 dark:border-white/5"></div>
                                            )}

                                            {showAnswerKey && (
                                              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] animate-in zoom-in-95">
                                                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 mb-3 tracking-widest">
                                                    <ShieldCheck size={14} /> Neural Key & Scheme
                                                 </div>
                                                 <p className="text-sm font-bold text-slate-900 dark:text-white mb-4"><strong>Key:</strong> {q.answerKey}</p>
                                                 {q.markingScheme && (
                                                   <div className="space-y-2">
                                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marking Breakdown:</span>
                                                      {q.markingScheme.map((m, mi) => <p key={mi} className="text-xs text-slate-500 italic flex gap-2">• {m}</p>)}
                                                   </div>
                                                 )}
                                              </div>
                                            )}

                                            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                               <span className="text-[9px] font-black uppercase text-rose-500 tracking-widest">{q.bloomLevel}</span>
                                               <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><Clock size={10} /> {q.estimatedTime}</span>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
                       <ScrollText size={160} strokeWidth={0.5} />
                       <p className="text-2xl font-black uppercase mt-10 tracking-[0.5em] text-center">Engine Awaiting Parameters</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExamGenerator;
