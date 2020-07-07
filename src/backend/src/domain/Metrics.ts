import * as prometheusMiddleware from 'express-prometheus-middleware';
import { debugUserCreds } from './Debug';
import { checkCreds } from './Auth';

var historianMetricsMiddleware = prometheusMiddleware({
    metricsPath: '/api/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
    authenticate: async (req) => {
        return await authRequest(req);
    }
});

async function authRequest(req) {
    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [reqUsername, reqPassword] = Buffer.from(b64auth, 'base64').toString().split(':');

    // Verify login and password are set and correct
    if (reqUsername && reqPassword && debugUserCreds.username && debugUserCreds.password) {
        return await checkCreds(reqUsername, reqPassword, debugUserCreds.username, debugUserCreds.password);
    }

    return false;
}

export { historianMetricsMiddleware };
