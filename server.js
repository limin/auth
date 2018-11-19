/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */


const http = require('http')
const config=require('./auth.config')
const logger = require('./logger')
const app = require('./app') 
const Datastore= require('./datastore')
 
logger.info('Booting Web Application')
let server = http.createServer(app(new Datastore()))
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error
    }
    if (error.code) {
        logger.error(`Cannot listen for connections (${error.code}): ${error.message}`)
        throw error
    }
    throw error
});
server.on('listening', () => {
    let addr = server.address()
    logger.info(`Listening on port ${addr.family}/(${addr.address}):${addr.port}`)
})
server.listen(config.httpServer.port || 3000)