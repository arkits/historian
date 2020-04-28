import { Request, Response } from 'express';
import * as bunyan from 'bunyan';
import { User } from '../entity/User';
import { getRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as config from 'config';

const logger = bunyan.createLogger({ name: 'historian' });

const registerUser = async (request: Request, response: Response) => {
    let body = request.body;

    logger.info('In registerUser - ', body);

    let user = new User();

    if (body.username) {
        user.username = body.username;
    }

    if (body.name) {
        user.name = body.name;
    }

    if (body.password) {
        let hashedPassword = await bcrypt.hash(body.password, config.get('auth.saltRounds'));
        logger.info('[register-user] generated hased password - ', hashedPassword);
        user.password = hashedPassword;
    }

    let result = await addUser(user);

    if (result) {
        response.status(200);
        response.json({
            message: 'Registered User!'
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
};

const addUser = async (user: User) => {
    var result = false;
    var userRepository = getRepository(User);

    try {
        await userRepository.save(user);
        result = true;
    } catch (error) {
        result = false;
        logger.error(error);
    }

    return result;
};

export { registerUser };
