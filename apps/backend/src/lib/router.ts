import { Router } from 'express';
import { authUserSignedIn } from './controllers/auth';
import { getUser, getVersion, deleteUser } from './controllers';
import { deleteUserHistory, getHistory, getUserHistoryById } from './controllers/history';
import { dashboardData } from './controllers/ui';

let router = Router();

// Version Endpoints
router.get('/', getVersion);

// User endpoints - auth handled by Better Auth at /api/auth/*
router.get('/user', authUserSignedIn, getUser);
router.delete('/user', authUserSignedIn, deleteUser);

router.get('/history', authUserSignedIn, getHistory);
router.get('/history/:id', authUserSignedIn, getUserHistoryById);
router.delete('/history/:id', authUserSignedIn, deleteUserHistory);

router.get('/ui/dashboard', authUserSignedIn, dashboardData);

export default router;
