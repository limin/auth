/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */

const debug = require('debug')('auth:api')
const express = require('express')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports=function(datastore){
  const router = express.Router({mergeParams:true})  
  router.get('/', (req, res) => {
    return res.send(require('./help'))
  })
    
  router.post('/authenticate',jsonParser, (req, res) => {
    debug('post /authenticate params:%o',req.body)      
    if (!req.body) return res.sendStatus(400)  
    const {loginId,password}=req.body
    datastore.authenticate(loginId,password).then(({token,exp})=>{
      if(token){
        debug('post /authenticate return:%o',{token,exp})        
        return res.send({token,exp})    
      }else{
        return res.status(401).send({error: '401 Unauthorized'})
      }
    }).catch(err=>{
      return res.status(401).send({error: '401 Unauthorized'})
    })
  })
  
  router.get('/token/:token', (req, res) => {
    const token=req.params.token
    debug('get /token/%s',token)  
    datastore.verify(token).then(loginId=>{
      debug('get /token/%s return:%o',token,{loginId})              
      return res.send({loginId})
    }).catch(err=>{
      return res.status(404).send({error: '404 Not Found'})
    })
  })
  
  router.put('/credential',jsonParser, (req, res) => {
    if (!req.body) return res.sendStatus(400)
    debug('put /credential:%o',req.body)    
    const {loginId,password}=req.body  
    datastore.updateCredential(loginId,password).then(credential=>{
      return res.send(credential)        
    })
  })
  
  
  router.post('/credential',jsonParser, (req, res) => {
    if (!req.body) return res.sendStatus(400)
    debug('post /credential:%o',req.body)  
    const {loginId,password}=req.body  
    datastore.createCredential(loginId,password).then(credential=>{
      return res.send(credential)        
    })
  })  

  return router
}