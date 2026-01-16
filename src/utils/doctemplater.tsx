import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

export const generateDocx = async (constructedResume) => {
    try {
        let resumeData = transformForTemplate(constructedResume);
        console.log('Loaded resume data:', resumeData)        

        // Fetch template in public folder
        const templateResponse = await fetch(`${import.meta.env.BASE_URL}input.docx`);
        if (!templateResponse.ok) {
        throw new Error("Failed to load DOCX template");
        }
        const templateArrayBuffer = await templateResponse.arrayBuffer();

        // Load template into PizZip
        const zip = new PizZip(templateArrayBuffer);

        // Create docxtemplater instance
        const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        });

        // Render with data
        doc.render(resumeData);

        // Generate blob
        const blob = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        // Download
        saveAs(blob, `${resumeData.name || 'resume'}.docx`);
        return { success: true };
    } catch (error) {
        console.error("DOCX generation error:", error);
        return { success: false, error: error.message };
    }
};

function formatDate(input) {
    if (!input) return '';
    if (input.toLowerCase() === 'present') return 'Present';
    
    const date = new Date(input + "-01"); 

    const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
    });

    const formattedDate = formatter.format(date);
    console.log(formattedDate); // "May 2025"
    return formattedDate;
}


// Helper function to transform data
const transformForTemplate = (constructedResume) => {
    const profile = constructedResume.profile || {};
    
    return {
        name: profile.name || '',
        email: profile.email || '',
        linkedin: profile.linkedin || '',
        web: profile.website || profile.portfolio || '',
        hasSummary: !!profile.defaultSummary,
        summary: profile.defaultSummary || '',
        
        education: (constructedResume.education || []).map(edu => ({
            schoolName: edu.institution || '',
            location: edu.location || '',
            degree: edu.degree || '',
            hasHonors: !!edu.honors,
            honors: edu.honors || '',
            major: edu.major || '',
            gpa: edu.gpa || '',
            date: formatDate(edu.graduationDate) || ''
        })),
        
        hasCoursework: Array.isArray(constructedResume.courses) && constructedResume.courses.length > 0,
        courses: (constructedResume.courses || []).map(c => c.name || ''),

        skills: (constructedResume.skills || []).map(skill => ({
            section: skill.name || '', // fix to rename
            items: (skill.descriptions || []).map(d => d.text || '').filter(Boolean) // fix to rename
        })),
        
        experience: (constructedResume.jobs || []).map(job => ({
            title: job.company || '',
            position: job.title || '',
            date: `${formatDate(job.startDate) || ''} - ${formatDate(job.endDate) || 'Present'}`,
            location: job.location || '',
            descriptions: (job.descriptions || []).map(d => d.text || '').filter(Boolean)
        })),
        
        projects: (constructedResume.projects || []).map(proj => ({
            title: proj.name || '',
            date: formatDate(proj.date) || '',
            descriptions: (proj.descriptions || []).map(d => d.text || '').filter(Boolean)
        }))
    };
};