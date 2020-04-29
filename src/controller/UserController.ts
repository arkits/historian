import { Request, Response } from 'express';
import { User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import * as config from 'config';
import { saveUser, modifyUser, getUserByUsername, deleteUserByUsername } from '../dao/UserDao';
import { logger } from '../domain/Logger';
import { decodeAuthHeader } from '../utils';

async function registerUser(request: Request, response: Response) {
    let body = request.body;

    logger.info('[register-user] got new user request - ', body);

    let user = new User();

    if (body.username) {
        user.username = body.username;
    }

    if (body.name) {
        user.name = body.name;
    }

    if (body.password) {
        let hashedPassword = await bcrypt.hash(body.password, config.get('auth.saltRounds'));
        user.password = hashedPassword;
    }

    let savedUser = await saveUser(user);
    logger.info('[register-user] saved user to db! - ', savedUser);

    if (savedUser !== null) {
        delete savedUser.password;
        response.status(200);
        response.json({
            message: 'Registered User!',
            user: savedUser
        });
        return;
    } else {
        response.status(400);
        response.json({
            error: 'Failed to Registered User!',
            error_description: 'Failed to Registered User!'
        });
        return;
    }
}

async function deleteUser(request: Request, response: Response) {
    // extract username from request headers
    let [username, _] = decodeAuthHeader(request.headers.authorization);

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
            error: 'Failed to Update User!',
            error_description: 'Failed to Update User!'
        });
        return;
    }
}

async function updateUser(request: Request, response: Response) {
    // extract username from request headers
    let [username, _] = decodeAuthHeader(request.headers.authorization);

    let user = await getUserByUsername(username);

    let body = request.body;

    // Failes due to foreign key
    // if (body.username) {
    //     user.username = body.username;
    // }

    if (body.name) {
        user.name = body.name;
    }

    if (body.password) {
        let hashedPassword = await bcrypt.hash(body.password, config.get('auth.saltRounds'));
        user.password = hashedPassword;
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

export { registerUser, deleteUser, updateUser };
