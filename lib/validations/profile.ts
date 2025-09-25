import { z } from 'zod'

// Common validation rules
const nameSchema = z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')

const skillsSchema = z
    .array(z.string())
    .min(1, 'Please select at least one skill')
    .max(20, 'Maximum 20 skills allowed')

const specializationsSchema = z
    .array(z.string())
    .min(1, 'Please select at least one specialization')
    .max(10, 'Maximum 10 specializations allowed')

// Student profile validation schema
export const studentProfileSchema = z.object({
    name: nameSchema,
    skills: skillsSchema,
    interests: z
        .array(z.string())
        .min(1, 'Please select at least one interest')
        .max(15, 'Maximum 15 interests allowed'),
    preferredSpecializations: specializationsSchema,
    currentYear: z
        .number()
        .min(1, 'Year must be between 1 and 6')
        .max(6, 'Year must be between 1 and 6')
        .optional()
        .nullable(),
    gpa: z
        .number()
        .min(0, 'GPA must be between 0.00 and 5.00')
        .max(5, 'GPA must be between 0.00 and 5.00')
        .optional()
        .nullable(),
    bio: z
        .string()
        .max(500, 'Bio must be less than 500 characters')
        .optional(),
    profilePicture: z
        .string()
        .url('Please provide a valid image URL')
        .optional()
        .nullable(),
})

// Supervisor profile validation schema
export const supervisorProfileSchema = z.object({
    name: nameSchema,
    title: z
        .string()
        .min(1, 'Title is required')
        .max(100, 'Title must be less than 100 characters'),
    department: z
        .string()
        .min(1, 'Department is required')
        .max(100, 'Department must be less than 100 characters'),
    specializations: specializationsSchema,
    researchInterests: z
        .array(z.string())
        .min(1, 'Please select at least one research interest')
        .max(15, 'Maximum 15 research interests allowed'),
    bio: z
        .string()
        .max(1000, 'Bio must be less than 1000 characters')
        .optional(),
    profilePicture: z
        .string()
        .url('Please provide a valid image URL')
        .optional()
        .nullable(),
    contactEmail: z
        .string()
        .email('Please enter a valid email address')
        .optional()
        .nullable(),
    officeLocation: z
        .string()
        .max(200, 'Office location must be less than 200 characters')
        .optional()
        .nullable(),
    maxStudents: z
        .number()
        .min(1, 'Maximum students must be at least 1')
        .max(20, 'Maximum students cannot exceed 20')
        .default(5),
    isAvailable: z.boolean().default(true),
})

// Profile picture upload schema
export const profilePictureSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
        .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
            'Only JPEG, PNG, and WebP images are allowed'
        ),
})

// Password change schema
export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

// Type exports
export type StudentProfileFormData = z.infer<typeof studentProfileSchema>
export type SupervisorProfileFormData = z.infer<typeof supervisorProfileSchema>
export type ProfilePictureFormData = z.infer<typeof profilePictureSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// Predefined options for form dropdowns
export const COMPUTER_SCIENCE_SKILLS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js',
    'HTML/CSS', 'Tailwind CSS', 'Bootstrap', 'SASS/SCSS',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
    'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
    'Machine Learning', 'Deep Learning', 'Data Science', 'AI',
    'Mobile Development', 'iOS Development', 'Android Development', 'React Native', 'Flutter',
    'DevOps', 'CI/CD', 'Testing', 'Unit Testing', 'Integration Testing',
    'Algorithms', 'Data Structures', 'System Design', 'Database Design',
    'Cybersecurity', 'Network Security', 'Web Security',
    'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch'
]

export const COMPUTER_SCIENCE_INTERESTS = [
    'Web Development', 'Mobile App Development', 'Game Development',
    'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Natural Language Processing',
    'Data Science', 'Big Data Analytics', 'Data Visualization',
    'Cybersecurity', 'Ethical Hacking', 'Network Security', 'Information Security',
    'Cloud Computing', 'DevOps', 'Microservices', 'Containerization',
    'Blockchain', 'Cryptocurrency', 'Smart Contracts',
    'Internet of Things (IoT)', 'Embedded Systems', 'Robotics',
    'Computer Vision', 'Image Processing', 'Augmented Reality', 'Virtual Reality',
    'Software Engineering', 'System Design', 'Database Systems',
    'Human-Computer Interaction', 'UI/UX Design', 'Accessibility',
    'Open Source Development', 'Research', 'Academia', 'Entrepreneurship'
]

export const COMPUTER_SCIENCE_SPECIALIZATIONS = [
    'Software Engineering', 'Web Development', 'Mobile Development',
    'Artificial Intelligence', 'Machine Learning', 'Data Science',
    'Cybersecurity', 'Information Security', 'Network Security',
    'Database Systems', 'Big Data', 'Cloud Computing',
    'Computer Graphics', 'Computer Vision', 'Game Development',
    'Human-Computer Interaction', 'UI/UX Design',
    'Distributed Systems', 'System Administration', 'DevOps',
    'Blockchain Technology', 'Internet of Things (IoT)',
    'Embedded Systems', 'Robotics', 'Computer Networks',
    'Theoretical Computer Science', 'Algorithms', 'Computational Theory'
]

export const ACADEMIC_YEARS = [
    { value: 1, label: '100 Level (Year 1)' },
    { value: 2, label: '200 Level (Year 2)' },
    { value: 3, label: '300 Level (Year 3)' },
    { value: 4, label: '400 Level (Year 4)' },
    { value: 5, label: '500 Level (Year 5)' },
    { value: 6, label: '600 Level (Year 6)' },
]

export const SUPERVISOR_TITLES = [
    'Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer I', 'Lecturer II',
    'Assistant Lecturer', 'Graduate Assistant', 'Dr.', 'Mr.', 'Mrs.', 'Ms.'
]

export const DEPARTMENTS = [
    'Computer Science', 'Information Technology', 'Software Engineering',
    'Computer Engineering', 'Electrical Engineering', 'Mathematics',
    'Statistics', 'Physics', 'Other'
]
