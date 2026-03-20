import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loadDemoPersona } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Derive steps logic
  const steps = [
    { title: 'Upload', path: '/' },
    { title: 'Analyze', path: '/analyze' },
    { title: 'Pathway', path: '/pathway' }
  ];

  const currentStepIndex = steps.findIndex(s => s.path === location.pathname);

  const handleDemoClick = (persona) => {
    loadDemoPersona(persona);
    setDropdownOpen(false);
    navigate('/analyze');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b border-[#334155] z-50 px-6 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold font-['Outfit'] text-[#06B6D4] flex items-center gap-2">
          ⚡ SkillBridge AI
        </Link>
      </div>

      {/* Center: Steps */}
      <div className="hidden md:flex flex-1 items-center justify-center gap-4">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = currentStepIndex > index;
          return (
            <div key={step.title} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center h-8 px-4 rounded-full text-sm font-medium transition-colors",
                isActive ? "bg-[#06B6D4] text-white" : 
                isCompleted ? "bg-[#10B981]/20 text-[#10B981]" : 
                "bg-[#1E293B] text-[#94A3B8]"
              )}>
                {isCompleted && <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                {step.title}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-[2px]",
                  isCompleted ? "bg-[#10B981]" : "bg-[#334155]"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Demo Mode Dropdown */}
      <div className="flex-1 flex justify-end relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="border border-[#06B6D4] text-[#06B6D4] hover:bg-[#06B6D4]/10 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          Demo Mode <ChevronDown className="w-4 h-4" />
        </button>
        {dropdownOpen && (
          <div className="absolute top-12 right-0 w-64 bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
            <button 
              onClick={() => handleDemoClick('dev')}
              className="w-full text-left px-4 py-3 hover:bg-[#334155] text-sm text-[#F1F5F9] transition-colors border-b border-[#334155]"
            >
              👨💻 Junior Dev Persona
            </button>
            <button 
              onClick={() => handleDemoClick('ops')}
              className="w-full text-left px-4 py-3 hover:bg-[#334155] text-sm text-[#F1F5F9] transition-colors"
            >
              🏭 Ops Manager Persona
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
