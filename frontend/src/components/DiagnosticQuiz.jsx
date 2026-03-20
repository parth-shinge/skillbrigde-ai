import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { analyzeGaps } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

const QUESTIONS = [
  {
    id: "q1",
    text: "What is your experience with programming languages?",
    options: [
      { text: "None", score: 0, skill: "python" },
      { text: "Basic scripting", score: 1, skill: "python" },
      { text: "Proficient in 1+", score: 2, skill: "python" },
      { text: "Expert in multiple", score: 3, skill: "python" }
    ]
  },
  {
    id: "q2",
    text: "How comfortable are you with data analysis?",
    options: [
      { text: "No experience", score: 0, skill: "sql" },
      { text: "Basic Excel", score: 1, skill: "sql" },
      { text: "SQL/Python data work", score: 2, skill: "sql" },
      { text: "Advanced ML/BI", score: 3, skill: "sql" }
    ]
  },
  {
    id: "q3",
    text: "Rate your project management experience:",
    options: [
      { text: "None", score: 0, skill: "project-management" },
      { text: "Participated in projects", score: 1, skill: "project-management" },
      { text: "Led small teams", score: 2, skill: "project-management" },
      { text: "Managed large programs", score: 3, skill: "project-management" }
    ]
  },
  {
    id: "q4",
    text: "What is your cloud/infrastructure experience?",
    options: [
      { text: "None", score: 0, skill: "aws" },
      { text: "Used cloud tools", score: 1, skill: "aws" },
      { text: "Deployed applications", score: 2, skill: "aws" },
      { text: "Architect-level", score: 3, skill: "aws" }
    ]
  },
  {
    id: "q5",
    text: "Rate your communication and leadership skills:",
    options: [
      { text: "Developing", score: 0, skill: "leadership" },
      { text: "Competent", score: 1, skill: "leadership" },
      { text: "Strong", score: 2, skill: "leadership" },
      { text: "Expert", score: 3, skill: "leadership" }
    ]
  }
];

const PROFICIENCIES = ["beginner", "intermediate", "advanced", "expert"];

export const DiagnosticQuiz = () => {
  const navigate = useNavigate();
  const { setResumeSkills, setJdSkills, setSkillGaps, setOverallReadiness } = useApp();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    
    setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleFinish();
      }
    }, 400); // Small delay for UX transition
  };

  const handleFinish = async () => {
    setIsSynthesizing(true);
    
    // Convert answers to resume_skills format
    const generatedSkills = Object.values(answers).map(ans => ({
      name: ans.skill,
      proficiency: PROFICIENCIES[ans.score],
      years: ans.score * 2
    }));

    // Generate a mock JD for the sake of the quiz path (assuming a generic Tech Lead role)
    const mockJdSkills = [
      { name: "python", proficiency: "advanced" },
      { name: "sql", proficiency: "advanced" },
      { name: "project-management", proficiency: "intermediate" },
      { name: "aws", proficiency: "advanced" },
      { name: "leadership", proficiency: "advanced" }
    ];

    try {
      setResumeSkills(generatedSkills);
      setJdSkills(mockJdSkills);
      
      const analysisResponse = await analyzeGaps(generatedSkills, mockJdSkills);
      setSkillGaps(analysisResponse.skill_gaps);
      setOverallReadiness(analysisResponse.overall_readiness_score);
      
      setIsSynthesizing(false);
      navigate('/analyze');
    } catch (err) {
      console.error(err);
      setIsSynthesizing(false);
      // Fallback
      navigate('/analyze');
    }
  };

  if (isSynthesizing) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-[#1E293B] border border-[#334155] rounded-3xl p-10 mt-10 text-center">
        <Loader2 className="w-12 h-12 text-[#06B6D4] animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-[#F1F5F9] font-['Outfit'] mb-2">Generating your skill profile...</h2>
        <p className="text-[#94A3B8]">Mapping your answers to core competencies.</p>
      </div>
    );
  }

  const question = QUESTIONS[currentStep];

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0F172A]">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#06B6D4] to-[#10B981]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <div className="flex justify-between items-center mb-8 mt-2">
          <span className="text-sm font-bold text-[#06B6D4] uppercase tracking-wider">
            Diagnostic Quiz
          </span>
          <span className="text-[#94A3B8] text-sm font-medium">
            Step {currentStep + 1} of {QUESTIONS.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold font-['Outfit'] text-[#F1F5F9] mb-8 leading-tight">
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                const isSelected = answers[question.id]?.text === opt.text;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(question.id, opt)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group
                      ${isSelected 
                        ? 'bg-[#06B6D4]/10 border-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                        : 'bg-[#0F172A] border-[#334155] hover:border-[#94A3B8] hover:bg-[#334155]/20'}`}
                  >
                    <span className={`text-lg font-medium ${isSelected ? 'text-[#06B6D4]' : 'text-[#F1F5F9]'}`}>
                      {opt.text}
                    </span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                      ${isSelected ? 'border-[#06B6D4] bg-[#06B6D4]' : 'border-[#334155] group-hover:border-[#94A3B8]'}`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
