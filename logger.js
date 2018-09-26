/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */

const winston = require('winston')
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.json()
      ),    
    transports: [
        new winston.transports.File({ filename: `${process.env.LOG_PATH||'.'}/error.log`, level: 'error' }),        
        new winston.transports.File({ filename: `${process.env.LOG_PATH||'.'}/combined.log` })
    ]
  });
logger.level = process.env.LOG_LEVEL || 'info'

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple()
      )
    }))
}

module.exports = logger
