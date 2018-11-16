/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */
const secureRandom = require('secure-random')
const njwt = require('njwt')
const crypto = require('crypto')
const debug = require('debug')('datastore')
const PouchDB = require('pouchdb/lib')
const PouchFind = require('pouchdb-find')
PouchDB.plugin(PouchFind)
const config=require('./auth.config')
const CREDENTIAL_TYPE='credential'
const JWT_TYPE='jwt'
const keys = []
for(let i=0;i<10;i++){
  keys[i]=secureRandom(256, {type: 'Buffer'}).toString('base64')
}    

/**
 * 
 * {
 *  type: "jwt",
 *  _id: token,
 *  key
 * }
 * 
 * {
 *  type:"credential",
 *  _id: loginId,
 *  passhash,
 *  salt
 * }
 * 
 */
class Datastore{
  constructor(options={}){
    this.config=Object.assign({},config,options)    
    this.db = new PouchDB(this.config.dsName,this.config.dsOptions)
    this.db.createIndex({
      index: {fields: ['type']}
    })

    if(this.config.initDataPath){
      this.db.bulkDocs(require(this.config.initDataPath))      
    }
  }

  pbkdf2({password,salt}){
    salt = salt || secureRandom(256, {type: 'Buffer'}).toString('base64')
    return new Promise((res,rej)=>{
      const callback=(err,key)=>{
        if (err){
          rej(err)
        }else{
          res({key:key.toString('hex'),salt})
        }
      }
      crypto.pbkdf2(password, salt, this.config.iterations, this.config.keylen, this.config.digest, callback)
    })
  }
  
  createJwt(credential){
    const exp=Date.now()/1000+this.config.tokenTTL
    const claims={
      iss:'auth', 
      sub:credential._id,
      exp
    }  
    const key=keys[Math.floor(Math.random()*10)]
    const token = njwt.create(claims,key).compact()
    return {key,token,exp}
  }
  

  /**
   * 
   * Create credential
   * 
   * @param {string} loginId - The login ID
   * @param {string} password - The password 
   * 
   */
  createCredential (loginId, password){
    debug('Create credential:%s, %s',loginId,password)    
    return this.pbkdf2({
      password
    }).then(({key:passhash,salt})=>{
      const credential={
        "_id":loginId,
        type:CREDENTIAL_TYPE,
        passhash,
        salt
      }
      return this.db.put(credential).then((result)=>{
        credential['_id']=result['id']
        credential['_rev']=result['rev']
        debug('Created credential:%o',credential)            
        return credential
      },reason=>{throw new Error(reason)})
    })
  }

  /**
   * 
   * Update credential
   * 
   * @param {string} loginId - The login ID
   * @param {string} password - The password 
   * 
   */
  updateCredential (loginId, password){
    return this.db.get(loginId).then((credential)=>{
      return this.pbkdf2({
        password
      }).then(({key:passhash,salt})=>{
        credential.passhash=passhash
        credential.salt=salt
        return this.db.put(credential).then((result)=>{
          credential['_rev']=result['rev']
          debug('Updated credential:%o',credential)            
          return credential
        },reason=>{throw reason}).catch((err)=>console.log(err))      
      })
    },reason=>{
      throw new Error(reason)
    })
  }

  /**
   * 
   * Authenticate with loginId and password
   * 
   * @param {string} loginId - The login ID
   * @param {string} password - The password 
   * @returns {string} The token to represent of the user
   */
  authenticate (loginId, password){
    debug('authenticate: %s, %s',loginId,password)
    return this.db.get(loginId).then((credential)=>{
      debug('retrieved credential:%o',credential)
      return this.pbkdf2({password:password,salt:credential.salt}).then(({key})=>{
        debug('generated key=%s',key)
        if(credential.passhash===key){
          const {token,key,exp}=this.createJwt(credential)
          debug('generated token=%s',token)
          this.db.put({
            type:JWT_TYPE,
            "_id":token,
            key
          })
          return {token,exp}    
        }else{
          throw new Error(`mismatched password ${loginId} ${password}`,loginId,password)
        }
      })},
      reason=>{
        throw new Error(reason)
      })
  }

  /**
   * 
   * Verify the token
   * 
   * @param {string} token
   * @returns {string} loginId
   */
  verify(token){
    debug('verify token=%s',token)
    return this.db.get(token).then(jwt=>{
      debug('retrieved jwt:%o',jwt)
      const claims= njwt.verify(token,jwt.key).body
      debug('verified claims: %o',claims)
      if(claims.exp>Date.now()/1000){
        debug('get sub: %s',claims.sub)
        return claims.sub
      }else{
        debug('claims is expired')
        throw new Error("Token has been expired.")
      }
    },reason=>{
      throw new Error(reason)
    })
  }  

  /**
   * 
   * Destroy the database
   * 
   */
  destroy(){
    return this.db.destroy()
  }
}

module.exports=Datastore
