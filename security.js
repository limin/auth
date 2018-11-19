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
const debug = require('debug')('auth:security')

class Security{
  constructor(config){
    this.config=Object.assign({},config)  
    this.keys = []
    for(let i=0;i<10;i++){
      this.keys[i]=secureRandom(256, {type: 'Buffer'}).toString('base64')
    }          
  }
  /**
   * 
   * @param {object} param {password,salt}
   */
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
      crypto.pbkdf2(password, salt, this.config.pbkdf2.iterations, this.config.pbkdf2.keylen, this.config.pbkdf2.digest, callback)
    })
  }

  /**
   * Create jwt
   * @param {object} claims {sub}
   */
  createJwt({sub}){
    const exp=Date.now()/1000+this.config.token.ttl
    const claims={
      iss:'auth', 
      sub,
      exp
    }  
    const key=this.keys[Math.floor(Math.random()*10)]
    const token = njwt.create(claims,key).compact()
    return {key,token,exp}
  }

  /**
   * 
   * Verify the token
   * 
   * @param {object} jwt {token,key}
   * @returns {string} loginId
   */
  verify({token,key}){
    debug('verify token=%s, key=%s',token,key)
    const claims= njwt.verify(token,key).body
    debug('verified claims: %o',claims)
    if(claims.exp>Date.now()/1000){
      debug('get sub: %s',claims.sub)
      return claims.sub
    }else{
      debug('claims is expired')
      throw new Error("Token has been expired.")
    }    
  }
}

module.exports=Security