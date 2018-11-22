/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */
const debug = require('debug')('auth:test')
const uuidv1 = require('uuid/v1')
const update=require("immutability-helper")
const Pouchstore= require('../pouchstore')
const Mongostore= require('../mongostore')
import MongoMemoryServer from 'mongodb-memory-server'
const config= update(require('../auth.config'),{pouchdb:{path:{$set:`.db-${uuidv1()}`}}})


let store=null

const testCreateCredential=(done)=>{
  store.createCredential("user1","password1").then(credential=>{
    expect(credential._id).toEqual("user1")
    expect(credential.passhash).not.toBeNull()
    expect(credential.salt).not.toBeNull()
    done()
  })
}

const testUpdateCredential=(done)=>{
  store.createCredential("user1","password1").then(credential1=>{
    expect(credential1._id).toEqual("user1")
    expect(credential1.passhash).not.toBeNull()
    store.updateCredential("user1","password2").then(credential2=>{
      expect(credential2._id).toEqual("user1")
      expect(credential2.passhash).not.toEqual(credential1.passhash)
      expect(credential2.salt).not.toEqual(credential1.salt)
      done()
    })
  })
}


const testAuthenticateSuccessfully=(done)=>{
  store.createCredential("user1","password1").then(credential1=>{
    expect(credential1._id).toEqual("user1")
    expect(credential1.passhash).not.toBeNull()
    store.authenticate("user1","password1").then(token=>{
      expect(token).not.toBeNull()
      done()
    })
  })
}

const testAuthenticateFailed=(done)=>{
  store.createCredential("user1","password1").then(credential1=>{
    expect(credential1._id).toEqual("user1")
    expect(credential1.passhash).not.toBeNull()
    store.authenticate("user1","password2").catch(err=>{
      expect(err.message).toMatch(/.*mismatch.*/)
      done()
    })
  })
}

const testVerifySuccessfully=(done)=>{
  store.createCredential("user1","password1").then(credential1=>{
    expect(credential1._id).toEqual("user1")
    expect(credential1.passhash).not.toBeNull()
    store.authenticate("user1","password1").then(({token,exp})=>{
      expect(token).not.toBeNull()
      expect(exp).not.toBeNull()
      store.verify(token).then(loginId=>{
        expect(loginId).toEqual("user1")
        done()        
      })
    })
  })
}


describe("Test pouchstore",()=>{
  beforeEach(() => store=new Pouchstore(config))
  afterEach(() => store.destroy())
  test("test create credential",testCreateCredential)  
  test("test update credential",testUpdateCredential)    
  test("test authenticate successfully",testAuthenticateSuccessfully)      
  test("test authenticate failed",testAuthenticateFailed)        
  test("test verify successfully",testVerifySuccessfully)    
})

describe("Test mongostore",()=>{
  var client=null,mongod=null,uri=null
  beforeAll(async (done)=>{
    mongod = new MongoMemoryServer()
    uri = await mongod.getConnectionString()
    done()
  })
  afterAll(()=>{
    mongod.stop()
  })
  beforeEach(async (done)  => {
    const MongoClient = require('mongodb').MongoClient      
    debug('connecting to mongodb: %s',uri)      
    client=await MongoClient.connect(uri,{ useNewUrlParser: true })
    debug('connected to mongodb: %s',uri)  
    store=new Mongostore(config,client.db(`test-auth-${uuidv1()}`))
    done()
  })

  afterEach(() => {
    //store.destroy()
    //client.close()
  })
  test("test create credential",testCreateCredential)  
  test("test update credential",testUpdateCredential)    
  test("test authenticate successfully",testAuthenticateSuccessfully)      
  test("test authenticate failed",testAuthenticateFailed)        
  test("test verify successfully",testVerifySuccessfully)    
})