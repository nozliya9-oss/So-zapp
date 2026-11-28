import React from 'react';
import {
  Award,
  Check,
  ClipboardCheck,
  Globe,
  Mic,
  Sparkles,
  Star,
  Stethoscope,
} from 'lucide-react';
import { DiagnosticReport, Language, LessonNode, WeekCurriculum } from '../types';
import { KikiMascot } from './KikiMascot';
import { playButtonPop, unlockKikiAudio } from '../utils/soundEffects';

interface LessonsPathProps {
  language: Language;
  weeks: WeekCurriculum[];
  customNodes: LessonNode[];
  onSelectNode: (node: LessonNode) => void;
  sfxEnabled: boolean;
  diagnosticReport?: DiagnosticReport | null;
  onOpenDiagnostic?: () => void;
}

const S_CURVE_OFFSETS = [0, -52, -74, 0, 64, 48, 0];

export const LessonsPath: React.FC<LessonsPathProps> = ({
  language,
  weeks,
  customNodes,
  onSelectNode,
  sfxEnabled,
  diagnosticReport,
  onOpenDiagnostic,
}) => {
  const allNodes = weeks.flatMap((w) => w.nodes);
  const activeNode = allNodes.find((n) => n.status === 'active') || allNodes[0];

  const scrollToWeek = (weekNum: number) => {
    playButtonPop(!sfxEnabled);
    const el = document.getElementById(`week-section-${weekNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-5 pb-28 lg:pb-14">
      {/* Quick Week Jump Strip */}
      <div className="sticky top-[62px] z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-[#E5E5E5] dark:border-slate-800 rounded-2xl p-2 mb-5 flex items-center gap-1.5 overflow-x-auto">
        {weeks.map((w) => (
          <button
            key={w.weekNumber}
            type="button"
            onClick={() => scrollToWeek(w.weekNumber)}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#008ECC] dark:text-[#38BDF8] bg-[#E5F8FF]/70 dark:bg-[#00BFFF]/15 hover:bg-[#00BFFF] hover:text-white transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
          >
            {w.weekNumber}-hafta
          </button>
        ))}
      </div>

      {/* Diagnostic Exam Quick Banner */}
      {onOpenDiagnostic && (
        <div className="mb-5 bg-[#E5F8FF] dark:bg-[#00BFFF]/15 border-2 border-[#00BFFF] rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#008ECC] dark:text-[#38BDF8]">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>BIRINCHI IMTIHON · 25 SO‘Z</span>
            </div>
            <div className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">
              {diagnosticReport
                ? `Nutq diagnostikasi: ${diagnosticReport.overallScore}% ravonlik`
                : 'Birinchi imtihon — Nutq diagnostikasi'}
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              {diagnosticReport
                ? `Eng ko‘p qiynalgan harflar: ${diagnosticReport.weakestLetters
                    .map((w) => w.letter)
                    .join(', ')}`
                : '25 ta so‘z orqali qaysi harflarda mashq kerakligini aniqlang.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playButtonPop(!sfxEnabled);
              onOpenDiagnostic();
            }}
            className="btn-3d px-4 py-2.5 rounded-2xl bg-[#00BFFF] hover:bg-[#00AEEC] border-[#008ECC] text-white font-display font-bold text-xs sm:text-sm whitespace-nowrap shrink-0"
          >
            {diagnosticReport ? 'Natijani ko‘rish / Qayta' : 'Imtihonni boshlash'}
          </button>
        </div>
      )}

      {/* Kiki Greeting Banner */}
      {activeNode && (
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
          <KikiMascot mood="idle" size="sm" className="shrink-0" />
          <div className="bg-white dark:bg-slate-800 border-2 border-[#E5E5E5] dark:border-slate-700 rounded-2xl px-4 py-3 shadow-xs max-w-md text-center sm:text-left">
            <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
              {activeNode.kikiGreeting}
            </p>
            <p className="text-xs font-semibold text-[#008ECC] dark:text-[#38BDF8] mt-1">
              Navbatdagi dars: {activeNode.title}
            </p>
          </div>
        </div>
      )}

      {/* Custom Therapist Assigned Nodes (if any) */}
      {customNodes.length > 0 && (
        <section className="mb-10">
          <div className="btn-3d bg-[#58CC02] border-[#46A302] border-2 border-t-[#58CC02] border-x-[#58CC02] rounded-3xl p-4 sm:p-5 text-white mb-6">
            <p className="text-xs font-extrabold text-white/90">LOGOPED TOPSHIRIQLARI</p>
            <h2 className="font-display font-bold text-xl mt-0.5">
              Shaxsiy biriktirilgan mashqlar
            </h2>
          </div>

          <div className="flex flex-col items-center gap-6">
            {customNodes.map((node) => (
              <div key={node.id} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    playButtonPop(!sfxEnabled);
                    onSelectNode(node);
                  }}
                  className="node-3d w-[82px] h-[82px] rounded-full bg-[#58CC02] border-[#46A302] text-white flex items-center justify-center"
                >
                  <Stethoscope className="w-8 h-8" />
                </button>
                <div className="mt-2 text-center max-w-[220px]">
                  <div className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    {node.title}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {node.words.length} ta so‘z · {node.targetSound}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5-Week Scrollable Learning Roadmap */}
      <div className="space-y-12">
        {weeks.map((week) => (
          <section
            key={week.weekNumber}
            id={`week-section-${week.weekNumber}`}
            className="scroll-mt-32"
          >
            {/* Week Header Banner */}
            <div className="btn-3d bg-[#00BFFF] border-[#008ECC] border-2 border-t-[#00BFFF] border-x-[#00BFFF] rounded-3xl p-5 sm:p-6 text-white mb-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-white/90 tracking-wide">
                    {week.weekNumber}-HAFTA ·{' '}
                    {language === 'uz' ? 'O‘ZBEK TILI' : 'RUS TILI'}
                  </p>
                  <h2 className="font-display font-bold text-xl sm:text-2xl mt-0.5 leading-snug">
                    {week.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/95 mt-1 font-semibold">
                    {week.subtitle}
                  </p>
                </div>
                <div className="bg-white/20 rounded-2xl px-3 py-2 text-xs font-extrabold whitespace-nowrap shrink-0">
                  6 kun + Yakshanba
                </div>
              </div>
            </div>

            {/* 7-Node Winding Path for the Week */}
            <div className="relative flex flex-col items-center py-1">
              {week.nodes.map((node, index) => {
                const offset = S_CURVE_OFFSETS[index % S_CURVE_OFFSETS.length];
                const isCompleted = node.status === 'completed';
                const isActive = node.status === 'active';
                const isAssessment = node.variant === 'assessment';
                const isMultilingual = node.variant === 'multilingual';

                let nodeClasses = 'bg-[#00BFFF] border-[#008ECC] text-white';
                if (isCompleted) {
                  nodeClasses = 'bg-[#FFC800] border-[#E5A500] text-slate-900';
                } else if (isAssessment) {
                  nodeClasses = 'bg-[#FF9600] border-[#CC7800] text-white';
                } else if (isMultilingual) {
                  nodeClasses = 'bg-[#7C3AED] border-[#5B21B6] text-white';
                }

                const nextOffset =
                  index < week.nodes.length - 1
                    ? S_CURVE_OFFSETS[(index + 1) % S_CURVE_OFFSETS.length]
                    : offset;

                const renderIcon = () => {
                  if (isCompleted) return <Check className="w-8 h-8 stroke-[3]" />;
                  if (isAssessment) return <ClipboardCheck className="w-8 h-8" />;
                  if (isMultilingual) return <Globe className="w-8 h-8" />;
                  if (isActive) return <Mic className="w-8 h-8" />;
                  return <Star className="w-7 h-7 fill-current" />;
                };

                return (
                  <div
                    key={node.id}
                    className={`relative flex flex-col items-center w-full mb-8 last:mb-2 ${
                      isActive ? 'z-20' : 'z-10'
                    }`}
                  >
                    {index < week.nodes.length - 1 && (
                      <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[260px] h-[108px] z-0"
                        viewBox="-130 0 260 108"
                        fill="none"
                      >
                        <path
                          d={`M ${offset} 14 C ${offset} 60, ${nextOffset} 50, ${nextOffset} 100`}
                          stroke={isCompleted ? '#FFC800' : '#E5E5E5'}
                          strokeWidth="6"
                          strokeDasharray="10 10"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}

                    <div
                      style={{ transform: `translateX(${offset}px)` }}
                      className={`relative flex flex-col items-center ${
                        isActive ? 'z-20' : 'z-10'
                      }`}
                    >
                      {isAssessment && !isCompleted && (
                        <div className="pointer-events-none mb-1.5">
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 border border-[#FF9600] text-amber-800 dark:text-amber-200 font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                            <Award className="w-3.5 h-3.5" />
                            <span>Yakshanba sinovi</span>
                          </span>
                        </div>
                      )}

                      {isMultilingual && !isCompleted && (
                        <div className="pointer-events-none mb-1.5">
                          <span className="inline-flex items-center gap-1 bg-violet-50 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-200 font-extrabold text-[11px] px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                            <Sparkles className="w-3 h-3" />
                            <span>O‘zbek vs Rus R</span>
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          unlockKikiAudio();
                          playButtonPop(!sfxEnabled);
                          onSelectNode(node);
                        }}
                        aria-label={`${node.title} darsini boshlash`}
                        className="node-3d-btn relative z-10 flex flex-col items-center cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00BFFF]/50 rounded-3xl p-1"
                      >
                        {isActive && (
                          <span className="animate-tooltip-bounce mb-2 inline-block bg-white dark:bg-slate-800 border-2 border-[#00BFFF] text-[#008ECC] dark:text-[#38BDF8] font-display font-bold text-xs tracking-wider px-3.5 py-1 rounded-xl shadow-sm whitespace-nowrap">
                            BOSHLASH
                          </span>
                        )}

                        <span className="relative flex items-center justify-center">
                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="z-0 absolute -inset-2.5 rounded-full border-4 border-[#00BFFF]/40"
                            />
                          )}
                          <span
                            className={`relative z-10 node-3d-face w-[82px] h-[82px] rounded-full flex items-center justify-center border-2 border-t-transparent border-x-transparent ${nodeClasses}`}
                          >
                            {renderIcon()}
                          </span>
                        </span>

                        <span className="mt-2 block text-center max-w-[230px] rounded-xl px-2 py-1 hover:bg-[#E5F8FF]/60 dark:hover:bg-slate-800/70 transition-colors">
                          <span className="block font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {node.title}
                          </span>
                          <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            {node.words.length} ta so‘z · {node.targetSound}
                            {isCompleted && (
                              <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                                {' '}
                                · {node.starsEarned}/{node.maxStars} ★
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
