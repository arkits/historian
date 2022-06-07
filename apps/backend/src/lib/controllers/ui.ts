import { PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { getUserHistoryCountForDate } from '../db';
import logger from '../logger';
import { version } from '../version';
import { getUserFromSession } from './auth';

const prisma = new PrismaClient();

const ONE_DAY = 24 * 60 * 60 * 1000;

interface ChartData {
    labels: string[];
    datasetSavedCount: number[];
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
            datasetSavedCount: []
        };

        for (let i = 0; i < 14; i++) {
            const dateStart = new Date(Date.now() - ONE_DAY * (i + 1));
            const dateEnd = new Date(Date.now() - ONE_DAY * i);
            const count = await getUserHistoryCountForDate(user, dateStart, dateEnd);
            chartData.datasetSavedCount.push(count);
            chartData.labels.push(`${dateEnd.getMonth()}/${dateEnd.getDate()}`);
        }

        chartData.datasetSavedCount.reverse();
        chartData.labels.reverse();

        let data = {
            totalSaved: totalSaved,
            savedLast24: savedLast24,
            chartData: chartData,
            version: version
        };

        response.status(200);
        response.json(data);
    } catch (error) {
        logger.error(error, 'Failed to generate Dashboard Data!');
    }
}
