import winston from 'winston';
// @ts-ignore
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');
import { format } from 'logform';

const combinedFormat = format.combine(
    format.timestamp(),
    format.json(),
    format.errors({ stack: true }),
);

import { config } from '@/config';
// @ts-ignore
const rotateTransport = new winston.transports.DailyRotateFile({
    level: 'info',
    dirname: config.logs_dir,
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

export const logger = winston.createLogger({
    level: 'info',
    format: combinedFormat,
    defaultMeta: { service: 'zkpod.ai-daily-digest' },
    transports: [
        new winston.transports.Console(),
        rotateTransport,
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.clear();
    logger.add(new winston.transports.Console({
        format: format.combine(format.colorize({ level: true }), format((info) => {
            const cleanInfo = { level: info.level, message: `${info.message}\n` };
            return cleanInfo;
        })(), format.simple()),
        level: 'debug',
    }));
}