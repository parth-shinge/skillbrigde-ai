import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [resumeSkills, setResumeSkills] = useState([]);
  const [jdSkills, setJdSkills] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [pathway, setPathway] = useState([]);
  const [reasoningTrace, setReasoningTrace] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [overallReadiness, setOverallReadiness] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState(null);
  const [activePersona, setActivePersona] = useState(null);

  const resetAll = () => {
    setResumeSkills([]);
    setJdSkills([]);
    setSkillGaps([]);
    setPathway([]);
    setReasoningTrace([]);
    setMetrics(null);
    setOverallReadiness(0);
    setIsLoading(false);
    setLoadingStep("");
    setError(null);
    setActivePersona(null);
  };

  const loadDemoPersona = (persona) => {
    resetAll();
    setActivePersona(persona);
    
    if (persona === "dev") {
      setResumeSkills([
        { name: "python", proficiency: "intermediate", years: 3 },
        { name: "sql", proficiency: "beginner", years: 1 },
        { name: "javascript", proficiency: "intermediate", years: 2 },
        { name: "git", proficiency: "intermediate", years: 3 },
        { name: "react", proficiency: "beginner", years: 0.5 },
      ]);
      setJdSkills([
        { name: "python", proficiency: "advanced" },
        { name: "sql", proficiency: "advanced" },
        { name: "docker", proficiency: "intermediate" },
        { name: "aws", proficiency: "intermediate" },
        { name: "react", proficiency: "advanced" },
        { name: "system-design", proficiency: "intermediate" },
      ]);
      setSkillGaps([
        { skill: "python", required_level: "advanced", current_level: "intermediate", gap_score: 40, priority: "recommended" },
        { skill: "sql", required_level: "advanced", current_level: "beginner", gap_score: 75, priority: "critical" },
        { skill: "docker", required_level: "intermediate", current_level: null, gap_score: 100, priority: "critical" },
        { skill: "aws", required_level: "intermediate", current_level: null, gap_score: 100, priority: "critical" },
        { skill: "react", required_level: "advanced", current_level: "beginner", gap_score: 75, priority: "critical" },
        { skill: "system-design", required_level: "intermediate", current_level: null, gap_score: 100, priority: "critical" },
      ]);
      setOverallReadiness(42);
      
      setPathway([
        { position: 1, course_id: "do_01", title: "Docker Fundamentals", domain: "DevOps", duration_hours: 4, level: "beginner", priority: "critical", skills_taught: ["docker"] },
        { position: 2, course_id: "aws_01", title: "AWS Core Services", domain: "Cloud", duration_hours: 8, level: "intermediate", priority: "critical", skills_taught: ["aws"] },
        { position: 3, course_id: "sql_02", title: "Advanced SQL Queries", domain: "Data", duration_hours: 6, level: "advanced", priority: "critical", skills_taught: ["sql"] },
        { position: 4, course_id: "react_02", title: "React Performance & Architecture", domain: "Frontend", duration_hours: 10, level: "advanced", priority: "critical", skills_taught: ["react"] },
        { position: 5, course_id: "sd_01", title: "System Design for Developers", domain: "Architecture", duration_hours: 6, level: "intermediate", priority: "critical", skills_taught: ["system-design"] },
        { position: 6, course_id: "py_02", title: "Python Concurrency & Async", domain: "Backend", duration_hours: 5, level: "advanced", priority: "recommended", skills_taught: ["python"] },
      ]);
      setReasoningTrace([
        { step: 1, skill_addressed: "docker", gap_score: 100, course_selected: "Docker Fundamentals", reason: "Missing required skill entirely.", confidence: 95 },
        { step: 2, skill_addressed: "aws", gap_score: 100, course_selected: "AWS Core Services", reason: "Critical gap in cloud infrastructure.", confidence: 92 },
        { step: 3, skill_addressed: "sql", gap_score: 75, course_selected: "Advanced SQL Queries", reason: "Significant gap: beginner vs advanced.", confidence: 88 },
        { step: 4, skill_addressed: "react", gap_score: 75, course_selected: "React Performance & Architecture", reason: "Significant gap: beginner vs advanced.", confidence: 88 },
        { step: 5, skill_addressed: "system-design", gap_score: 100, course_selected: "System Design for Developers", reason: "Required for senior responsibilities.", confidence: 90 },
        { step: 6, skill_addressed: "python", gap_score: 40, course_selected: "Python Concurrency & Async", reason: "Minor gap: intermediate vs advanced.", confidence: 75 },
      ]);
      setMetrics({
        total_hours: 39,
        standard_hours: 120,
        time_saved_hours: 81,
        time_saved_percent: 67,
        readiness_improvement: 58,
        modules_count: 6
      });
    } else if (persona === "ops") {
      setResumeSkills([
        { name: "inventory-management", proficiency: "intermediate", years: 4 },
        { name: "forklift-operation", proficiency: "advanced", years: 5 },
        { name: "team-coordination", proficiency: "beginner", years: 1 },
        { name: "excel", proficiency: "beginner", years: 2 },
      ]);
      setJdSkills([
        { name: "supply-chain-management", proficiency: "advanced" },
        { name: "warehouse-management-systems", proficiency: "intermediate" },
        { name: "team-leadership", proficiency: "advanced" },
        { name: "excel", proficiency: "intermediate" },
        { name: "safety-compliance", proficiency: "advanced" },
      ]);
      setSkillGaps([
        { skill: "supply-chain-management", required_level: "advanced", current_level: null, gap_score: 100, priority: "critical" },
        { skill: "warehouse-management-systems", required_level: "intermediate", current_level: "beginner", gap_score: 50, priority: "recommended" },
        { skill: "team-leadership", required_level: "advanced", current_level: "beginner", gap_score: 75, priority: "critical" },
        { skill: "excel", required_level: "intermediate", current_level: "beginner", gap_score: 40, priority: "recommended" },
        { skill: "safety-compliance", required_level: "advanced", current_level: null, gap_score: 100, priority: "critical" },
      ]);
      setOverallReadiness(35);
      
      setPathway([
        { position: 1, course_id: "saf_01", title: "Advanced Safety Compliance", domain: "Safety", duration_hours: 4, level: "advanced", priority: "critical", skills_taught: ["safety-compliance"] },
        { position: 2, course_id: "ld_02", title: "Effective Team Leadership", domain: "Leadership", duration_hours: 8, level: "advanced", priority: "critical", skills_taught: ["team-leadership"] },
        { position: 3, course_id: "scm_01", title: "Supply Chain Principles", domain: "Operations", duration_hours: 6, level: "advanced", priority: "critical", skills_taught: ["supply-chain-management"] },
        { position: 4, course_id: "wms_01", title: "Modern WMS Software Tools", domain: "Operations", duration_hours: 5, level: "intermediate", priority: "recommended", skills_taught: ["warehouse-management-systems"] },
        { position: 5, course_id: "exc_02", title: "Excel for Business Logic", domain: "Data", duration_hours: 4, level: "intermediate", priority: "recommended", skills_taught: ["excel"] },
      ]);
      setReasoningTrace([
        { step: 1, skill_addressed: "safety-compliance", gap_score: 100, course_selected: "Advanced Safety Compliance", reason: "Missing critical safety requirement.", confidence: 98 },
        { step: 2, skill_addressed: "team-leadership", gap_score: 75, course_selected: "Effective Team Leadership", reason: "Significant management gap.", confidence: 91 },
        { step: 3, skill_addressed: "supply-chain-management", gap_score: 100, course_selected: "Supply Chain Principles", reason: "Required core competency missing.", confidence: 95 },
        { step: 4, skill_addressed: "warehouse-management-systems", gap_score: 50, course_selected: "Modern WMS Software Tools", reason: "Needs upskilling from inventory management.", confidence: 85 },
        { step: 5, skill_addressed: "excel", gap_score: 40, course_selected: "Excel for Business Logic", reason: "Minor bump to reach required level.", confidence: 80 },
      ]);
      setMetrics({
        total_hours: 27,
        standard_hours: 80,
        time_saved_hours: 53,
        time_saved_percent: 66,
        readiness_improvement: 65,
        modules_count: 5
      });
    }
  };

  const value = {
    resumeSkills, setResumeSkills,
    jdSkills, setJdSkills,
    skillGaps, setSkillGaps,
    pathway, setPathway,
    reasoningTrace, setReasoningTrace,
    metrics, setMetrics,
    overallReadiness, setOverallReadiness,
    isLoading, setIsLoading,
    loadingStep, setLoadingStep,
    error, setError,
    activePersona, setActivePersona,
    resetAll,
    loadDemoPersona
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
