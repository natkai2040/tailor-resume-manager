import { useEffect, useState } from "react";
import { X } from 'lucide-react';

// job, project, course, education, (sub)description modal
export default function Modal({ data, setData, modalData, setModalData, generateId }) {
    const [form, setForm] = useState({});

    useEffect(() => {
      if (modalData) {
        setForm(modalData.item || modalData.description || {});
      }
    }, [modalData]);

    if (!modalData) return null;

    const handleSave = () => {
      if (modalData.type === 'education') {
        const id = form.id || generateId('edu'); 
        setData({ ...data, education: { ...data.education, [id]: { ...form, id } } });
      } else if (modalData.type === 'description') {
        const parentItem = data[modalData.parentType][modalData.parentId];
        const descId = form.id || generateId('desc');
        const newDesc = { ...form, id: descId, tags: [], usedIn: [] };
        const descriptions = form.id ? parentItem.descriptions.map(d => d.id === descId ? newDesc : d) : [...(parentItem.descriptions || []), newDesc];
        setData({ ...data, [modalData.parentType]: { ...data[modalData.parentType], [modalData.parentId]: { ...parentItem, descriptions } } });
      } else {
        const dataKey = modalData.type === 'job' ? 'jobs' : modalData.type === 'project' ? 'projects' : modalData.type === 'course' ? 'courses' : modalData.type === 'resume' ? 'resumes' : 'skills';
        const id = form.id || generateId(modalData.type);
        setData({ ...data, [dataKey]: { ...data[dataKey], [id]: { ...form, id, descriptions: form.descriptions || [] } } });
      }
      setModalData(null);
    };

    const fields = modalData.type === 'education' ? 
      [{ name: 'degree', label: 'Degree', required: true }, { name: 'institution', label: 'Institution', required: true }, { name: 'major', label: 'Major', required: true }, { name: 'location' }, { name: 'graduationDate', type: 'month' }, { name: 'gpa' }, { name: 'honors' }] :
      modalData.type === 'job' ?
      [{ name: 'title', required: true }, { name: 'company', required: true }, { name: 'location' }, { name: 'startDate', type: 'month' }, { name: 'endDate', type: 'month' }] :
      modalData.type === 'project' ?
      [{ name: 'name', required: true }, { name: 'context' }, { name: 'date', type: 'month'}, { name: 'link' }] :
      modalData.type === 'course' ?
      [{ name: 'name', required: true }, { name: 'institution' }, { name: 'instructor' }, { name: 'completionDate', type: 'month' }, { name: 'credentialId' }, { name: 'credentialUrl' }] :
      modalData.type === 'skillSection' ?
      [{ name: 'name', required: true }] :
      [{ name: 'text', label: 'Description', multiline: true, required: true }];

    return (
      <div className="fixed inset-0 bg-gray-700/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{form.id ? 'Edit' : 'Add'} {modalData.type}</h2>
            <button onClick={() => setModalData(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1 capitalize">{field.label || field.name}{field.required && ' *'}</label>
                {field.multiline ? (
                  <textarea value={form[field.name] || ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows="4" />
                ) : (
                  <input type={field.type || 'text'} value={form[field.name] || ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setModalData(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </div>
      </div>
    );
  };