/**
 * @file
 * 
 * @copyright 2018 Min Li
 * 
 */

const Security =require('../security')
const config =require('../auth.config.js')
const security=new Security(config)

test('test pbkdf2 with/without salt',(done)=>{
  const params={password:'admin'}
  security.pbkdf2(params).then(({key,salt})=>{
    expect(key).not.toBeNull()
    expect(salt).not.toBeNull()
    params.salt=salt
    const key1=key
    const salt1=salt
    security.pbkdf2(params).then(({key,salt})=>{
      expect(key).toEqual(key1)
      expect(salt).toEqual(salt1)
      done()  
    })
  })
})


test('create and verify jwt', (done) => {
  const claim={
    sub:'12345678'
  }
  const jwt=security.createJwt(claim)  
  expect(jwt).not.toBeNull()
  const {key,token}=jwt
  const sub=security.verify({token,key})
  expect(sub).toBe(claim.sub)
  done()
})
