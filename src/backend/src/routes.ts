import { Router } from 'express';
import { getVersion } from './controller/VersionController';
import { registerUser, deleteUser, updateUser, getUser } from './controller/UserController';
import {
    addToHistory,
    getUserHistory,
    deleteHistory,
    getHistory,
    getRandomHistory
} from './controller/HistoryController';
import { authenticateUser } from './domain/Auth';

var router = Router();

// Version Endpoints
router.get('/api', getVersion);

// User Endpoints
router.post('/api/users/register', registerUser);
router.post('/api/users/update', authenticateUser, updateUser);
router.post('/api/users/delete', authenticateUser, deleteUser);
router.get('/api/users/user', authenticateUser, getUser);

// History Endpoints
router.get('/api/history', authenticateUser, getUserHistory);
router.get('/api/history/random', authenticateUser, getRandomHistory);
router.post('/api/history/add', authenticateUser, addToHistory);
router.get('/api/history/:historyId', authenticateUser, getHistory);
router.delete('/api/history/:historyId', authenticateUser, deleteHistory);

export { router };
