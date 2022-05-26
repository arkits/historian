import logger from '../logger';
import { Request, Response } from 'express';

interface ErrorResponse {
    message: string;
    code: number;
    description?: string;
}

export default function errorHandler(error: ErrorResponse, request: Request, response: Response, next) {
    logger.error(error, 'ErrorHandler caught an error!');
    response.status(error.code || 500);
    response.json({
        error: error.message,
        description: error?.description
    });
}
