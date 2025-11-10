import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import logger from '../logger';

const prisma = new PrismaClient();

export function getVersion(request: Request, response: Response) {
    response.status(200);
    response.json({
        name: 'historian-backend'
    });
    return;
}

export async function getUser(request, response: Response, next: NextFunction) {
    try {
        const session = request['betterAuthSession'];

        if (!session?.user) {
            return next({ message: 'User not found', code: 401 });
        }

        response.json({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email
        });
    } catch (error) {
        logger.error(error, 'Failed to Get User!');
        return next({ message: 'Failed to get user', code: 500 });
    }
}

export async function deleteUser(request, response: Response, next: NextFunction) {
    try {
        const session = request['betterAuthSession'];

        if (!session?.user) {
            return next({ message: 'User not found', code: 401 });
        }

        const userId = session.user.id;

        await prisma.history.deleteMany({
            where: {
                userId: userId
            }
        });

        await prisma.user.delete({
            where: {
                id: userId
            }
        });

        logger.info({ userId }, 'User deleted');

        response.json({ id: userId });
    } catch (error) {
        logger.error(error, 'Failed to Delete User!');
        return next({ message: 'Failed to delete user', code: 500 });
    }
}
