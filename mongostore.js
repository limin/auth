/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */
const debug = require('debug')('auth:mongostore')
const Datastore=require('./datastore')
const Security=require('./security')

class Mongostore extends Datastore{
  constructor(config,db){
    super()
    this.config=Object.assign({},config)    
    this.db = db
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
        _id:loginId,
        loginId,
        passhash,
        salt
      }

      const col = this.db.collection(Datastore.credentialType)
      return col.insertOne(credential).then(r=>{
        debug('Created credential:%o',credential)                  
        return credential      
      },err=>{
        debug('Created credential error:%o',err)            
        throw new Error(err)
      })
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
    const col = this.db.collection(Datastore.credentialType)    
    return new Promise(resolve=>{
      col.find({"_id" : loginId}).next((err,credential)=>{
        this.security.pbkdf2({
          password
        }).then(({key:passhash,salt})=>{
          credential.passhash=passhash
          credential.salt=salt
          col.updateOne({"_id" : loginId},{$set:{passhash,salt}}).then(r=>{
            debug('Updated credential:%o',credential)            
            resolve(credential)  
          })         
        })
      })
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
    const col = this.db.collection(Datastore.credentialType)   
    return new Promise((resolve,reject)=>{
      col.find({"_id" :loginId}).next((err,credential)=>{
        debug('retrieved credential:%o',credential)
        this.security.pbkdf2({password:password,salt:credential.salt}).then(({key})=>{
          debug('generated key=%s',key)
          if(credential.passhash===key){
            const {token,key,exp}=this.security.createJwt({sub:credential.loginId})
            debug('generated token=%s',token)
            const jwtCol=this.db.collection(Datastore.jwtType)
            jwtCol.insertOne({
              "_id":token,
              token,
              key,
              exp
            }).then(result=>{
              resolve({token,exp})     
            })
          }else{
            reject(new Error(`mismatched password ${loginId} ${password}`,loginId,password))
          }
        })},
        reason=>{
          throw new Error(reason)
        })  
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
    const jwtCol=this.db.collection(Datastore.jwtType)
    return new Promise(resolve=>{
      jwtCol.find({"_id":token}).next((err,jwt)=>{
        debug('retrieved jwt:%o',jwt)
        resolve(this.security.verify({token,key:jwt.key}))
      },reason=>{
        throw new Error(reason)
      })  
    })
  }  

  destroy(){
    this.db.dropDatabase()
  }
}

module.exports=Mongostore
