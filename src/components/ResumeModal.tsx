import { X } from 'lucide-react';
import { useState } from 'react';

export const ResumeModal = ({ data, setData, modalData, setModalData, generateId }) => {
    console.log('=== ResumeModal Debug ===');
    console.log('modalData:', modalData);
    console.log('modalData.item:', modalData.item);
    console.log('data.education:', data.education);
    console.log('data.skills:', data.skills);
    
    
    console.log('ResumeModal modalData:', modalData);
    
    // CHANGED: Remove sections wrapper
    const [form, setForm] = useState(modalData.item || {
        name: '',
        targetRole: '',
        created: new Date().toISOString().split('T')[0],
        modified: new Date().toISOString().split('T')[0],
        education: [],
        jobs: [],
        projects: [],
        courses: [],
        skills: []
    });

    const toggleItem = (section, itemId, hasDescriptions = false) => {
        // CHANGED: Access form[section] directly instead of form.sections[section]
        const items = form[section] || [];
        const idKey = `${section.slice(0, -1)}Id`;
        const exists = items.find(item => item[idKey] === itemId);
        
        if (exists) {
            setForm({
                ...form,
                [section]: items.filter(item => item[idKey] !== itemId)
            });
        } else {
            const newItem = hasDescriptions 
                ? { [idKey]: itemId, descriptionIds: [] }
                : { [idKey]: itemId };
            setForm({
                ...form,
                [section]: [...items, newItem]
            });
        }
    };

    const toggleDesc = (section, itemId, descId) => {
        // CHANGED: Access form[section] directly
        const items = form[section] || [];
        const idKey = `${section.slice(0, -1)}Id`;
        
        setForm({
            ...form,
            [section]: items.map(item => {
                if (item[idKey] === itemId) {
                    const descIds = item.descriptionIds || [];
                    return {
                        ...item,
                        descriptionIds: descIds.includes(descId)
                            ? descIds.filter(id => id !== descId)
                            : [...descIds, descId]
                    };
                }
                return item;
            })
        });
    };

    const isSelected = (section, itemId) => {
        const idKey = `${section.slice(0, -1)}Id`;
        // CHANGED: Access form[section] directly
        return form[section]?.find(item => item[idKey] === itemId);
    };

    const handleSave = () => {
        // Validation
        if (!form.name) {
            alert('Resume name is required');
            return;
        }

        // Generate ID if new resume
        const resumeId = form.id || generateId('resume');
        const resumeData = {
            ...form,
            id: resumeId,
            modified: new Date().toISOString().split('T')[0]
        };

        // Save to data
        setData({
            ...data,
            resumes: {
                ...data.resumes,
                [resumeId]: resumeData
            }
        });

        setModalData(null);
    };

    return (
        <div className="fixed inset-0 bg-gray-700/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{form.id ? 'Edit' : 'Create'} Resume</h2>
                    <button onClick={() => setModalData(null)}><X className="w-5 h-5" /></button>
                </div>

                {/* Basic Info */}
                <div className="space-y-3 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Resume Name *</label>
                        <input
                            placeholder="e.g., Software Engineer - Backend"
                            value={form.name || ''}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Target Role</label>
                        <input
                            placeholder="e.g., Senior Backend Engineer"
                            value={form.targetRole || ''}
                            onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>

                {/* Education */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Education</h3>
                    {Object.values(data.education).length === 0 ? (
                        <p className="text-gray-500 text-sm">No education in library</p>
                    ) : (
                        Object.values(data.education).map(edu => (
                            <label key={edu.id} className="flex gap-2 p-2 border rounded mb-2 cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={!!isSelected('education', edu.id)}
                                    onChange={() => toggleItem('education', edu.id)}
                                />
                                <div className="text-sm">
                                    <div className="font-medium">{edu.degree}</div>
                                    <div className="text-gray-600">{edu.institution}</div>
                                </div>
                            </label>
                        ))
                    )}
                </div>

                {/* Jobs */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Jobs</h3>
                    {Object.values(data.jobs).length === 0 ? (
                        <p className="text-gray-500 text-sm">No jobs in library</p>
                    ) : (
                        Object.values(data.jobs).map(job => {
                            const selected = isSelected('jobs', job.id);
                            return (
                                <div key={job.id} className="border rounded mb-2 p-3">
                                    <label className="flex gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!selected}
                                            onChange={() => toggleItem('jobs', job.id, true)}
                                        />
                                        <div className="text-sm flex-1">
                                            <div className="font-medium">{job.title} - {job.company}</div>
                                        </div>
                                    </label>
                                    {selected && job.descriptions?.length > 0 && (
                                        <div className="ml-6 mt-2 space-y-1">
                                            <p className="text-xs text-gray-500">Select descriptions:</p>
                                            {job.descriptions.map(desc => (
                                                <label key={desc.id} className="flex gap-2 text-xs cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.descriptionIds?.includes(desc.id)}
                                                        onChange={() => toggleDesc('jobs', job.id, desc.id)}
                                                    />
                                                    <span className="text-gray-700">{desc.text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Projects */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Projects</h3>
                    {Object.values(data.projects).length === 0 ? (
                        <p className="text-gray-500 text-sm">No projects in library</p>
                    ) : (
                        Object.values(data.projects).map(proj => {
                            const selected = isSelected('projects', proj.id);
                            return (
                                <div key={proj.id} className="border rounded mb-2 p-3">
                                    <label className="flex gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!selected}
                                            onChange={() => toggleItem('projects', proj.id, true)}
                                        />
                                        <div className="text-sm flex-1">
                                            <div className="font-medium">{proj.name}</div>
                                        </div>
                                    </label>
                                    {selected && proj.descriptions?.length > 0 && (
                                        <div className="ml-6 mt-2 space-y-1">
                                            <p className="text-xs text-gray-500">Select descriptions:</p>
                                            {proj.descriptions.map(desc => (
                                                <label key={desc.id} className="flex gap-2 text-xs cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.descriptionIds?.includes(desc.id)}
                                                        onChange={() => toggleDesc('projects', proj.id, desc.id)}
                                                    />
                                                    <span className="text-gray-700">{desc.text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Courses */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Courses</h3>
                    {Object.values(data.courses).length === 0 ? (
                        <p className="text-gray-500 text-sm">No courses in library</p>
                    ) : (
                        Object.values(data.courses).map(course => (
                            <label key={course.id} className="flex gap-2 p-2 border rounded mb-2 cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={!!isSelected('courses', course.id)}
                                    onChange={() => toggleItem('courses', course.id)}
                                />
                                <div className="text-sm">
                                    <div className="font-medium">{course.name}</div>
                                    <div className="text-gray-600">{course.institution}</div>
                                </div>
                            </label>
                        ))
                    )}
                </div>

                {/* Skills - NEW SECTION */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Skills</h3>
                    {Object.values(data.skills).length === 0 ? (
                        <p className="text-gray-500 text-sm">No skills in library</p>
                    ) : (
                        Object.values(data.skills).map(skill => {
                            const selected = isSelected('skills', skill.id);
                            return (
                                <div key={skill.id} className="border rounded mb-2 p-3">
                                    <label className="flex gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!selected}
                                            onChange={() => toggleItem('skills', skill.id, true)}
                                        />
                                        <div className="text-sm flex-1">
                                            <div className="font-medium">{skill.name}</div>
                                        </div>
                                    </label>
                                    {selected && skill.descriptions?.length > 0 && (
                                        <div className="ml-6 mt-2 space-y-1">
                                            <p className="text-xs text-gray-500">Select skill items:</p>
                                            {skill.descriptions.map(desc => (
                                                <label key={desc.id} className="flex gap-2 text-xs cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.descriptionIds?.includes(desc.id)}
                                                        onChange={() => toggleDesc('skills', skill.id, desc.id)}
                                                    />
                                                    <span className="text-gray-700">{desc.text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button onClick={() => setModalData(null)} className="px-4 py-2 border rounded-lg">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {form.id ? 'Update' : 'Create'} Resume
                    </button>
                </div>
            </div>
        </div>
    );
};