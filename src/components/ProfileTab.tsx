// moved outside ResumeManager to prevent re-definition on each render
export default function ProfileTab({ data, setData }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Profile</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {['name', 'email', 'phone', 'location', 'linkedin', 'github', 'portfolio', 'website'].map(field => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize mb-1">
              {field}
            </label>
            <input
              value={data.profile[field]}
              onChange={(e) =>
                setData(prev => ({
                  ...prev,
                  profile: { ...prev.profile, [field]: e.target.value }
                }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Default Summary</label>
        <textarea
          value={data.profile.defaultSummary}
          onChange={(e) =>
            setData(prev => ({
              ...prev,
              profile: { ...prev.profile, defaultSummary: e.target.value }
            }))
          }
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>
    </div>
  );
};