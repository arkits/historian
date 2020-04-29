import { User } from '../entity/User';
import { getRepository, DeleteResult, UpdateResult } from 'typeorm';
import { logger } from '../domain/Logger';

async function saveUser(user: User): Promise<User> {
    let savedUser = null;
    let userRepository = getRepository(User);
    try {
        savedUser = await userRepository.save(user);
    } catch (error) {
        logger.error(error);
    }
    return savedUser;
}

async function getUserByUsername(username: string): Promise<User> {
    let userRepository = getRepository(User);
    let user = await userRepository.findOne({
        username: username
    });
    return user;
}

async function deleteUserByUsername(username: string): Promise<DeleteResult> {
    let userRepository = getRepository(User);
    let result = null;
    try {
        result = await userRepository.delete({
            username: username
        });
    } catch (error) {
        logger.error(error);
    }
    return result;
}

async function modifyUser(user: User): Promise<UpdateResult> {
    let userRepository = getRepository(User);
    let result = null;
    try {
        result = await userRepository.update(
            {
                id: user.id
            },
            user
        );
    } catch (error) {
        logger.error(error);
    }
    return result;
}

export { getUserByUsername, saveUser, deleteUserByUsername, modifyUser };
