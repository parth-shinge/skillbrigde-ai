import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { File, UploadCloud, XCircle, CheckCircle } from 'lucide-react';
import { parseDocuments, analyzeGaps } from '../api/client';
import { useApp } from '../context/AppContext';
import { LoadingSteps } from './LoadingSteps';

export const UploadZone = () => {
  const navigate = useNavigate();
  const { 
    setResumeSkills, setJdSkills, setSkillGaps, setOverallReadiness,
    isLoading, setIsLoading, error, setError 
  } = useApp();

  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [jdInputMode, setJdInputMode] = useState('text');
  const [jdFile, setJdFile] = useState(null);
  const [localError, setLocalError] = useState(null);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setLocalError(null);
    if (fileRejections.length > 0) {
      setLocalError("Please upload a valid PDF under 5MB.");
      return;
    }
    if (acceptedFiles.length > 0) {
      setResumeFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1
  });

  const onJdDrop = useCallback((acceptedFiles, fileRejections) => {
    setLocalError(null);
    if (fileRejections.length > 0) {
      setLocalError("Please upload a valid PDF under 5MB.");
      return;
    }
    if (acceptedFiles.length > 0) {
      setJdFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps: getJdRootProps, getInputProps: getJdInputProps, isDragActive: isJdDragActive } = useDropzone({
    onDrop: onJdDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!resumeFile) return;
    if (jdInputMode === 'text' && !jdText.trim()) return;
    if (jdInputMode === 'pdf' && !jdFile) return;
    setLocalError(null);
    setIsLoading(true);

    try {
      // API call to parse documents
      const parseResponse = await parseDocuments(
        resumeFile, 
        jdInputMode === 'text' ? jdText : '', 
        jdInputMode === 'pdf' ? jdFile : null
      );
      setResumeSkills(parseResponse.resume_skills);
      setJdSkills(parseResponse.jd_skills);

      // API call to analyze gaps
      const analysisResponse = await analyzeGaps(parseResponse.resume_skills, parseResponse.jd_skills);
      setSkillGaps(analysisResponse.skill_gaps);
      setOverallReadiness(analysisResponse.overall_readiness_score);
      
      setIsLoading(false);
      navigate('/analyze');
    } catch (err) {
      setLocalError(err.message || "An error occurred during analysis.");
      setIsLoading(false);
    }
  };

  const isFormValid = resumeFile && (jdInputMode === 'text' ? jdText.trim().length > 10 : jdFile !== null);

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 md:p-10 shadow-2xl relative">
      {isLoading && <LoadingSteps />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Left: Resume Upload */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-[#F1F5F9] mb-3 font-['Outfit']">1. Upload Resume (PDF)</label>
          <div 
            {...getRootProps()} 
            className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors duration-200
              ${isDragActive ? 'border-[#06B6D4] bg-[#06B6D4]/5' : 
                resumeFile ? 'border-[#10B981] bg-[#10B981]/5' : 
                'border-[#334155] bg-[#0F172A] hover:border-[#06B6D4]/50'}`}
          >
            <input {...getInputProps()} />
            {resumeFile ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-[#10B981] mb-3" />
                <p className="text-[#F1F5F9] font-medium">{resumeFile.name}</p>
                <p className="text-sm text-[#94A3B8] mt-1">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                  className="mt-4 text-xs text-[#EF4444] hover:underline"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-[#94A3B8] mb-3" />
                <p className="text-[#F1F5F9] font-medium">Drop your Resume PDF here</p>
                <p className="text-sm text-[#94A3B8] mt-2">or click to browse from local</p>
                <p className="text-xs text-[#94A3B8] mt-2 mt-4 opacity-60">Max size 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: JD Input */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-[#F1F5F9] mb-3 font-['Outfit'] flex justify-between">
            <span>2. Provide Job Description</span>
          </label>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[#94A3B8] text-sm">Job Description as:</span>
            <button
              onClick={() => setJdInputMode('text')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                jdInputMode === 'text'
                  ? 'bg-[#06B6D4] text-white'
                  : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155]'
              }`}
            >
              📝 Paste Text
            </button>
            <button
              onClick={() => setJdInputMode('pdf')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                jdInputMode === 'pdf'
                  ? 'bg-[#06B6D4] text-white'
                  : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155]'
              }`}
            >
              📄 Upload PDF
            </button>
          </div>
          {jdInputMode === 'text' ? (
            <textarea 
              className="flex-1 min-h-[200px] bg-[#0F172A] border border-[#334155] rounded-xl p-4 text-[#F1F5F9] placeholder:text-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] resize-none transition-all"
              placeholder="Paste role requirements, duties, and skills here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          ) : (
            <div 
              {...getJdRootProps()} 
              className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors duration-200
                ${isJdDragActive ? 'border-[#06B6D4] bg-[#06B6D4]/5' : 
                  jdFile ? 'border-[#10B981] bg-[#10B981]/5' : 
                  'border-[#334155] bg-[#0F172A] hover:border-[#06B6D4]/50'}`}
            >
              <input {...getJdInputProps()} />
              {jdFile ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-[#10B981] mb-3" />
                  <p className="text-[#F1F5F9] font-medium">{jdFile.name}</p>
                  <p className="text-sm text-[#94A3B8] mt-1">{(jdFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setJdFile(null); }}
                    className="mt-4 text-xs text-[#EF4444] hover:underline"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-12 h-12 text-[#94A3B8] mb-3" />
                  <p className="text-[#F1F5F9] font-medium">Drop your JD PDF here</p>
                  <p className="text-sm text-[#94A3B8] mt-2">or click to browse from local</p>
                  <p className="text-xs text-[#94A3B8] mt-2 mt-4 opacity-60">Max size 5MB</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {localError && (
        <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-[#EF4444] mt-0.5" />
          <p className="text-[#EF4444] text-sm">{localError}</p>
        </div>
      )}

      {/* Bottom CTA */}
      <button
        onClick={handleAnalyze}
        disabled={!isFormValid || isLoading}
        className={`w-full py-5 rounded-xl text-lg font-bold font-['Outfit'] transition-all flex items-center justify-center gap-2
          ${isFormValid 
            ? 'bg-[#06B6D4] hover:bg-[#0891b2] text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]' 
            : 'bg-[#334155] text-[#94A3B8] cursor-not-allowed'}`}
      >
        Analyze My Profile →
      </button>
    </div>
  );
};
