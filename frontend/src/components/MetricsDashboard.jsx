import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, TrendingUp, Zap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target || target === 0) { setCount(0); return; }
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
}

export const MetricsDashboard = () => {
  const { metrics } = useApp();

  const animatedHours = useCountUp(metrics?.total_hours || 0);
  const animatedSaved = useCountUp(metrics?.time_saved_hours || 0);
  const animatedModules = useCountUp(metrics?.modules_count || 0);
  const animatedEfficiency = useCountUp(metrics?.time_saved_percent || 0);

  if (!metrics) return null;

  const stats = [
    { 
      label: "Training Hours", 
      value: animatedHours, 
      suffix: "h", 
      icon: <Clock className="w-5 h-5 text-[#3b82f6]" />,
      color: "from-[#3b82f6] to-[#2563eb]"
    },
    { 
      label: "Hours Saved", 
      value: animatedSaved, 
      suffix: "h", 
      icon: <Zap className="w-5 h-5 text-[#10B981]" />,
      color: "from-[#10B981] to-[#059669]",
      highlight: true
    },
    { 
      label: "Modules", 
      value: animatedModules, 
      suffix: "", 
      icon: <BookOpen className="w-5 h-5 text-[#F59E0B]" />,
      color: "from-[#F59E0B] to-[#D97706]"
    },
    { 
      label: "Efficiency", 
      value: animatedEfficiency, 
      suffix: "%", 
      icon: <TrendingUp className="w-5 h-5 text-[#8b5cf6]" />,
      color: "from-[#8b5cf6] to-[#7c3aed]"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5 relative overflow-hidden group hover:border-[#06B6D4]/50 transition-colors"
        >
          {/* Subtle top gradient bar */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-70`} />
          
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-[#94A3B8]">{stat.label}</span>
            <div className="bg-[#0F172A] p-2 rounded-lg border border-[#334155]">
              {stat.icon}
            </div>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl lg:text-5xl font-bold font-['Outfit'] ${stat.highlight ? 'text-[#10B981]' : 'text-[#06B6D4]'}`}>
              {stat.value}
            </span>
            {stat.suffix && <span className="text-lg text-[#94A3B8] font-bold">{stat.suffix}</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
