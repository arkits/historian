import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import logger from '../logger';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

export function getVersion(request: Request, response: Response) {
    response.status(200);
    response.json({
        name: 'historian-backend'
    });
    return;
}

export async function userSignUp(request, response: Response, next: NextFunction) {
    const { username, password } = request.body;

    if (!username || !password) {
        return next({ message: 'Username and password are required', code: 400 });
    }

    const passwordHash = await argon2.hash(password);

    logger.debug({ username, passwordHash, reqBody: request.body }, 'Creating user');

    let user = null;

    try {
        user = await prisma.user.create({
            data: {
                username,
                passwordHash,
                preferences: {}
            }
        });
    } catch (error) {
        logger.error(error, 'Failed to create User!');
        return next({ message: 'Failed to create User!', code: 400, description: error.message });
    }

    // set the session
    request.session.userId = user.id;
    request.session.loggedIn = true;
    request.session.save();

    logger.info(request.session, 'Session created');

    response.json({
        id: user.id,
        username: user.username
    });
}

export async function userLogin(request, response: Response, next: NextFunction) {
    const { username, password } = request.body;
    logger.debug({ username, password, reqBody: request.body }, 'Login user');

    if (!username || !password) {
        return next({ message: 'Username and password are required', code: 400 });
    }

    let user = null;

    try {
        user = await prisma.user.findFirst({
            where: {
                username: username
            }
        });

        if (!user) {
            return next({ message: 'User not found', code: 400 });
        }

        let isValid = false;
        try {
            isValid = await argon2.verify(user.passwordHash, password);
        } catch (error) {
            isValid = false;
        }
        if (!isValid) {
            return next({ message: 'Invalid password', code: 400 });
        }

        // set the session
        request.session.userId = user.id;
        request.session.loggedIn = true;
        request.session.save();

        logger.info(request.session, 'Session created');
    } catch (error) {
        logger.error(error, 'Failed to Login User!');
        return next({ message: 'Failed to Login User!', code: 400, description: error.message });
    }

    response.json({
        id: user.id,
        username: user.username
    });
}

export async function userLogout(request, response: Response, next: NextFunction) {
    try {
        logger.info(request.session, 'Logging out User');

        request.session.loggedIn = false;
        request.session.userId = null;
        request.session.destroy();

        response.status(200);
        response.json({ message: 'User logged out' });
    } catch (error) {
        logger.error(error, 'Failed to logout User!');
    }
}

export async function getUser(request, response: Response, next: NextFunction) {
    try {
        let user = await prisma.user.findFirst({
            where: {
                id: request.session.userId
            }
        });

        if (!user) {
            return next({ message: 'User not found', code: 400 });
        }

        response.json({ id: user.id, username: user.username });
    } catch (error) {
        logger.error(error, 'Failed to Get User!');
    }
}
