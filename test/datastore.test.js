/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */

const Datastore= require('../datastore')

let store=null

beforeEach(() => store=new Datastore())
afterEach(() => store.destroy())

test("create credential",(done)=>{
  store.createCredential("user1","password1").then(credential=>{
    expect(credential._id).toEqual("user1")
    expect(credential.passhash).not.toBeNull()
    expect(credential.salt).not.toBeNull()
    done()
  })
})

test("update credential",(done)=>{
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
})

test("authenticate successfully",(done)=>{
  store.createCredential("user1","password1").then(credential1=>{
    expect(credential1._id).toEqual("user1")
    expect(credential1.passhash).not.toBeNull()
    store.authenticate("user1","password1").then(token=>{
      expect(token).not.toBeNull()
      done()
    })
  })
})

test("authenticate failed",(done)=>{
  store.createCredential("user1","password1").then(credential1=>{
    expect(credential1._id).toEqual("user1")
    expect(credential1.passhash).not.toBeNull()
    store.authenticate("user1","password2").then().catch(err=>{
      expect(err.message).toMatch(/.*mismatch.*/)
      done()
    })
  })
})

test("verify successfully",(done)=>{
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
})