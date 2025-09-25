import { z } from 'zod'

// University of Ibadan email domains
const UI_EMAIL_DOMAINS = [
    '@ui.edu.ng',
    '@stu.ui.edu.ng',
    '@student.ui.edu.ng',
    '@postgrad.ui.edu.ng'
]

const isUIEmail = (email: string): boolean => {
    const normalizedEmail = email.toLowerCase().trim()
    return UI_EMAIL_DOMAINS.some(domain => normalizedEmail.endsWith(domain))
}

// Login validation schema
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .refine(isUIEmail, {
            message: 'Please use your University of Ibadan email address (@ui.edu.ng, @stu.ui.edu.ng, etc.)'
        }),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
    rememberMe: z.boolean().optional()
})

// Registration validation schema
export const registerSchema = z.object({
    firstName: z
        .string()
        .min(1, 'First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters'),
    lastName: z
        .string()
        .min(1, 'Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .refine(isUIEmail, {
            message: 'Please use your University of Ibadan email address (@ui.edu.ng, @stu.ui.edu.ng, etc.)'
        }),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
    termsAccepted: z
        .boolean()
        .refine(val => val === true, {
            message: 'You must accept the terms and conditions'
        })
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .refine(isUIEmail, {
            message: 'Please use your University of Ibadan email address'
        })
})

// Reset password validation schema
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password')
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
