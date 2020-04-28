import { User } from '../entity/User';
import * as bunyan from 'bunyan';
import { getRepository } from 'typeorm';

const logger = bunyan.createLogger({ name: 'historian' });

const getUserByUsername = async (username) => {
    var userRepository = getRepository(User);
    let user = await userRepository.findOne({
        username: username
    });
    return user;
};

export { getUserByUsername };
