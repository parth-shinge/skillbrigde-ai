import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL,
});

client.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

client.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const parseDocuments = async (resumeFile, jobDescriptionText, jdFile = null) => {
  const formData = new FormData();
  if (resumeFile) formData.append('resume_file', resumeFile);
  if (jobDescriptionText) formData.append('job_description', jobDescriptionText);
  if (jdFile) formData.append('jd_file', jdFile);

  const { data } = await client.post('/api/parse', formData);
  return data;
};

export const analyzeGaps = async (resumeSkills, jdSkills) => {
  const { data } = await client.post('/api/analyze', {
    resume_skills: resumeSkills,
    jd_skills: jdSkills,
  });
  return data;
};

export const generatePathway = async (skillGaps, roleTitle, jobCategory) => {
  const { data } = await client.post('/api/pathway', {
    skill_gaps: skillGaps,
    role_title: roleTitle,
    job_category: jobCategory,
  });
  return data;
};

export const checkHealth = async () => {
  const { data } = await client.get('/health');
  return data;
};

export default client;
