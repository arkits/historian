import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { deleteHistory, getHistoryById, getUserHistory } from '../db';
import logger from '../logger';
import { version } from '../version';
import { getUserFromSession } from './auth';

const prisma = new PrismaClient();

export async function dashboardData(request, response: Response, next: NextFunction) {
    try {
        const user = await getUserFromSession(request.session);
        if (!user) {
            return next({ message: 'User not found', code: 400 });
        }

        const totalSaved = await prisma.history.count({
            where: {
                userId: user.id
            }
        });

        const savedLast24 = await prisma.history.count({
            where: {
                userId: user.id,
                createdAt: {
                    gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                    lt: new Date()
                }
            }
        });

        let data = {
            totalSaved: totalSaved,
            savedLast24: savedLast24,
            version: version
        };

        response.status(200);
        response.json(data);
    } catch (error) {
        logger.error(error, 'Failed to generate Dashboard Data!');
    }
}
