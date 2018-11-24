/**
 * @file
 * 
 * @copyright 2018 Min Li
 * 
 */

const { createLogger, transports,format } = require('winston')
const { splat,simple,combine, timestamp, prettyPrint } = format
const config=require('./auth.config')
const fmt=combine(
  splat(),
  simple(),
  timestamp(),
  prettyPrint()
)
const logger = createLogger({
    format:fmt,    
    transports: [
        new transports.File({ filename: `${config.logger.path||'.'}/error.log`, level: 'error' }),        
        new transports.File({ filename: `${config.logger.path||'.'}/combined.log`, level:config.logger.level||'info'})
    ]
  });
logger.level = config.logger.level||'info'

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
      format:fmt
    }))
}

module.exports = logger
