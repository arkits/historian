import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3333';
const isProduction = baseURL.startsWith('https://');

export const auth = betterAuth({
    baseURL,
    basePath: '/api/auth',
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
    },
    trustedOrigins: [
        'http://localhost:4200', // Alternative development port
        'http://10.0.0.93:4200', // Local network IP
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
        sameSite: 'none',
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
