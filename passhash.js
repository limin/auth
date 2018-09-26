#!/usr/bin/env node

/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */


const {pbkdf2} =require('./security/crypto')
const argv=require('yargs').argv

//usage: node passhash.js --password=admin --salt=xxxxxx  
const password=argv.password||'admin'
const params={password}
if(argv.salt){
    params.salt=argv.salt
}
pbkdf2(params).then(({key,salt})=>{
    console.info({password,passhash:key,salt})    
})
