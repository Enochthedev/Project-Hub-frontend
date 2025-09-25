import { profileUtils } from '@/lib/api/profile'
import { StudentProfile, SupervisorProfile } from '@/lib/api/types'

describe('Profile Utils', () => {
    describe('calculateStudentProfileCompletion', () => {
        const baseStudentProfile: StudentProfile = {
            id: '1',
            userId: '1',
            name: 'John Doe',
            studentId: 'CS/2020/001',
            level: '300',
            department: 'Computer Science',
            skills: ['JavaScript'],
            interests: ['Web Development'],
            preferredSpecializations: ['Software Engineering'],
            bio: null,
            profilePicture: null,
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
        }

        it('should calculate completion for profile with all required fields', () => {
            const completion = profileUtils.calculateStudentProfileCompletion(baseStudentProfile)
            expect(completion).toBe(70) // Only required fields completed
        })

        it('should calculate 100% completion for fully completed profile', () => {
            const completeProfile: StudentProfile = {
                ...baseStudentProfile,
                currentYear: 3,
                gpa: 4.5,
                bio: 'I am a student',
                profilePicture: 'https://example.com/image.jpg',
            }
            const completion = profileUtils.calculateStudentProfileCompletion(completeProfile)
            expect(completion).toBe(100)
        })

        it('should calculate partial completion for missing required fields', () => {
            const incompleteProfile: StudentProfile = {
                ...baseStudentProfile,
                skills: [], // Missing required field
            }
            const completion = profileUtils.calculateStudentProfileCompletion(incompleteProfile)
            expect(completion).toBeLessThan(70)
        })

        it('should handle empty arrays as missing fields', () => {
            const emptyProfile: StudentProfile = {
                ...baseStudentProfile,
                skills: [],
                interests: [],
                preferredSpecializations: [],
            }
            const completion = profileUtils.calculateStudentProfileCompletion(emptyProfile)
            expect(completion).toBe(18) // Only name is completed (1/4 * 70)
        })
    })

    describe('calculateSupervisorProfileCompletion', () => {
        const baseSupervisorProfile: SupervisorProfile = {
            id: '1',
            userId: '1',
            name: 'Dr. Jane Smith',
            title: 'Professor',
            department: 'Computer Science',
            specializations: ['Machine Learning'],
            researchInterests: ['AI'],
            bio: null,
            profilePicture: null,
            contactEmail: null,
            officeLocation: null,
            availableSlots: 5,
            currentStudents: 0,
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
        }

        it('should calculate completion for profile with all required fields', () => {
            const completion = profileUtils.calculateSupervisorProfileCompletion(baseSupervisorProfile)
            expect(completion).toBe(80) // Only required fields completed
        })

        it('should calculate 100% completion for fully completed profile', () => {
            const completeProfile: SupervisorProfile = {
                ...baseSupervisorProfile,
                bio: 'I am a professor',
                profilePicture: 'https://example.com/image.jpg',
                contactEmail: 'jane@ui.edu.ng',
                officeLocation: 'Room 201',
            }
            const completion = profileUtils.calculateSupervisorProfileCompletion(completeProfile)
            expect(completion).toBe(100)
        })

        it('should calculate partial completion for missing required fields', () => {
            const incompleteProfile: SupervisorProfile = {
                ...baseSupervisorProfile,
                specializations: [], // Missing required field
            }
            const completion = profileUtils.calculateSupervisorProfileCompletion(incompleteProfile)
            expect(completion).toBeLessThan(80)
        })
    })

    describe('getStudentProfileMissingFields', () => {
        const baseStudentProfile: StudentProfile = {
            id: '1',
            userId: '1',
            name: '',
            studentId: 'CS/2020/001',
            level: '300',
            department: 'Computer Science',
            skills: [],
            interests: [],
            preferredSpecializations: [],
            bio: null,
            profilePicture: null,
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
        }

        it('should return all missing required fields', () => {
            const missingFields = profileUtils.getStudentProfileMissingFields(baseStudentProfile)
            expect(missingFields).toEqual([
                'Full Name',
                'Skills',
                'Interests',
                'Preferred Specializations'
            ])
        })

        it('should return empty array for complete profile', () => {
            const completeProfile: StudentProfile = {
                ...baseStudentProfile,
                name: 'John Doe',
                skills: ['JavaScript'],
                interests: ['Web Development'],
                preferredSpecializations: ['Software Engineering'],
            }
            const missingFields = profileUtils.getStudentProfileMissingFields(completeProfile)
            expect(missingFields).toEqual([])
        })

        it('should return partial missing fields', () => {
            const partialProfile: StudentProfile = {
                ...baseStudentProfile,
                name: 'John Doe',
                skills: ['JavaScript'],
                // interests and preferredSpecializations still empty
            }
            const missingFields = profileUtils.getStudentProfileMissingFields(partialProfile)
            expect(missingFields).toEqual(['Interests', 'Preferred Specializations'])
        })
    })

    describe('getSupervisorProfileMissingFields', () => {
        const baseSupervisorProfile: SupervisorProfile = {
            id: '1',
            userId: '1',
            name: '',
            title: '',
            department: '',
            specializations: [],
            researchInterests: [],
            bio: null,
            profilePicture: null,
            contactEmail: null,
            officeLocation: null,
            availableSlots: 5,
            currentStudents: 0,
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
        }

        it('should return all missing required fields', () => {
            const missingFields = profileUtils.getSupervisorProfileMissingFields(baseSupervisorProfile)
            expect(missingFields).toEqual([
                'Full Name',
                'Title',
                'Department',
                'Specializations',
                'Research Interests'
            ])
        })

        it('should return empty array for complete profile', () => {
            const completeProfile: SupervisorProfile = {
                ...baseSupervisorProfile,
                name: 'Dr. Jane Smith',
                title: 'Professor',
                department: 'Computer Science',
                specializations: ['Machine Learning'],
                researchInterests: ['AI'],
            }
            const missingFields = profileUtils.getSupervisorProfileMissingFields(completeProfile)
            expect(missingFields).toEqual([])
        })
    })

    describe('formatProfilePictureUrl', () => {
        const originalEnv = process.env.NEXT_PUBLIC_API_URL

        beforeEach(() => {
            process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
        })

        afterEach(() => {
            process.env.NEXT_PUBLIC_API_URL = originalEnv
        })

        it('should return placeholder for null/undefined URLs', () => {
            expect(profileUtils.formatProfilePictureUrl(null)).toBe('/placeholder-user.jpg')
            expect(profileUtils.formatProfilePictureUrl(undefined)).toBe('/placeholder-user.jpg')
            expect(profileUtils.formatProfilePictureUrl('')).toBe('/placeholder-user.jpg')
        })

        it('should return full URLs as-is', () => {
            const fullUrl = 'https://example.com/image.jpg'
            expect(profileUtils.formatProfilePictureUrl(fullUrl)).toBe(fullUrl)
        })

        it('should prepend API base URL to relative paths', () => {
            const relativePath = '/uploads/profile.jpg'
            const expected = 'http://localhost:3001/uploads/profile.jpg'
            expect(profileUtils.formatProfilePictureUrl(relativePath)).toBe(expected)
        })

        it('should handle paths without leading slash', () => {
            const relativePath = 'uploads/profile.jpg'
            const expected = 'http://localhost:3001/uploads/profile.jpg'
            expect(profileUtils.formatProfilePictureUrl(relativePath)).toBe(expected)
        })
    })

    describe('validateProfilePicture', () => {
        it('should validate correct file', () => {
            const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
            Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }) // 1MB

            const result = profileUtils.validateProfilePicture(validFile)
            expect(result.isValid).toBe(true)
            expect(result.error).toBeUndefined()
        })

        it('should reject files larger than 5MB', () => {
            const largeFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
            Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }) // 6MB

            const result = profileUtils.validateProfilePicture(largeFile)
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('File size must be less than 5MB')
        })

        it('should reject invalid file types', () => {
            const invalidFile = new File([''], 'test.txt', { type: 'text/plain' })
            Object.defineProperty(invalidFile, 'size', { value: 1024 })

            const result = profileUtils.validateProfilePicture(invalidFile)
            expect(result.isValid).toBe(false)
            expect(result.error).toBe('Only JPEG, PNG, and WebP images are allowed')
        })

        it('should accept all valid image types', () => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

            validTypes.forEach(type => {
                const file = new File([''], `test.${type.split('/')[1]}`, { type })
                Object.defineProperty(file, 'size', { value: 1024 })

                const result = profileUtils.validateProfilePicture(file)
                expect(result.isValid).toBe(true)
            })
        })
    })
})
