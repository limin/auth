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



function createServer(datastore){
    logger.info('Booting Web Application')    
    let server = http.createServer(app(datastore))
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
    return server
}

let mongoClient=null, server=null

function exitHandler(options, exitCode) {
    if(server) server.close()
    if(mongoClient) mongoClient.close()
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

switch(config.db){
    case 'pouchdb':
        server=createServer(new require('./pouchstore')(config))    
        break
    case 'mongodb':
        const MongoClient = require('mongodb').MongoClient      
        MongoClient.connect(config.mongodb.url,{ useNewUrlParser: true }).then(client=>{
            mongoClient=client
            logger.info(`Connected successfully to mongodb server: ${config.mongodb.url}`)
            const Mongostore=require('./mongostore')
            server=createServer(new Mongostore(config,mongoClient.db('auth')))    
        },err=>{
            logger.error(err)
        })
        break
    default:
        logger.error("invalid config")
}