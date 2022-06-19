import { response, Router } from 'express';
import logger from '../logger';
import { Prisma, PrismaClient } from '@prisma/client';
import * as querystring from 'querystring';
import axios from 'axios';
import { performSpotifySyncForUser } from './agent';
import { updateUserPreference } from '../db';
import { SPOTIFY_CALLBACK_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_TOKEN_URL } from './constants';

const prisma = new PrismaClient();

export const spotifyRouter = Router();

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
                    client_id: SPOTIFY_CLIENT_ID,
                    scope: 'user-read-recently-played user-read-currently-playing user-read-playback-state user-library-read',
                    redirect_uri: SPOTIFY_CALLBACK_URL,
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
            SPOTIFY_TOKEN_URL,
            new URLSearchParams({
                code: code.toString(),
                redirect_uri: SPOTIFY_CALLBACK_URL,
                grant_type: 'authorization_code'
            }),
            {
                headers: {
                    Authorization:
                        'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
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

            await updateUserPreference(user, 'spotify', {
                accessToken: response.data?.access_token,
                refreshToken: response.data?.refresh_token
            });

            logger.info(
                { user: user.username },
                'Completed OAuth flow. Performing initial sync - performSpotifySyncForUser'
            );

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
