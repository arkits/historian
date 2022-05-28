import { Router } from 'express';
import { authUserSignedIn } from './controllers/auth';
import { getUser, getVersion, userLogin, userLogout, userSignUp } from './controllers/controllers';
import { deleteUserHistory, getHistory } from './controllers/history';
import { dashboardData } from './controllers/ui';

let router = Router();

// Version Endpoints
router.get('/', getVersion);

router.get('/user', authUserSignedIn, getUser);
router.post('/user/signup', userSignUp);
router.post('/user/login', userLogin);
router.post('/user/logout', authUserSignedIn, userLogout);

router.get('/history', authUserSignedIn, getHistory);
router.delete('/history/:id', authUserSignedIn, deleteUserHistory);

router.get('/ui/dashboard', authUserSignedIn, dashboardData);

export default router;
