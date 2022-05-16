import { Router } from 'express';
import { getUser, getVersion, userLogin, userLogout, userSignUp } from './controllers';

let apiRouter = Router();

// Version Endpoints
apiRouter.get('/api', getVersion);

apiRouter.get('/user', getUser);
apiRouter.post('/user/signup', userSignUp);
apiRouter.post('/user/login', userLogin);
apiRouter.post('/user/logout', userLogout);

export default apiRouter;
