// moved outside ResumeManager to prevent re-definition on each render
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function EducationTab({ data, setData, setModalData }) {
  const list = Object.values(data.education);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Education</h2>
        <button onClick={() => setModalData({ type: 'education' })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />Add Degree
        </button>
      </div>
      {list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No education yet</div>
      ) : (
        <div className="space-y-3">
          {list.map(edu => (
            <div key={edu.id} className="border rounded-lg p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                  <p className="text-sm text-gray-500">{edu.location} • {edu.graduationDate}</p>
                  {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModalData({ type: 'education', item: edu })} className="text-blue-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => {
                    if (window.confirm('Delete?')) {
                      const newEd = { ...data.education };  // make copy of education
                      delete newEd[edu.id]; // delete corresponding entry in newEd in copy
                      setData({ ...data, education: newEd }); //  update data with new copy
                    }
                  }} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};