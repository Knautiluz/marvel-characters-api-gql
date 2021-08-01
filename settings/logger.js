import winston from 'winston'
import fs from 'fs'
import path from 'path'

const logs = process.env.NODE_ENV === 'test' ? 'test_logs' : 'logs'

if (!fs.existsSync(logs))
    fs.mkdirSync(logs)

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logs, '/error/error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logs, '/info/info.log'), level: 'info' })
    ],
})

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}

export default logger