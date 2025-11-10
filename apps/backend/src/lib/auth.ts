import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Determine if we're in production based on the BETTER_AUTH_URL
const isProduction = process.env.BETTER_AUTH_URL?.includes('https://');

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3333',
    basePath: '/api/auth',
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
    },
    trustedOrigins: [
        'http://localhost:4200',  // Alternative development port
        'http://localhost:3000',  // Next.js default port
        'http://127.0.0.1:4200',
        'http://127.0.0.1:3000',
        'http://10.0.0.93:4200',  // Local network IP
        'http://10.0.0.93:3000',
        'https://ai.historian.pages.dev',
        'https://*.historian.pages.dev',
        'https://historian.archit.xyz'
    ],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        }
    },
    cookieOptions: {
        path: '/',
        sameSite: isProduction ? 'none' : 'lax',
        httpOnly: true,
        secure: isProduction
    },
    advanced: {
        database: {
            generateId: () => randomUUID()
        }
    }
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
