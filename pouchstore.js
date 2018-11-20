/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */
const debug = require('debug')('auth:pouchstore')
const PouchDB = require('pouchdb/lib')
const PouchFind = require('pouchdb-find')
PouchDB.plugin(PouchFind)
const Datastore=require('./datastore')
const Security=require('./security')

class Pouchstore extends Datastore{
  constructor(config,db){
    super()
    this.config=Object.assign({},config)    
    this.db = new PouchDB(this.config.pouchdb.path,this.config.pouchdb.options)
    this.db.createIndex({
      index: {fields: ['type']}
    })

    if(this.config.pouchdb.initDataPath){
      this.db.bulkDocs(require(this.config.pouchdb.initDataPath))      
    }
    this.security=new Security(config)
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
    return this.security.pbkdf2({
      password
    }).then(({key:passhash,salt})=>{
      const credential={
        "_id":loginId,
        loginId,
        type:Datastore.credentialType,
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
      return this.security.pbkdf2({
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
      return this.security.pbkdf2({password:password,salt:credential.salt}).then(({key})=>{
        debug('generated key=%s',key)
        if(credential.passhash===key){
          const {token,key,exp}=this.security.createJwt({sub:credential.loginId})
          debug('generated token=%s',token)
          return this.db.put({
            type:Datastore.jwtType,
            "_id":token,
            token,
            key,
            exp
          }).then(result=>{
            return {token,exp}    
          })
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
      return this.security.verify({token,key:jwt.key})
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

module.exports=Pouchstore
