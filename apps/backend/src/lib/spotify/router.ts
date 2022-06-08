import { response, Router } from 'express';
import logger from '../logger';
import { Prisma, PrismaClient } from '@prisma/client';
import * as querystring from 'querystring';
import axios from 'axios';
import { performSpotifySyncForUser } from './agent';
import { appendUserPreferences } from '../db';

const prisma = new PrismaClient();

export const spotifyRouter = Router();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_CALLBACK_URL;

const spotifyTokenUrl = 'https://accounts.spotify.com/api/token';

spotifyRouter.get('/api/agent/spotify', async function (req, res, next) {
    if (req['session'].loggedIn) {
        const user = await prisma.user.findFirst({
            where: {
                id: req['session'].userId
            }
        });

        if (!user) {
            return next({ message: 'User not found', code: 400 });
        }

        try {
            const prefs = user.preferences['spotify'];

            if (!prefs) {
                return next({ message: 'No Spotify preferences found. Please setup Agent.', code: 400 });
            }

            const historyTotal = await prisma.history.count({
                where: {
                    userId: user.id,
                    type: {
                        startsWith: 'spotify'
                    }
                }
            });

            let response = {
                connected: true,
                username: prefs['username'],
                lastSync: prefs['lastSync'],
                historyTotal: historyTotal
            };

            res.status(200);
            res.json(response);
        } catch (error) {
            return next({ message: 'No Spotify preferences found. Please setup Agent.', code: 400 });
        }
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});

spotifyRouter.get('/auth/spotify', function (req, res, next) {
    if (req['session'].loggedIn) {
        res.redirect(
            'https://accounts.spotify.com/authorize?' +
                querystring.stringify({
                    response_type: 'code',
                    client_id: client_id,
                    scope: 'user-read-recently-played user-read-currently-playing user-read-playback-state user-library-read',
                    redirect_uri: redirect_uri,
                    state: 'random-unique-string'
                })
        );
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});

spotifyRouter.get('/auth/spotify/callback', async function (req, res, next) {
    if (req['session'].loggedIn) {
        var code = req.query.code || null;

        let response = await axios.post(
            spotifyTokenUrl,
            new URLSearchParams({
                code: code.toString(),
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            }),
            {
                headers: {
                    Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
                }
            }
        );

        try {
            const user = await prisma.user.findFirst({
                where: {
                    id: req['session'].userId
                }
            });

            if (!user) {
                return next({ message: 'User not found', code: 400 });
            }

            logger.info({ responseData: response.data, user }, 'Got Spotify Access Token');

            await appendUserPreferences(user, 'spotify', {
                ...user.preferences['spotify'],
                accessToken: response.data?.access_token,
                refreshToken: response.data?.refresh_token
            });

            performSpotifySyncForUser(user);
        } catch (error) {
            return next({ message: 'Failed to save access token', code: 400, description: error.message });
        }

        res.status(200);
        res.send('Spotify OAuth Flow Complete. Please return to Historian');
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});

spotifyRouter.post('/api/agent/spotify/collect', async (req, res, next) => {
    if (req['session'].loggedIn) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    id: req['session'].userId
                }
            });

            if (!user) {
                return next({ message: 'User not found', code: 400 });
            }

            const fetchAll = req.query.fetchAll === 'true';

            let response = null;

            try {
                logger.info({ user, fetchAll }, 'Invoking performSpotifySyncForUser');
                response = await performSpotifySyncForUser(user);
            } catch (error) {
                return next({ message: 'Error performSpotifySyncForUser', code: 500, description: error.message });
            }

            res.status(200);
            res.json({
                message: 'OK',
                details: response
            });
        } catch (error) {
            return next({ message: 'Error performSpotifySyncForUser', code: 400, description: error.message });
        }
    } else {
        return next({ message: 'User not logged in', code: 400 });
    }
});

// spotifyRouter.get('/refresh_token', function (req, res) {
//     // requesting access token from refresh token
//     var refresh_token = req.query.refresh_token;
//     var authOptions = {
//         url: 'https://accounts.spotify.com/api/token',
//         headers: { Authorization: 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64') },
//         form: {
//             grant_type: 'refresh_token',
//             refresh_token: refresh_token
//         },
//         json: true
//     };

//     request.post(authOptions, function (error, response, body) {
//         if (!error && response.statusCode === 200) {
//             var access_token = body.access_token;
//             res.send({
//                 access_token: access_token
//             });
//         }
//     });
// });
