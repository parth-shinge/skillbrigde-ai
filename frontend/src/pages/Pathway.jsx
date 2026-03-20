import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MetricsDashboard } from '../components/MetricsDashboard';
import { PathwayGraph } from '../components/PathwayGraph';
import { ReasoningPanel } from '../components/ReasoningPanel';
import { Download, RefreshCw, ChevronDown, ChevronUp, BookOpen, Clock, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Pathway() {
  const navigate = useNavigate();
  const { pathway, resetAll } = useApp();
  const [expandedModule, setExpandedModule] = useState(null);

  const handleStartOver = () => {
    resetAll();
    navigate('/');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!pathway || pathway.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#94A3B8]">
        <h2 className="text-2xl font-bold text-[#F1F5F9] mb-4 font-['Outfit']">No Pathway Generated</h2>
        <p>Please perform an analysis to see your learning pathway.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-6 px-6 py-2 bg-[#06B6D4] text-white rounded-lg hover:bg-[#0891b2]"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Pre-sort pathway based on position constraint
  const sortedPathway = [...pathway].sort((a,b) => a.position - b.position);

  return (
    <div className="w-full flex flex-col bg-[#0F172A] min-h-screen p-4 md:p-8 pb-24">
      
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Title row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[#334155] pb-6 print:border-b-0 print:pb-0">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold font-['Outfit'] text-[#F1F5F9] mb-2">Your Learning Pathway</h1>
            <p className="text-lg text-[#94A3B8]">Optimized sequence to close your exact skill gaps.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-3 print:hidden">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-[#334155] bg-[#1E293B] text-[#F1F5F9] hover:bg-[#334155] transition-colors rounded-lg font-medium text-sm"
            >
              <Download className="w-4 h-4 text-[#06B6D4]" />
              Download Plan
            </button>
            <button 
              onClick={handleStartOver}
              className="flex items-center gap-2 px-4 py-2 border border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors rounded-lg font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <MetricsDashboard />

        {/* Graph and Reasoning Flow */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 print:hidden">
          <div className="flex-1 shadow-2xl rounded-2xl overflow-hidden">
            <PathwayGraph />
          </div>
          <div className="w-full lg:w-[320px] shrink-0">
             <ReasoningPanel />
          </div>
        </div>

        {/* Ordered Module List */}
        <div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-[#F1F5F9] mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#10B981]" />
            Detailed Curriculum
          </h2>

          <div className="space-y-4 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-[31px] top-[40px] bottom-[40px] w-0.5 bg-[#334155] z-0" />

            {sortedPathway.map((course, idx) => (
              <div key={course.course_id} className="relative z-10 flex flex-col md:flex-row gap-4">
                
                {/* Step Number Circle */}
                <div className="hidden md:flex shrink-0 w-16 h-16 rounded-full bg-[#1E293B] border-4 border-[#0F172A] items-center justify-center shadow-lg relative z-10">
                  <span className="text-xl font-bold text-[#06B6D4] font-['Outfit']">{idx + 1}</span>
                </div>

                {/* Card */}
                <div className="flex-1 bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden transition-all hover:border-[#06B6D4]/40 print:border-[#000] print:border print:mb-4">
                  <div 
                    className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer"
                    onClick={() => setExpandedModule(expandedModule === course.course_id ? null : course.course_id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border
                          ${course.priority === 'critical' ? 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10' : 
                            course.priority === 'recommended' ? 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10' : 
                            'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10'}`}>
                          {course.priority} Priority
                        </span>
                        <span className="text-sm font-medium text-[#94A3B8]">{course.domain}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-['Outfit'] text-[#F1F5F9]">{course.title}</h3>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center gap-4 text-sm font-medium">
                      <div className="flex items-center gap-1.5 text-[#94A3B8] bg-[#0F172A] px-3 py-1.5 rounded-lg border border-[#334155]">
                        <Clock className="w-4 h-4" /> {course.duration_hours}h
                      </div>
                      <div className="flex items-center gap-1.5 text-[#94A3B8] bg-[#0F172A] px-3 py-1.5 rounded-lg border border-[#334155]">
                        <Award className="w-4 h-4" /> <span className="uppercase">{course.level}</span>
                      </div>
                      <button className="hidden md:flex p-2 hover:bg-[#334155] rounded-lg transition-colors print:hidden">
                        {expandedModule === course.course_id ? <ChevronUp className="w-5 h-5 text-[#F1F5F9]" /> : <ChevronDown className="w-5 h-5 text-[#94A3B8]" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Meta/Objectives */}
                  <AnimatePresence>
                    {(expandedModule === course.course_id) && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#0F172A] border-t border-[#334155] print:block print:h-auto print:opacity-100"
                      >
                        <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm uppercase font-bold text-[#06B6D4] tracking-wider mb-2">Skills Covered</h4>
                            <div className="flex flex-wrap gap-2">
                              {course.skills_taught.map(skill => (
                                <span key={skill} className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] px-2 py-1 rounded text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm uppercase font-bold text-[#06B6D4] tracking-wider mb-2">Learning Objectives</h4>
                            <ul className="space-y-2 text-[#94A3B8] text-sm mt-2">
                              {(course.learning_objectives && course.learning_objectives.length > 0
                                ? course.learning_objectives
                                : course.skills_taught || []
                              ).map((obj, i) => (
                                <li key={i} className="flex gap-2 items-start">
                                  <span className="text-[#10B981] mt-0.5 flex-shrink-0">✓</span>
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
