import { PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { TIMELINE_TYPES } from '../constants';
import { getUserHistoryCountForDate } from '../db';
import logger from '../logger';
import { version } from '../version';
import { getUserFromSession } from './auth';

const prisma = new PrismaClient();

const ONE_DAY = 24 * 60 * 60 * 1000;

interface ChartData {
    labels: string[];
    savedCount: {
        [key: string]: number[];
    };
}

export async function dashboardData(request, response: Response, next: NextFunction) {
    try {
        const user = await getUserFromSession(request.session);
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

        for (const timelineType of TIMELINE_TYPES) {
            for (let i = 0; i < 14; i++) {
                const dateStart = new Date(Date.now() - ONE_DAY * (i + 1));
                const dateEnd = new Date(Date.now() - ONE_DAY * i);
                const count = await getUserHistoryCountForDate(user, dateStart, dateEnd, timelineType);

                if (!chartData.savedCount.hasOwnProperty(timelineType)) {
                    chartData.savedCount[timelineType] = [];
                }

                chartData.savedCount[timelineType].push(count);

                if (chartData.labels.length < 14) {
                    chartData.labels.push(`${dateEnd.getMonth()}/${dateEnd.getDate()}`);
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

        let systemLastSync = 'Pending';
        try {
            systemLastSync = user.preferences['system']['lastSync'];
        } catch (error) {}

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
