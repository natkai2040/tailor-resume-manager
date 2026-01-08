// moved outside ResumeManager to prevent re-definition on each render
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function LibrarySection({ title, dataKey, itemType, data, setData, setModalData }) {
    const list = Object.values(data[dataKey]);
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={() => setModalData({ type: itemType })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />Add {itemType}
          </button>
        </div>
        {list.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No {dataKey} yet</div>
        ) : (
          <div className="space-y-3">
            {list.map(item => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title || item.name}</h3>
                    <p className="text-gray-700">{item.company || item.institution || item.context}</p>
                    <p className="text-sm text-gray-500">
                      {item.location && `${item.location} • `}
                      {item.startDate && `${item.startDate} - ${item.endDate || 'Present'}`}
                      {item.date || item.completionDate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModalData({ type: itemType, item })} className="text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => {
                      if (window.confirm('Delete?')) {
                        const newData = { ...data[dataKey] };
                        delete newData[item.id];
                        setData({ ...data, [dataKey]: newData });
                      }
                    }} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Descriptions ({item.descriptions?.length || 0})</p>
                    <button onClick={() => setModalData({ type: 'description', parentType: dataKey, parentId: item.id })} className="text-xs text-blue-600">+ Add</button>
                  </div>
                  {(item.descriptions || []).map(desc => (
                    <div key={desc.id} className="flex justify-between bg-white p-2 rounded mb-1">
                      <p className="text-sm flex-1">{desc.text}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setModalData({ type: 'description', parentType: dataKey, parentId: item.id, description: desc })} className="text-blue-600"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => {
                          if (window.confirm('Delete?')) {
                            const updated = { ...item, descriptions: item.descriptions.filter(d => d.id !== desc.id) };
                            setData({ ...data, [dataKey]: { ...data[dataKey], [item.id]: updated } });
                          }
                        }} className="text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
};