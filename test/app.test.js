/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */

const Datastore= require('../datastore')
const request = require('supertest')
const uuidv4 = require('uuid/v4')
const config =require('../auth.config')
let datastore=null
let app = null

beforeEach(() => {
    datastore=new Datastore({dsName:`./db/${uuidv4()}`})
    app = require('../app')(datastore)    
})
afterEach(() => {
    datastore.destroy()
})

describe(`post ${config.apiEndpoint}/credential`, ()=>{
    test('with valid input',(done)=>{
        request(app)
        .post(`${config.apiEndpoint}/credential`)
        .send({loginId: 'user1',password:'password1'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)    
        .expect(200)            
        .then((res)=>{
            const {_id,passhash,salt}=res.body
            expect(_id).not.toBeNull()
            expect(passhash).not.toBeNull()
            expect(salt).not.toBeNull()
            done()
        })
    })    
})

describe(`put ${config.apiEndpoint}/credential`, ()=>{
    test('with valid input',(done)=>{
        datastore.createCredential("user1","password1").then(credential=>{
            request(app)
            .put(`${config.apiEndpoint}/credential`)
            .send({loginId: credential._id,password:'password2'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)    
            .expect(200)            
            .then((res)=>{
                const {_id,passhash,salt}=res.body
                expect(_id).toEqual(credential._id)
                expect(passhash).not.toEqual(credential.passhash)
                expect(salt).not.toEqual(credential.salt)
                done()
            })
          })        
    })    
})

describe(`post ${config.apiEndpoint}/authenticate`, ()=>{
    test('with valid input',(done)=>{
        datastore.createCredential("user1","password1").then(credential=>{
            request(app)
            .post(`${config.apiEndpoint}/authenticate`)
            .send({loginId: credential._id,password:'password1'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)    
            .expect(200)            
            .then((res)=>{
                const {token}=res.body
                expect(token).not.toBeNull()
                done()
            })
          })        
    })    
})

describe(`get ${config.apiEndpoint}/token/:token`, ()=>{
    test('with valid input',(done)=>{
        datastore.createCredential("user1","password1").then(credential=>{
            datastore.authenticate ("user1","password1").then(({token})=>{
                request(app)
                .get(`${config.apiEndpoint}/token/${token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)    
                .expect(200)            
                .then((res)=>{
                    const {loginId}=res.body
                    expect(loginId).toEqual("user1")
                    done()
                })    
            })            
          })        
    })    
})