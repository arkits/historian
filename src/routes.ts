import { Router } from 'express';
import { getVersion } from './controller/VersionController';
import { registerUser, deleteUser, updateUser } from './controller/UserController';
import { addToHistory, getHistory } from './controller/HistoryController';
import { authenticateUser } from './domain/Auth';

var router = Router();

// Version Endpoints
router.get('/api', getVersion);

// User Endpoints
router.post('/api/users/register', registerUser);
router.post('/api/users/update', authenticateUser, updateUser);
router.post('/api/users/delete', authenticateUser, deleteUser);

// History Endpoints
router.get('/api/history', authenticateUser, getHistory);
router.post('/api/history/add', authenticateUser, addToHistory);

export { router };
