import { useNavigate, Link } from 'react-router-dom';
import { UploadZone } from '../components/UploadZone';
import { useApp } from '../context/AppContext';
import { FileText, Search, Map, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const { loadDemoPersona } = useApp();

  const handleDemoMode = () => {
    loadDemoPersona('dev');
    navigate('/analyze');
  };

  return (
    <div className="w-full flex flex-col bg-[#0F172A] overflow-x-hidden pt-10">
      
      {/* SECTION 1 - Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-16 px-4 pb-20 bg-grid overflow-hidden">
        {/* Floating Glow Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#06B6D4] rounded-full blur-[150px] opacity-15 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#10B981] rounded-full blur-[150px] opacity-15 animate-pulse" style={{ animationDuration: '5s' }} />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-[72px] font-bold font-['Outfit'] leading-tight tracking-tight text-[#F1F5F9] mb-4"
          >
            Stop Generic Onboarding.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#10B981]">Start Smart.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mb-10"
          >
            SkillBridge AI maps your exact skill gaps and builds a personalized learning path — in seconds.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <button 
              onClick={() => {
                document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-[#06B6D4] hover:bg-[#0891b2] text-white rounded-xl font-semibold text-lg transition-transform hover:scale-105"
            >
              → Upload My Resume
            </button>
            <button 
              onClick={handleDemoMode}
              className="px-8 py-4 bg-transparent border border-[#06B6D4] text-[#06B6D4] hover:bg-[#06B6D4]/10 rounded-xl font-semibold text-lg transition-transform hover:scale-105"
            >
              Try Demo Mode
            </button>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-4 text-sm text-[#94A3B8]"
          >
            No account needed. Works for any role.
          </motion.p>
          <p className="text-[#94A3B8] text-sm mt-4">
            No resume handy?{' '}
            <Link
              to="/quiz"
              className="text-[#06B6D4] hover:underline font-medium"
            >
              Take the 5-question skill diagnostic instead →
            </Link>
          </p>
        </div>
      </section>

      {/* SECTION 1.5 - Upload Area (Moved below fold for UX flow) */}
      <section id="upload-section" className="py-20 px-4 bg-[#0F172A] border-y border-[#334155]/50 relative z-20">
        <div className="max-w-6xl mx-auto">
          <UploadZone />
        </div>
      </section>

      {/* SECTION 2 - How It Works */}
      <section className="py-24 px-4 bg-[#1E293B]/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-['Outfit'] text-[#F1F5F9] mb-16">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-between items-center relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[#06B6D4] via-[#10B981] to-[#F59E0B] opacity-30 z-0"></div>
            
            {[{
              icon: <FileText className="w-8 h-8 text-[#06B6D4]" />,
              title: "📄 Parse",
              desc: "Extracts exact skills and proficiency from your resume."
            }, {
              icon: <Search className="w-8 h-8 text-[#10B981]" />,
              title: "🔍 Analyze",
              desc: "Compares your profile to job requirements to find gaps."
            }, {
              icon: <Map className="w-8 h-8 text-[#F59E0B]" />,
              title: "🗺️ Pathfind",
              desc: "Generates an intelligent sequence of learning modules."
            }].map((step, i) => (
              <div key={i} className="flex flex-col items-center relative z-10 bg-[#0F172A] p-6 rounded-2xl border border-[#334155] shadow-xl w-72 mb-8 md:mb-0 transform transition-all hover:-translate-y-2">
                <div className="w-20 h-20 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center mb-6 shadow-inner">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-[#F1F5F9] mb-2">{step.title}</h3>
                <p className="text-[#94A3B8] text-center">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 - Feature Cards */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard 
              title="Intelligent Parsing"
              icon={<Cpu className="w-6 h-6 text-[#06B6D4]" />}
              desc="LLM-powered extraction works beautifully on any resume format, normalizing messy data into standardized taxonomy."
            />
            <FeatureCard 
              title="Skill Gap Radar"
              icon={<Search className="w-6 h-6 text-[#10B981]" />}
              desc="Visualize exactly where you stand against the role requirements, breaking down critical missing pieces versus nice-to-haves."
            />
            <FeatureCard 
              title="Adaptive Pathway"
              icon={<Map className="w-6 h-6 text-[#F59E0B]" />}
              desc="Graph-based learning pathways intelligently respect prerequisites so you learn concepts in the perfect topological order."
            />
            <FeatureCard 
              title="Reasoning Trace"
              icon={<FileText className="w-6 h-6 text-[#EF4444]" />}
              desc="See the exact WHY behind every recommendation. No black box — full transparency on every learning module."
            />
          </div>
        </div>
      </section>

      {/* SECTION 4 - Badges */}
      <section className="py-12 bg-[#0F172A] border-t border-[#334155]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#94A3B8] font-medium mb-6">Works seamlessly across technical and operational roles:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Software Engineer", "Data Analyst", "DevOps Engineer", "Operations Manager", "Warehouse Lead", "HR Coordinator"].map((domain, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-[#1E293B] text-[#F1F5F9] border border-[#334155] text-sm">
                {domain}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="bg-[#1E293B] border border-[#334155] p-8 rounded-2xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#06B6D4] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      <div className="bg-[#0F172A] w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-[#334155]">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-['Outfit'] text-[#F1F5F9] mb-3">{title}</h3>
      <p className="text-[#94A3B8] leading-relaxed">{desc}</p>
    </div>
  );
}
