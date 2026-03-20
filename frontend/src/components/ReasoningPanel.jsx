import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, ChevronLeft, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ReasoningPanel = () => {
  const { reasoningTrace } = useApp();
  const [isOpen, setIsOpen] = useState(true);

  if (!reasoningTrace || reasoningTrace.length === 0) return null;

  return (
    <div className="relative">
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0F172A]/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle Button Container for centering vertical align */}
      <div className={`fixed top-1/2 -mt-6 z-50 transition-all duration-300 ease-in-out lg:hidden flex ${isOpen ? 'right-80 mr-4' : 'right-0'}`}>
         <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-[#06B6D4] text-white p-2 rounded-l-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] ${isOpen ? 'hidden' : 'block'}`}
         >
           <ChevronLeft className="w-6 h-6" />
         </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[64px] right-0 h-[calc(100vh-64px)] w-80 bg-[#1E293B] border-l border-[#334155] z-50 flex flex-col shadow-2xl lg:relative lg:top-0 lg:h-[600px] lg:rounded-2xl lg:border lg:flex"
          >
            <div className="p-4 border-b border-[#334155] flex justify-between items-center bg-[#0F172A] lg:rounded-t-2xl">
              <h3 className="font-bold font-['Outfit'] text-[#F1F5F9] flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#06B6D4]" />
                Reasoning Trace
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="lg:hidden text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 lg:pb-4 custom-scrollbar">
              {reasoningTrace.map((trace, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#0F172A] border border-[#334155] rounded-xl p-4 relative"
                >
                  <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-[#06B6D4] text-[#0F172A] text-xs font-bold flex items-center justify-center border-2 border-[#1E293B]">
                    {trace.step}
                  </div>
                  
                  <div className="flex justify-between items-start mb-2 ml-1">
                    <span className="text-sm font-bold text-[#F1F5F9]">{trace.skill_addressed}</span>
                    <span className="text-[10px] uppercase font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
                      {trace.confidence}% Conf
                    </span>
                  </div>

                  <div className="w-full h-1 bg-[#334155] rounded-full overflow-hidden mb-3 ml-1">
                    <div 
                      className="h-full bg-[#EF4444]" 
                      style={{ width: `${trace.gap_score}%` }} 
                    />
                  </div>

                  <p className="text-[#06B6D4] text-xs font-semibold mb-1 ml-1">{trace.course_selected}</p>
                  <p className="text-[#94A3B8] text-xs italic ml-1 leading-relaxed">"{trace.reason}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
