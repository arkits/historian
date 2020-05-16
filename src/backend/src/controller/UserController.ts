import { Request, Response } from 'express';
import { User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import * as config from 'config';
import { saveUser, modifyUser, getUserByUsername, deleteUserByUsername } from '../dao/UserDao';
import { getHistoryCountDao } from '../dao/HistoryDao';
import { logger } from '../domain/Logger';
import { decodeAuthHeader } from '../utils';

async function registerUser(request: Request, response: Response) {
    let body = request.body;

    logger.info('[register-user] got new user request - ', body);

    let user = new User();

    try {
        if (body.username) {
            user.username = body.username;
        } else {
            throw new Error('Required field: username supplied');
        }

        if (body.name) {
            user.name = body.name;
        } else {
            throw new Error('Required field: name supplied');
        }

        if (body.password) {
            let hashedPassword = await bcrypt.hash(body.password, config.get('auth.saltRounds'));
            user.password = hashedPassword;
        } else {
            throw new Error('Required field: password supplied');
        }
    } catch (error) {
        logger.error('[register-user] caught error in request validation - ', error);
        response.status(400);
        response.json({
            error: 'Bad Request!',
            error_description: 'Validation Error - ' + error.message
        });
        return;
    }

    try {
        let savedUser = await saveUser(user);
        logger.info('[register-user] saved user to db! - ', savedUser);

        // remove password
        delete savedUser.password;

        response.status(200);
        response.json({
            message: 'Registered User!',
            user: savedUser
        });
        return;
    } catch (error) {
        logger.error('[register-user] caught error when creating user - ', error);

        if (error.message.includes('duplicate key value violates unique constraint')) {
            response.status(400);
            response.json({
                error: 'Failed to create an user!',
                error_description: 'Username already exists'
            });
            return;
        }

        response.status(400);
        response.json({
            error: 'Bad Request!',
            error_description: 'Bad Request!'
        });
        return;
    }
}

async function deleteUser(request: Request, response: Response) {
    // extract username from request headers
    let [username, _] = decodeAuthHeader(request.headers.authorization);

    logger.info('[delete-user] request from username=', username);

    let result = await deleteUserByUsername(username);

    if (result.affected === 1) {
        response.status(200);
        response.json({
            message: 'Deleted User!'
        });
        return;
    } else {
        response.status(400);
        response.json({
            error: 'Failed to Delete User!',
            error_description: 'Failed to Delete User!'
        });
        return;
    }
}

async function updateUser(request: Request, response: Response) {
    // extract username from request headers
    let [username, _] = decodeAuthHeader(request.headers.authorization);

    let user = await getUserByUsername(username);

    let body = request.body;

    if (body.name) {
        user.name = body.name;
    }

    if (body.password) {
        let hashedPassword = await bcrypt.hash(body.password, config.get('auth.saltRounds'));
        user.password = hashedPassword;
    }

    if (body.metadata) {
        let updatedMetadata = null;
        if (user.metadata !== null) {
            updatedMetadata = Object.assign(user.metadata, body.metadata);
        } else {
            updatedMetadata = body.metadata;
        }
        logger.info('[update-user] metadata got updated - ', updatedMetadata);
        user.metadata = updatedMetadata;
    }

    let updateUserResult = await modifyUser(user);

    if (updateUserResult.affected === 1) {
        // get updated user from db
        let updatedUser = await getUserByUsername(username);
        logger.info('[update-user] user got updated to - ', updatedUser);

        // remove password
        delete updatedUser.password;

        // complete the request
        response.status(200);
        response.json({
            message: 'Updated User!',
            user: updatedUser
        });
        return;
    } else {
        response.status(400);
        response.json({
            error: 'Failed to Update User!',
            error_description: 'Failed to Update User!'
        });
        return;
    }
}

async function getUser(request: Request, response: Response) {
    // extract username from request headers
    let [username, _] = decodeAuthHeader(request.headers.authorization);

    let user = await getUserByUsername(username);
    let historyCount = await getHistoryCountDao(user);

    let toReturn = {
        id: user.id,
        name: user.name,
        username: user.username,
        metadata: user.metadata,
        history: {
            count: historyCount
        }
    };

    response.status(200);
    response.json(toReturn);
}

export { registerUser, deleteUser, updateUser, getUser };
