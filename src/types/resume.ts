// src/types/resume.ts
export interface ResumeData {
    personalInfo: {
        fullName: string
        phone: string
        email: string
        linkedin: string
        github: string
    }
    education: {
        degree: string
        college: string
        startDate: string
        endDate: string
        cgpa: string
    }[]
    projects: {
        title: string
        link: string
        date: string
        points: string[]
    }[]
    achievements: string[]
    skills: {
        category: string
        items: string
    }[]
    coCurricular: {
        title: string
        role: string
        date: string
        points: string[]
    }[]
    sectionOrder: string[]
}

export const initialResumeData: ResumeData = {
    personalInfo: {
        fullName: 'John Doe',
        phone: '+91 922xxxxxx',
        email: 'myemail@gmail.com',
        linkedin: 'www.linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
    },
    education: [
        {
            degree: 'Bachelor of Technology in Information Technology',
            college: 'Mumbai University | Mumbai',
            startDate: 'Aug 2023',
            endDate: 'Aug 2027',
            cgpa: '8.55',
        },
    ],
    projects: [
        {
            title: 'Project Title',
            link: 'https://github.com/johndoe/project-title',
            date: 'September 2025',
            points: [
                'Developed an e-commerce web application backend using Spring Boot...',
                'point 2',
            ],
        },
    ],
    achievements: [
        'Achievement 1',
    ],
    skills: [
        { category: 'Technical Skills', items: 'Java, C, JavaScript, RESTful APIs, Python' },
    ],
    coCurricular: [
        {
            title: 'Club Name',
            role: 'Role',
            date: '2025',
            points: ['Assisted in planning, coordination and execution...'],
        },
    ],
    sectionOrder: ['education', 'projects', 'skills', 'achievements', 'coCurricular'],
}
