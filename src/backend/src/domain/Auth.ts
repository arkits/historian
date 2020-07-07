import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { getUserByUsername } from '../dao/UserDao';
import { decodeAuthHeader } from '../utils';
import { logger } from '../domain/Logger';

const authenticateUser = async (request: Request, response: Response, next: NextFunction) => {
    let authenticated = false;

    let [username, password] = decodeAuthHeader(request.headers.authorization);

    let user = await getUserByUsername(username);

    if (user) {
        authenticated = await bcrypt.compare(password, user.password);
        if (!authenticated) {
            logger.info('[auth] basic auth failed for user - ', user.username);
        }
    }

    if (authenticated) {
        next();
    } else {
        response.status(401);
        response.json({
            error: 'Unauthorized!',
            error_description: 'Unauthorized'
        });
        return;
    }
};

const checkCreds = async (reqUsername, reqPassword, validUsername, validPassword) => {
    let result = false;

    // check if username is valid
    if (reqUsername === validUsername) {
        // check if password is valid
        result = await bcrypt.compare(reqPassword, validPassword);
    }

    return result;
};

export { authenticateUser, checkCreds };
