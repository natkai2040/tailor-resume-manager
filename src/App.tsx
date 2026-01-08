import React, { useState, useEffect } from 'react';
import { Download, Upload, Save, Database, AlertCircle, CheckCircle } from 'lucide-react';
import ProfileTab from './components/ProfileTab';
import EducationTab from './components/EducationTab';
import LibrarySection from './components/LibrarySection';
import Modal from './components/Modal';
import { storage } from './utils/storage';

// Storage abstraction - works with both window.storage (Claude) and localStorage (GitHub Pages)

const createEmptyData = () => ({
  version: '1.2',
  lastModified: Date.now(),
  profile: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', website: '', defaultSummary: '' },
  education: {},
  jobs: {},
  projects: {},
  courses: {},
  resumes: {}
});

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

function ResumeManager() {
  const [data, setData] = useState(createEmptyData());
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [modalData, setModalData] = useState(null);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        saveDataSilent();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [data, isLoading]);

  const saveDataSilent = async () => {
    try {
      const dataToSave = { ...data, lastModified: Date.now() };
      await storage.set('resume-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const saveData = async () => {
    try {
      const dataToSave = { ...data, lastModified: Date.now() };
      await storage.set('resume-data', JSON.stringify(dataToSave));
      setStatus({ type: 'success', message: 'Saved successfully!' });
    } catch (error) {
      setStatus({ type: 'error', message: `Error: ${error.message}` });
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await storage.get('resume-data');
      if (result?.value) {
        setData(JSON.parse(result.value));
        setStatus({ type: 'success', message: 'Data loaded' });
      } else {
        setStatus({ type: 'info', message: 'No saved data. Starting fresh.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: `Error: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ type: 'success', message: 'Exported!' });
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (window.confirm('Merge with existing? (Cancel = replace all)')) {
          setData({
            ...imported,
            profile: { ...data.profile, ...imported.profile },
            jobs: { ...data.jobs, ...imported.jobs },
            projects: { ...data.projects, ...imported.projects },
            courses: { ...data.courses, ...imported.courses },
            education: { ...data.education, ...imported.education }
          });
        } else {
          setData(imported);
        }
        setStatus({ type: 'success', message: 'Imported!' });
      } catch (err) {
        setStatus({ type: 'error', message: 'Import failed' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Resume Manager - Prototype 2</h1>
          <p className="text-gray-600">Works with localStorage (GitHub Pages) and window.storage (Claude.ai)</p>
        </div>

        {status.message && (
          <div className={`rounded-lg p-4 mb-6 flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-800' : status.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
            {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={saveData} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"><Save className="w-4 h-4"/>Save</button>
            <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm"><Database className="w-4 h-4"/>Reload</button>
            <button onClick={exportJSON} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm"><Download className="w-4 h-4"/>Export</button>
            <label className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm cursor-pointer"><Upload className="w-4 h-4"/>Import<input type="file" accept=".json" onChange={importJSON} className="hidden"/></label>
          </div>
          <p className="text-xs text-gray-500">Auto-save enabled • Last: {new Date(data.lastModified).toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            {['profile', 'education', 'jobs', 'projects', 'courses'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>{tab}</button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'profile' && <ProfileTab data={data} setData={setData} />}
            {activeTab === 'education' && <EducationTab data={data} setData={setData} setModalData={setModalData} />}
            {activeTab === 'jobs' && <LibrarySection title="Work Experience" dataKey="jobs" itemType="job" data={data} setData={setData} setModalData={setModalData} />}
            {activeTab === 'projects' && <LibrarySection title="Projects" dataKey="projects" itemType="project" data={data} setData={setData} setModalData={setModalData} />}
            {activeTab === 'courses' && <LibrarySection title="Courses & Certifications" dataKey="courses" itemType="course" data={data} setData={setData} setModalData={setModalData} />}
          </div>
        </div>

        <Modal data={data} setData={setData} modalData={modalData} setModalData={setModalData} generateId={generateId} />
      </div>
    </div>
  );
}

export default ResumeManager;