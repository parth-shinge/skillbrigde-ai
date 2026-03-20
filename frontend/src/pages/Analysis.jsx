import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Map, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generatePathway } from '../api/client';
import { LoadingSteps } from '../components/LoadingSteps';

// Maps proficiency enum to numerical value for charts
const PROFICIENCY_MAP = { "beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4 };
const COLOR_MAP = { "beginner": "#EF4444", "intermediate": "#F59E0B", "advanced": "#10B981", "expert": "#06B6D4" };

export default function Analysis() {
  const navigate = useNavigate();
  const { 
    skillGaps, resumeSkills, jdSkills, overallReadiness, 
    setPathway, setReasoningTrace, setMetrics, isLoading, setIsLoading 
  } = useApp();
  
  const [roleTitle, setRoleTitle] = useState("");
  const [roleType, setRoleType] = useState("technical");

  if (!skillGaps || skillGaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#94A3B8]">
        <h2 className="text-2xl font-bold text-[#F1F5F9] mb-4 font-['Outfit']">No Analysis Data Available</h2>
        <p>Please upload a resume and job description to see your gap analysis.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-6 px-6 py-2 bg-[#06B6D4] text-white rounded-lg hover:bg-[#0891b2]"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleGeneratePathway = async () => {
    setIsLoading(true);
    try {
      const resp = await generatePathway(skillGaps, roleTitle || "Target Role", roleType);
      setPathway(resp.pathway);
      setReasoningTrace(resp.reasoning_trace);
      setMetrics(resp.metrics);
      setIsLoading(false);
      navigate('/pathway');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      // fallback to demo mode logic if backend is not available
      navigate('/pathway');
    }
  };

  // Prepare chart data
  const mySkillsData = resumeSkills.map(s => ({
    name: s.name,
    level: PROFICIENCY_MAP[s.proficiency] || 1,
    label: s.proficiency
  })).sort((a,b) => b.level - a.level).slice(0, 8);

  const reqSkillsData = jdSkills.map(s => {
    const isCritical = skillGaps.some(g => g.skill === s.name && g.priority === "critical");
    return {
      name: s.name,
      level: PROFICIENCY_MAP[s.proficiency] || 1,
      label: s.proficiency,
      isCritical
    };
  }).sort((a,b) => b.level - a.level).slice(0, 8);

  const readinessColor = overallReadiness >= 75 ? "#10B981" : overallReadiness >= 50 ? "#F59E0B" : "#EF4444";
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (overallReadiness / 100) * circumference;

  return (
    <div className="w-full flex flex-col bg-[#0F172A] min-h-screen pb-20">
      {isLoading && <LoadingSteps />}

      {/* TOP - Readiness Hero */}
      <section className="pt-12 pb-8 px-4 flex flex-col items-center border-b border-[#334155]">
        <h1 className="text-3xl md:text-5xl font-bold font-['Outfit'] text-[#F1F5F9] mb-8">Skill Gap Radar</h1>
        
        <div className="relative w-64 h-64 mb-4 flex items-center justify-center">
          <svg className="transform -rotate-90 w-full h-full">
            {/* Background Ring */}
            <circle cx="128" cy="128" r="120" stroke="#334155" strokeWidth="16" fill="transparent" />
            {/* Progress Ring */}
            <motion.circle 
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="128" cy="128" r="120" 
              stroke={readinessColor} 
              strokeWidth="16" 
              fill="transparent"
              strokeDasharray={circumference}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center text-center">
            <span className="text-5xl font-bold font-['Outfit'] text-[#F1F5F9]">{overallReadiness}%</span>
            <span className="text-sm font-medium text-[#94A3B8] mt-1 uppercase tracking-widest">Match</span>
          </div>
        </div>
        <p className="text-lg text-[#94A3B8]">You're <strong style={{ color: readinessColor }}>{overallReadiness}% ready</strong> for this role.</p>
      </section>

      {/* MIDDLE - Charts */}
      <section className="py-12 px-4 border-b border-[#334155]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Your Skills */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold font-['Outfit'] text-[#F1F5F9] mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" /> Your Profile
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mySkillsData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide domain={[0, 4]} />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#334155', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#F1F5F9', fontWeight: 'bold' }}
                    formatter={(val, name, props) => [props.payload.label, 'Level']}
                  />
                  <Bar dataKey="level" radius={[0, 4, 4, 0]} barSize={20}>
                    {mySkillsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.label]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* JD Skills */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold font-['Outfit'] text-[#F1F5F9] mb-6 flex items-center gap-2">
              <Map className="w-5 h-5 text-[#F59E0B]" /> Role Requirements
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reqSkillsData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide domain={[0, 4]} />
                  <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tick={({x, y, payload}) => {
                    const skill = reqSkillsData.find(s => s.name === payload.value);
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={4} textAnchor="end" fill="#94A3B8" fontSize={12}>{payload.value}</text>
                        {skill?.isCritical && <circle cx={-payload.value.length*7 - 10} cy={-1} r={3} fill="#EF4444" className="animate-pulse" />}
                      </g>
                    );
                  }}/>
                  <Tooltip 
                    cursor={{fill: '#334155', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#F1F5F9', fontWeight: 'bold' }}
                    formatter={(val, name, props) => [props.payload.label, 'Required Level']}
                  />
                  <Bar dataKey="level" radius={[0, 4, 4, 0]} barSize={20}>
                    {reqSkillsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.label]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </section>

      {/* BOTTOM - Gap Table */}
      <section className="py-12 px-4 bg-[#0F172A]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold font-['Outfit'] text-[#F1F5F9] mb-6">Detailed Gap Analysis</h2>
          
          <div className="overflow-x-auto rounded-xl border border-[#334155] bg-[#1E293B]">
            <table className="w-full text-left col-collapse">
              <thead>
                <tr className="bg-[#334155]/50 text-[#94A3B8] text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Skill</th>
                  <th className="p-4 font-semibold">Your Level</th>
                  <th className="p-4 font-semibold">Required</th>
                  <th className="p-4 font-semibold text-right">Gap Score</th>
                  <th className="p-4 font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {skillGaps.sort((a,b) => b.gap_score - a.gap_score).map((gap, idx) => (
                  <motion.tr 
                    key={gap.skill}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-t border-[#334155] hover:bg-[#334155]/30 transition-colors"
                  >
                    <td className="p-4 text-[#F1F5F9] font-medium">{gap.skill}</td>
                    <td className="p-4">
                      {gap.current_level ? (
                        <span className="text-sm font-medium uppercase text-[#94A3B8]">{gap.current_level}</span>
                      ) : (
                        <span className="text-sm italic text-[#EF4444]">Missing</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium uppercase text-[#F1F5F9]">{gap.required_level}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-1.5 bg-[#334155] rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${gap.gap_score >= 80 ? 'bg-[#EF4444]' : gap.gap_score >= 50 ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} 
                            style={{ width: `${gap.gap_score}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#94A3B8] w-8">{Math.round(gap.gap_score)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-md uppercase tracking-wider
                        ${gap.priority === 'critical' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' : 
                          gap.priority === 'recommended' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' : 
                          'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'}`}>
                        {gap.priority}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="mt-8 px-4 flex justify-center">
        <div className="bg-[#1E293B] border border-[#06B6D4]/30 rounded-2xl p-8 max-w-3xl w-full shadow-2xl flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 space-y-4 w-full">
            <h3 className="text-lg font-bold font-['Outfit'] text-[#F1F5F9]">Ready to blueprint your path?</h3>
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="Target Role (e.g. Senior Frontend Eng)" 
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-lg p-3 text-[#F1F5F9] focus:outline-none focus:border-[#06B6D4]"
              />
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm text-[#94A3B8] cursor-pointer">
                  <input type="radio" name="roleType" value="technical" checked={roleType === 'technical'} onChange={() => setRoleType('technical')} className="text-[#06B6D4] focus:ring-[#06B6D4]" /> Technical Role
                </label>
                <label className="flex items-center gap-2 text-sm text-[#94A3B8] cursor-pointer">
                  <input type="radio" name="roleType" value="operational" checked={roleType === 'operational'} onChange={() => setRoleType('operational')} className="text-[#06B6D4] focus:ring-[#06B6D4]" /> Operational Role
                </label>
              </div>
            </div>
          </div>
          <button 
            onClick={handleGeneratePathway}
            className="w-full md:w-auto px-8 py-4 bg-[#06B6D4] hover:bg-[#0891b2] text-white rounded-xl font-bold font-['Outfit'] shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-transform hover:scale-105 whitespace-nowrap"
          >
            Generate My Learning Path →
          </button>
        </div>
      </section>

    </div>
  );
}
