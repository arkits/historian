import { Router } from 'express';
import { getVersion } from './controller/VersionController';
import { registerUser } from './controller/UserController';
import { addToHistory } from './controller/HistoryController';
import { authenticateUser } from './domain/Auth';

var router = Router();

// Version Endpoints
router.get('/api', getVersion);

// User Endpoints
router.post('/api/users/register', registerUser);

// History Endpoints
router.post('/api/history/add', authenticateUser, addToHistory);

export { router };
