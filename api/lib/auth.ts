import * as crypto from 'crypto';

// Simple JWT-like token implementation (no external dependencies)
// In production, use a proper JWT library like jose

const JWT_SECRET = process.env.JWT_SECRET || 'primepickz-jwt-secret-change-in-production';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface TokenPayload {
    userId: string;
    email: string;
    role: 'customer' | 'admin';
    exp: number;
}

// Base64URL encoding (URL-safe)
function base64UrlEncode(str: string): string {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return Buffer.from(str, 'base64').toString();
}

// Create HMAC signature
function createSignature(payload: string): string {
    return crypto
        .createHmac('sha256', JWT_SECRET)
        .update(payload)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Generate JWT token
export function generateToken(userId: string, email: string, role: 'customer' | 'admin' = 'customer', rememberMe = false): string {
    const payload: TokenPayload = {
        userId,
        email,
        role,
        exp: Date.now() + (rememberMe ? TOKEN_EXPIRY * 7 : TOKEN_EXPIRY), // 7 days if remember me
    };

    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = base64UrlEncode(JSON.stringify(payload));
    const signature = createSignature(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
}

// Verify and decode JWT token
export function verifyToken(token: string): TokenPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [header, body, signature] = parts;

        // Verify signature
        const expectedSignature = createSignature(`${header}.${body}`);
        if (signature !== expectedSignature) return null;

        // Decode payload
        const payload: TokenPayload = JSON.parse(base64UrlDecode(body));

        // Check expiration
        if (payload.exp < Date.now()) return null;

        return payload;
    } catch {
        return null;
    }
}

// Hash password using SHA-256 with salt (simple implementation)
// In production, use bcrypt
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

// Verify password
export function verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

// Generate random token for email verification / password reset
export function generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// Rate limiting helper (in-memory, for serverless use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || record.resetAt < now) {
        rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
    }

    if (record.count >= maxAttempts) {
        return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    record.count++;
    return { allowed: true, remaining: maxAttempts - record.count, resetAt: record.resetAt };
}

// Extract token from Authorization header
export function extractToken(authHeader: string | undefined): string | null {
    if (!authHeader) return null;

    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
}
