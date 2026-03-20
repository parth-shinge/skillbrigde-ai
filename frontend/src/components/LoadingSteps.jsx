import { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  "📄 Parsing your documents...",
  "🧠 Extracting skills with AI...",
  "📊 Computing skill gaps..."
];

export const LoadingSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate steps timing even if API handles it differently, just for UX feedback
    const timers = [
      setTimeout(() => setCurrentStep(1), 2000),
      setTimeout(() => setCurrentStep(2), 4000)
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-sm">
      <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 h-1 bg-[#334155] w-full">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#06B6D4] to-[#10B981]"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / 3) * 100}%` }}
            transition={{ duration: 2, ease: "linear" }}
          />
        </div>

        <h3 className="text-xl font-bold text-[#F1F5F9] font-['Outfit'] mb-6 text-center mt-2">
          Analyzing Profile
        </h3>

        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > index;
            const isActive = currentStep === index;
            const isWaiting = currentStep < index;

            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isWaiting ? 0.3 : 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors
                  ${isActive ? 'bg-[#334155] border border-[#06B6D4]/30' : 'border border-transparent'}`}
              >
                <div className="w-6 flex justify-center">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-[#06B6D4] animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                  )}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'}`}>
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
