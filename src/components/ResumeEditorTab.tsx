// moved outside ResumeManager to prevent re-definition on each render
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { generateDocx } from '../utils/doctemplater';
//resumes: { resume-1: {...}, resume-2: {...} }
// desc-1767855762120-w95a32se7

export default function ResumeEditorTab({ data, setData, setModalData }) {
  const [constructedResumes, setConstructuredResumes] = useState({});

  const constructResume = (resume) => {
    // Validate resume exists
    if (!resume) {
      console.error('constructResume: resume is null/undefined');
      return null;
    }

    let constructedResume = {};
    
    // Handle basic fields with defaults
    constructedResume['open'] = true; // default to open

    constructedResume['id'] = resume.id || generateId('resume');
    constructedResume['name'] = resume.name || 'Untitled Resume';
    constructedResume['targetRole'] = resume.targetRole || '';
    constructedResume['created'] = resume.created || new Date().toISOString();
    constructedResume['modified'] = resume.modified || new Date().toISOString();

    // PROFILE SECTION
    const profileCopy = { ...data.profile };
    if (resume.header && typeof resume.header === 'object') {
      Object.assign(profileCopy, resume.header);
    }
    
    // Clean up links - remove if not selected
    if (profileCopy.links && typeof profileCopy.links === 'object') {
      Object.entries(profileCopy.links).forEach(([key, value]) => {
        if (!value) {
          delete profileCopy[key];
        }
      });
      delete profileCopy.links; // Remove the links object itself after processing
    }
    
    constructedResume['profile'] = profileCopy;

    // EDUCATION SECTION
    const educationArr = (resume.education || [])
      .map(obj => {
        if (!obj || !obj.educationId) {
          console.warn('Invalid education entry:', obj);
          return null;
        }
        
        const eduData = getSectionFromId('education', obj.educationId);
        if (!eduData) {
          console.warn(`Education not found: ${obj.educationId}`);
          return null;
        }
        
        return { ...eduData };
      })
      .filter(Boolean); // Remove null entries
    
    constructedResume['education'] = educationArr;

    // JOBS SECTION
    const jobsArr = (resume.jobs || [])
      .map(obj => {
        if (!obj || !obj.jobId) {
          console.warn('Invalid job entry:', obj);
          return null;
        }
        
        const jobData = getSectionFromId('job', obj.jobId);
        if (!jobData) {
          console.warn(`Job not found: ${obj.jobId}`);
          return null;
        }
        
        // Handle descriptions
        let descriptions = [];
        if (obj.descriptionIds && Array.isArray(obj.descriptionIds)) {
          descriptions = obj.descriptionIds
            .map(descId => {
              const desc = (jobData.descriptions || []).find(d => d.id === descId);
              if (!desc) {
                console.warn(`Description not found for job ${obj.jobId}: ${descId}`);
              }
              return desc;
            })
            .filter(Boolean); // Remove undefined descriptions
        }
        
        // If no descriptions found, use empty array or first available
        if (descriptions.length === 0 && jobData.descriptions && jobData.descriptions.length > 0) {
          console.warn(`No valid descriptions for job ${obj.jobId}, using first available`);
          descriptions = [jobData.descriptions[0]];
        }
        
        return { ...jobData, descriptions };
      })
      .filter(Boolean);
    
    constructedResume['jobs'] = jobsArr;

    // PROJECTS SECTION
    const projectsArr = (resume.projects || [])
      .map(obj => {
        if (!obj || !obj.projectId) {
          console.warn('Invalid project entry:', obj);
          return null;
        }
        
        const projectData = getSectionFromId('project', obj.projectId);
        if (!projectData) {
          console.warn(`Project not found: ${obj.projectId}`);
          return null;
        }
        
        // Handle descriptions (same logic as jobs)
        let descriptions = [];
        if (obj.descriptionIds && Array.isArray(obj.descriptionIds)) {
          descriptions = obj.descriptionIds
            .map(descId => {
              const desc = (projectData.descriptions || []).find(d => d.id === descId);
              if (!desc) {
                console.warn(`Description not found for project ${obj.projectId}: ${descId}`);
              }
              return desc;
            })
            .filter(Boolean);
        }
        
        if (descriptions.length === 0 && projectData.descriptions && projectData.descriptions.length > 0) {
          console.warn(`No valid descriptions for project ${obj.projectId}, using first available`);
          descriptions = [projectData.descriptions[0]];
        }
        
        return { ...projectData, descriptions };
      })
      .filter(Boolean);
    
    constructedResume['projects'] = projectsArr;


  // SKILL SECTION

    const skillsArr = (resume.skills || [])
      .map(obj => {
        if (!obj || !obj.skillSectionId) {
          console.warn('Invalid skill entry:', obj);
          return null;
        }
        const skillSectionData = getSectionFromId('skillSection', obj.skillSectionId);
        if (!skillSectionData) {
          console.warn(`Skill section not found: ${obj.skillSectionId}`);
          return null;
        }
        // Handle descriptions (same logic as jobs)
        let descriptions = [];
        if (obj.descriptionIds && Array.isArray(obj.descriptionIds)) {
          descriptions = obj.descriptionIds
            .map(descId => {
              const desc = (skillSectionData.descriptions || []).find(d => d.id === descId);
              if (!desc) {
                console.warn(`Description not found for skill section ${obj.skillSectionId}: ${descId}`);
              }
              return desc;
            })
            .filter(Boolean);
        }

        if (descriptions.length === 0 && skillSectionData.descriptions && skillSectionData.descriptions.length > 0) {
          console.warn(`No valid descriptions for skill section ${obj.skillSectionId}, using first available`);
          descriptions = [skillSectionData.descriptions[0]];
        }

        return { ...skillSectionData, descriptions };
      })
      .filter(Boolean);
    
    constructedResume['skills'] = skillsArr;

    // COURSES SECTION
    const coursesArr = (resume.courses || [])
      .map(obj => {
        if (!obj || !obj.courseId) {
          console.warn('Invalid course entry:', obj);
          return null;
        }
        
        const courseData = getSectionFromId('course', obj.courseId);
        if (!courseData) {
          console.warn(`Course not found: ${obj.courseId}`);
          return null;
        }
        
        // Handle course descriptions if they have them
        let descriptions = [];
        if (obj.descriptionIds && Array.isArray(obj.descriptionIds)) {
          descriptions = obj.descriptionIds
            .map(descId => {
              const desc = (courseData.descriptions || []).find(d => d.id === descId);
              if (!desc) {
                console.warn(`Description not found for course ${obj.courseId}: ${descId}`);
              }
              return desc;
            })
            .filter(Boolean);
        }
        
        return { ...courseData, descriptions };
      })
      .filter(Boolean);
    
    constructedResume['courses'] = coursesArr;

    // Log summary
    console.log('Constructed resume:', {
      name: constructedResume.name,
      education: constructedResume.education.length,
      jobs: constructedResume.jobs.length,
      projects: constructedResume.projects.length,
      courses: constructedResume.courses.length
    });

    return constructedResume;
  };

  // Helper function improvement
  const getSectionFromId = (sectionType, id) => {
    if (!id) return null;
    
    const dataKey = sectionType === 'job' ? 'jobs' : 
                    sectionType === 'project' ? 'projects' : 
                    sectionType === 'course' ? 'courses' : 
                    sectionType === 'skillSection' ? 'skills' :
                    sectionType === 'education' ? 'education' : null;
    
    if (!dataKey || !data[dataKey]) {
      console.error(`Invalid section type: ${sectionType}`);
      return null;
    }
    
    const item = data[dataKey][id];
    if (!item) {
      console.error(`Item not found in ${dataKey}: ${id}`);
      return null;
    }
    
    return item;
  };

  useEffect(() => { // construct resumes when list changes
    Object.values(data.resumes).forEach(resume => {
      const constructed = constructResume(resume);
      console.log('CONSTRUCTED RESUME:', constructed);
      setConstructuredResumes(prev => ({ ...prev, [resume.id]: constructed }));
    })
  }, [data]);

  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resumes</h2>
        <button onClick={() => setModalData({ type: 'resume'})} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />Add Resume
        </button>
      </div>
      {Object.keys(constructedResumes).length === 0 ? (
        <div className="text-center py-12 text-gray-500">No resumes yet</div>
      ) : (
        <div className="space-y-3">
          {Object.values(constructedResumes).map(res => {
            if (!res || !res.id) {
              console.warn('Invalid resume object:', res);
              return null;
            }
            return (
              <div key={res.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                    {/* METADATA */}
                    <div>
                      <div className="mb-2">
                          <p className="font-semibold">{res.name || 'Untitled Resume'}</p>
                          {res.targetRole && <p>Target Role: {res.targetRole}</p>}
                          <p className="text-sm text-gray-500">
                            Created {res.created || 'Unknown'} • Modified {res.modified || 'Unknown'}
                          </p>
                      </div>
                    </div>
                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={generateDocx.bind(null, res)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <FileText className="w-4 h-4" />
                        Export as Docx
                      </button>
                      <button 
                        onClick={() => setModalData({ type: 'resume', item: data.resumes[res.id] })} 
                        className="text-blue-600"
                        aria-label="Edit resume"
                      >
                        <Edit2 className="w-4 h-8" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Delete "${res.name}"?`)) {
                            const newResumes = { ...data.resumes };
                            delete newResumes[res.id];
                            setData({ ...data, resumes: newResumes });
                          }
                        }} 
                        className="text-red-600"
                        aria-label="Delete resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                </div>
                {
                  !res.open? (
                    <button 
                      onClick={() => {
                        setConstructuredResumes(prev => ({
                          ...prev,
                          [res.id]: { ...res, open: true }
                        }));
                      }}
                      className="w-full flex justify-center text-gray-600 mb-2 outline-1 outline-gray-400 rounded-sm hover:bg-gray-200"
                      aria-label="Expand Resume"
                    ><ChevronDown className="w-8 h-8"/></button>
                  ) : (
                    <button 
                      onClick={() => {
                        setConstructuredResumes(prev => ({
                          ...prev,
                          [res.id]: { ...res, open: false }
                        }));
                      }}
                      className="w-full flex justify-center text-gray-600 mb-2 outline-1 outline-gray-400 rounded-sm hover:bg-gray-200"
                      aria-label="Collapse Resume"
                    ><ChevronUp className="w-8 h-8"/></button>
                  )
                }
                {/* RESUME DISPLAY */}
                {
                  !res.open? (
                    <></>
                  ): (
                    <div className="font-serif outline-1 outline-gray-300 rounded-lg p-4 mt-2 bg-gray-50">
                        {/* PROFILE HEADER */}
                        {res.profile && (
                          <>
                            <p className="font-semibold">{res.profile.name || 'No name'}</p> 
                            <p>
                              {[
                                res.profile.email && `Email: ${res.profile.email}`,
                                res.profile.phone && `Phone: ${res.profile.phone}`,
                                res.profile.github && `GitHub: ${res.profile.github}`,
                                res.profile.linkedin && `LinkedIn: ${res.profile.linkedin}`,
                                res.profile.portfolio && `Portfolio: ${res.profile.portfolio}`,
                                res.profile.website && `Website: ${res.profile.website}`,
                              ].filter(Boolean).join(' • ')}
                            </p>
                            {res.profile.defaultSummary && (
                              <p className="mt-2">{res.profile.defaultSummary}</p>
                            )}
                          </>
                        )}

                        {/* EDUCATION SECTION */}
                        <h4 className="font-semibold">EDUCATION</h4>
                        <hr className="my-1" />
                        
                        {Array.isArray(res.education) && res.education.length > 0 ? (
                          res.education.map(edu => {
                            if (!edu || !edu.id) return null;
                            
                            return (
                              <div key={edu.id} className="mb-2">
                                <p className="font-semibold">
                                  {edu.institution || 'Unknown Institution'}
                                  {edu.location && `, ${edu.location}`}
                                </p>
                                <p>
                                  {edu.degree || 'Degree not specified'}
                                  {edu.major && `, ${edu.major}`}
                                  {edu.gpa && `, GPA: ${edu.gpa}`}
                                  {edu.graduationDate && `, ${edu.graduationDate}`}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-400 text-sm mb-2">No education listed</p>
                        )}

                        {/* COURSEWORK */}
                        {Array.isArray(res.courses) && res.courses.length > 0 && (
                          <p className="mb-2">
                            <span className="font-semibold">Coursework: </span>
                            {res.courses.map(course => course?.name).filter(Boolean).join(', ')}
                          </p>
                        )}

                        {/* SKILLS SECTION */}
                        <hr className="my-1" />
                        <h4 className="font-semibold">SKILLS</h4>

                        {Array.isArray(res.jobs) && res.skills.length > 0 ? (
                          res.skills.map(skill => {
                            if (!skill || !skill.id) return null;
                            
                            return (
                              <div key={skill.id} className="mb-2">
                                <span className="font-semibold">{skill.name || 'Skill not specified'}:</span>
                                <span> {Array.isArray(skill.descriptions) && skill.descriptions.length > 0 && (
                                  skill.descriptions.map(skillpoint => skillpoint?.text).filter(Boolean).join(', ')
                                )}</span>  
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-400 text-sm">No skills listed</p>
                        )}

                        {/* EXPERIENCE SECTION */}
                        <hr className="my-1" />
                        <h4 className="font-semibold">EXPERIENCE</h4>
                        
                        {Array.isArray(res.jobs) && res.jobs.length > 0 ? (
                          res.jobs.map(job => {
                            if (!job || !job.id) return null;
                            
                            return (
                              <div key={job.id} className="mb-2">
                                <p className="font-semibold">
                                  {job.company || 'Company not specified'}
                                  {(job.startDate || job.endDate) && (
                                    <>, {job.startDate || '?'} - {job.endDate || 'Present'}</>
                                  )}
                                </p>
                                <p className="italic">
                                  {job.title || 'Position not specified'}
                                  {job.location && `, ${job.location}`}
                                </p>
                                
                                {Array.isArray(job.descriptions) && job.descriptions.length > 0 && (
                                  <ul className="list-disc list-inside">
                                    {job.descriptions.map(desc => {
                                      if (!desc || !desc.text) return null;
                                      return (
                                        <li key={desc.id || Math.random()}>
                                          {desc.text}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-400 text-sm">No experience listed</p>
                        )}

                        {/* PROJECTS SECTION */}
                        <hr className="my-1" />
                        <h4 className="font-semibold">PROJECTS</h4>
                        
                        {Array.isArray(res.projects) && res.projects.length > 0 ? (
                          res.projects.map(project => {
                            if (!project || !project.id) return null;
                            
                            return (
                              <div key={project.id} className="mb-2">
                                <p className="font-semibold">
                                  {project.name || 'Project name not specified'}
                                  {project.date && `, ${project.date}`}
                                </p>
                                
                                {Array.isArray(project.descriptions) && project.descriptions.length > 0 && (
                                  <ul className="list-disc list-inside">
                                    {project.descriptions.map(desc => {
                                      if (!desc || !desc.text) return null;
                                      return (
                                        <li key={desc.id || Math.random()}>
                                          {desc.text}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-400 text-sm">No projects listed</p>
                        )}
                    </div>
                  )
                }

              </div>
            );
          }).filter(Boolean)} {/* Remove any null returns */}
        </div>
      )}
    </div>
  );
};