import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    generateRandomToken,
    checkRateLimit,
    extractToken
} from '../../server/lib/auth.js';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
});

const resetRequestSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'register':
                return handleRegister(req, res);
            case 'login':
                return handleLogin(req, res);
            case 'google':
                return handleGoogleAuth(req, res);
            case 'me':
                return handleGetMe(req, res);
            case 'request-reset':
                return handleRequestReset(req, res);
            case 'reset-password':
                return handleResetPassword(req, res);
            case 'verify-email':
                return handleVerifyEmail(req, res);
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Auth API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleRegister(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting: 5 registrations per IP per hour
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';
    const rateLimit = checkRateLimit(`register:${clientIp}`, 5, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
        return res.status(429).json({
            error: 'Too many registration attempts. Please try again later.',
            retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
        });
    }

    // Validate input
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { email, password, firstName, lastName } = validation.data;

    // Check if user already exists
    const existingUser = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, email.toLowerCase()))
        .limit(1);

    if (existingUser.length > 0) {
        return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Create user
    const passwordHash = hashPassword(password);
    const emailVerifyToken = generateRandomToken();

    const newUser = await db.insert(schema.users).values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: 'customer',
        emailVerified: false,
        emailVerifyToken,
    }).returning();

    // TODO: Send verification email via Resend
    // await sendVerificationEmail(email, emailVerifyToken);

    // Generate token
    const token = generateToken(newUser[0].id, email, 'customer');

    return res.status(201).json({
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        token,
        user: {
            id: newUser[0].id,
            email: newUser[0].email,
            firstName: newUser[0].firstName,
            lastName: newUser[0].lastName,
            role: newUser[0].role,
            emailVerified: newUser[0].emailVerified,
        }
    });
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting: 5 login attempts per email per 15 minutes
    const email = req.body?.email?.toLowerCase();
    if (email) {
        const rateLimit = checkRateLimit(`login:${email}`, 5, 15 * 60 * 1000);
        if (!rateLimit.allowed) {
            return res.status(429).json({
                error: 'Too many login attempts. Please try again later.',
                retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
            });
        }
    }

    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { password, rememberMe } = validation.data;

    // Find user
    const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

    if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(
        user.id,
        user.email!,
        user.role as 'customer' | 'admin',
        rememberMe
    );

    return res.status(200).json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            emailVerified: user.emailVerified,
            profileImageUrl: user.profileImageUrl,
        }
    });
}

async function handleGoogleAuth(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { googleId, email, firstName, lastName, profileImageUrl } = req.body;

    if (!googleId || !email) {
        return res.status(400).json({ error: 'Google ID and email are required' });
    }

    // Check if user exists by Google ID
    let user = await db.select()
        .from(schema.users)
        .where(eq(schema.users.googleId, googleId))
        .limit(1);

    if (user.length === 0) {
        // Check if email exists
        user = await db.select()
            .from(schema.users)
            .where(eq(schema.users.email, email.toLowerCase()))
            .limit(1);

        if (user.length > 0) {
            // Link Google account to existing user
            await db.update(schema.users)
                .set({
                    googleId,
                    profileImageUrl: profileImageUrl || user[0].profileImageUrl,
                    emailVerified: true,
                    updatedAt: new Date()
                })
                .where(eq(schema.users.id, user[0].id));
        } else {
            // Create new user
            const newUser = await db.insert(schema.users).values({
                email: email.toLowerCase(),
                googleId,
                firstName,
                lastName,
                profileImageUrl,
                role: 'customer',
                emailVerified: true, // Google emails are verified
            }).returning();
            user = newUser;
        }
    }

    const currentUser = user[0];
    const token = generateToken(
        currentUser.id,
        currentUser.email!,
        currentUser.role as 'customer' | 'admin'
    );

    return res.status(200).json({
        success: true,
        token,
        user: {
            id: currentUser.id,
            email: currentUser.email,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            role: currentUser.role,
            emailVerified: currentUser.emailVerified,
            profileImageUrl: currentUser.profileImageUrl,
        }
    });
}

async function handleGetMe(req: VercelRequest, res: VercelResponse) {
    const token = extractToken(req.headers.authorization);
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, payload.userId))
        .limit(1);

    if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    return res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        profileImageUrl: user.profileImageUrl,
    });
}

async function handleRequestReset(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const validation = resetRequestSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { email } = validation.data;

    // Rate limiting: 3 reset requests per email per hour
    const rateLimit = checkRateLimit(`reset:${email.toLowerCase()}`, 3, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
        return res.status(429).json({
            error: 'Too many reset requests. Please try again later.',
            retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
        });
    }

    const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, email.toLowerCase()))
        .limit(1);

    // Always return success to prevent email enumeration
    if (users.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.'
        });
    }

    const resetToken = generateRandomToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.update(schema.users)
        .set({
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
            updatedAt: new Date()
        })
        .where(eq(schema.users.id, users[0].id));

    // TODO: Send reset email via Resend
    // await sendPasswordResetEmail(email, resetToken);

    return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
    });
}

async function handleResetPassword(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { token, password } = validation.data;

    const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.passwordResetToken, token))
        .limit(1);

    if (users.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = users[0];

    // Check if token is expired
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Update password
    const passwordHash = hashPassword(password);

    await db.update(schema.users)
        .set({
            passwordHash,
            passwordResetToken: null,
            passwordResetExpires: null,
            updatedAt: new Date()
        })
        .where(eq(schema.users.id, user.id));

    return res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. You can now log in.'
    });
}

async function handleVerifyEmail(req: VercelRequest, res: VercelResponse) {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Verification token is required' });
    }

    const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.emailVerifyToken, token))
        .limit(1);

    if (users.length === 0) {
        return res.status(400).json({ error: 'Invalid verification token' });
    }

    await db.update(schema.users)
        .set({
            emailVerified: true,
            emailVerifyToken: null,
            updatedAt: new Date()
        })
        .where(eq(schema.users.id, users[0].id));

    return res.status(200).json({
        success: true,
        message: 'Email verified successfully!'
    });
}
