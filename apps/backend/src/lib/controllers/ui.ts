import { PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { TIMELINE_TYPES } from '../constants';
import { getUserActivityCountForDate, getUserHistoryCountForDate } from '../db';
import logger from '../logger';
import { version } from '../version';
import { getUserFromRequest } from './auth';
import { format } from 'date-fns';

const prisma = new PrismaClient();

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

interface ChartData {
    labels: string[];
    savedCount: {
        [key: string]: number[];
    };
}

export async function dashboardData(request, response: Response, next: NextFunction) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return next({ message: 'User not found', code: 400 });
        }

        const totalSaved = await prisma.history.count({
            where: {
                userId: user.id
            }
        });

        const savedLast24 = await getUserHistoryCountForDate(user, new Date(Date.now() - ONE_DAY), new Date());

        const chartData: ChartData = {
            labels: [],
            savedCount: {}
        };

        let topAgent = {
            name: 'Pending',
            count: 0
        };

        const CHART_DURATION = 24 * 10; // last 7 days

        for (const timelineType of TIMELINE_TYPES) {
            for (let i = 0; i < CHART_DURATION; i++) {
                const dateStart = new Date(Date.now() - ONE_HOUR * (i + 1));
                const dateEnd = new Date(Date.now() - ONE_HOUR * i);
                const count = await getUserActivityCountForDate(user, dateStart, dateEnd, timelineType);

                if (!chartData.savedCount.hasOwnProperty(timelineType)) {
                    chartData.savedCount[timelineType] = [];
                }

                chartData.savedCount[timelineType].push(count);

                if (chartData.labels.length < CHART_DURATION) {
                    chartData.labels.push(`${format(dateEnd, 'MM/dd hhaaaaa')}`);
                }
            }

            chartData.savedCount[timelineType].reverse();

            let savedCountByType = chartData.savedCount[timelineType].reduce((a, b) => a + b, 0);

            if (topAgent.count < savedCountByType) {
                topAgent = {
                    name: timelineType,
                    count: savedCountByType
                };
            }
        }

        chartData.labels.reverse();

        // If we didn't find a top agent in the recent chart window but the user has saved items,
        // fall back to calculating the top agent across all history for the user.
        if (topAgent.name === 'Pending' && totalSaved > 0) {
            try {
                for (const timelineType of TIMELINE_TYPES) {
                    const totalByType = await prisma.history.count({
                        where: {
                            userId: user.id,
                            type: timelineType
                        }
                    });

                    if (totalByType > topAgent.count) {
                        topAgent = { name: timelineType, count: totalByType };
                    }
                }
            } catch (err) {
                // ignore and keep Pending if something goes wrong
            }
        }

        // Determine the most recent lastSync timestamp from any of the user's accounts.
        // The cron and agents store a `lastSync` value in account.metadata (milliseconds since epoch).
        let systemLastSync: string | number = 'Pending';

        try {
            const accounts = await prisma.account.findMany({ where: { userId: user.id } });
            let newest: number | null = null;

            for (const acct of accounts) {
                try {
                    const metadata: any = acct.metadata || {};
                    const maybe = metadata && metadata.lastSync ? Number(metadata.lastSync) : null;
                    if (maybe && !isNaN(maybe)) {
                        if (newest === null || maybe > newest) {
                            newest = maybe;
                        }
                    }
                } catch (err) {
                    // ignore malformed metadata for a single account
                }
            }

            if (newest !== null) {
                // Keep as number (ms since epoch). Frontend will format it with date-fns.
                systemLastSync = newest;
            }
        } catch (err) {
            // If anything goes wrong querying accounts, fall back to 'Pending'
        }

        let data = {
            totalSaved: totalSaved,
            savedLast24: savedLast24,
            chartData: chartData,
            apiVersion: version,
            systemLastSync: systemLastSync,
            topAgent: topAgent.name
        };

        response.status(200);
        response.json(data);
    } catch (error) {
        logger.error(error, 'Failed to generate Dashboard Data!');
    }
}
