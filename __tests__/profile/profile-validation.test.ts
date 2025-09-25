import {
    studentProfileSchema,
    supervisorProfileSchema,
    changePasswordSchema,
    profilePictureSchema
} from '@/lib/validations/profile'

describe('Profile Validation Schemas', () => {
    describe('studentProfileSchema', () => {
        const validStudentData = {
            name: 'John Doe',
            skills: ['JavaScript', 'React'],
            interests: ['Web Development', 'AI'],
            preferredSpecializations: ['Software Engineering'],
            currentYear: 3,
            gpa: 4.5,
            bio: 'I am a passionate computer science student.',
            profilePicture: 'https://example.com/image.jpg',
        }

        it('should validate correct student profile data', () => {
            const result = studentProfileSchema.safeParse(validStudentData)
            expect(result.success).toBe(true)
        })

        it('should require name', () => {
            const data = { ...validStudentData, name: '' }
            const result = studentProfileSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Name is required')
            }
        })

        it('should require at least one skill', () => {
            const data = { ...validStudentData, skills: [] }
            const result = studentProfileSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Please select at least one skill')
            }
        })

        it('should limit skills to maximum 20', () => {
            const data = {
                ...validStudentData,
                skills: Array(21).fill('JavaScript')
            }
            const result = studentProfileSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Maximum 20 skills allowed')
            }
        })

        it('should validate GPA range', () => {
            const invalidGPA = { ...validStudentData, gpa: 6.0 }
            const result = studentProfileSchema.safeParse(invalidGPA)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('GPA must be between 0.00 and 5.00')
            }
        })

        it('should validate academic year range', () => {
            const invalidYear = { ...validStudentData, currentYear: 7 }
            const result = studentProfileSchema.safeParse(invalidYear)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Year must be between 1 and 6')
            }
        })

        it('should limit bio length', () => {
            const longBio = { ...validStudentData, bio: 'a'.repeat(501) }
            const result = studentProfileSchema.safeParse(longBio)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Bio must be less than 500 characters')
            }
        })

        it('should allow null values for optional fields', () => {
            const data = {
                ...validStudentData,
                currentYear: null,
                gpa: null,
                profilePicture: null,
                bio: undefined,
            }
            const result = studentProfileSchema.safeParse(data)
            expect(result.success).toBe(true)
        })
    })

    describe('supervisorProfileSchema', () => {
        const validSupervisorData = {
            name: 'Dr. Jane Smith',
            title: 'Professor',
            department: 'Computer Science',
            specializations: ['Machine Learning', 'AI'],
            researchInterests: ['Deep Learning', 'NLP'],
            bio: 'I am a professor specializing in AI research.',
            profilePicture: 'https://example.com/image.jpg',
            contactEmail: 'jane.smith@ui.edu.ng',
            officeLocation: 'Room 201, CS Building',
            maxStudents: 5,
            isAvailable: true,
        }

        it('should validate correct supervisor profile data', () => {
            const result = supervisorProfileSchema.safeParse(validSupervisorData)
            expect(result.success).toBe(true)
        })

        it('should require name, title, and department', () => {
            const data = { ...validSupervisorData, name: '', title: '', department: '' }
            const result = supervisorProfileSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues.length).toBeGreaterThanOrEqual(3)
            }
        })

        it('should require at least one specialization', () => {
            const data = { ...validSupervisorData, specializations: [] }
            const result = supervisorProfileSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Please select at least one specialization')
            }
        })

        it('should validate maxStudents range', () => {
            const invalidMax = { ...validSupervisorData, maxStudents: 0 }
            const result = supervisorProfileSchema.safeParse(invalidMax)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Maximum students must be at least 1')
            }
        })

        it('should limit bio length', () => {
            const longBio = { ...validSupervisorData, bio: 'a'.repeat(1001) }
            const result = supervisorProfileSchema.safeParse(longBio)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Bio must be less than 1000 characters')
            }
        })

        it('should validate email format', () => {
            const invalidEmail = { ...validSupervisorData, contactEmail: 'invalid-email' }
            const result = supervisorProfileSchema.safeParse(invalidEmail)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Please enter a valid email address')
            }
        })
    })

    describe('changePasswordSchema', () => {
        const validPasswordData = {
            currentPassword: 'oldPassword123!',
            newPassword: 'NewPassword123!',
            confirmPassword: 'NewPassword123!',
        }

        it('should validate correct password change data', () => {
            const result = changePasswordSchema.safeParse(validPasswordData)
            expect(result.success).toBe(true)
        })

        it('should require current password', () => {
            const data = { ...validPasswordData, currentPassword: '' }
            const result = changePasswordSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Current password is required')
            }
        })

        it('should validate new password strength', () => {
            const weakPassword = { ...validPasswordData, newPassword: 'weak', confirmPassword: 'weak' }
            const result = changePasswordSchema.safeParse(weakPassword)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('Password must be at least 8 characters')
                )).toBe(true)
            }
        })

        it('should require password confirmation match', () => {
            const data = { ...validPasswordData, confirmPassword: 'DifferentPassword123!' }
            const result = changePasswordSchema.safeParse(data)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain("Passwords don't match")
            }
        })

        it('should validate password complexity requirements', () => {
            const testCases = [
                { password: 'nouppercase123!', error: 'uppercase letter' },
                { password: 'NOLOWERCASE123!', error: 'lowercase letter' },
                { password: 'NoNumbers!', error: 'number' },
                { password: 'NoSpecialChars123', error: 'special character' },
            ]

            testCases.forEach(({ password, error }) => {
                const data = { ...validPasswordData, newPassword: password, confirmPassword: password }
                const result = changePasswordSchema.safeParse(data)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error.issues.some(issue =>
                        issue.message.includes(error)
                    )).toBe(true)
                }
            })
        })
    })

    describe('profilePictureSchema', () => {
        it('should validate correct file', () => {
            const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
            Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }) // 1MB

            const result = profilePictureSchema.safeParse({ file: validFile })
            expect(result.success).toBe(true)
        })

        it('should reject files larger than 5MB', () => {
            const largeFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
            Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }) // 6MB

            const result = profilePictureSchema.safeParse({ file: largeFile })
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('File size must be less than 5MB')
            }
        })

        it('should reject invalid file types', () => {
            const invalidFile = new File([''], 'test.txt', { type: 'text/plain' })
            Object.defineProperty(invalidFile, 'size', { value: 1024 })

            const result = profilePictureSchema.safeParse({ file: invalidFile })
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Only JPEG, PNG, and WebP images are allowed')
            }
        })
    })
})