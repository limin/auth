
module.exports = {
  //server running port
  port: 3000,

  //cors' origin
  origin: "http(s)?:\/\/[localhost||limin.github.io](:[\d]+)?",

  //token time to live 1 hour
  tokenTTL: 3600,

  //Password-Based Key Derivation Function 2 (PBKDF2)
  iterations:1000,
  keylen:24,
  digest:'sha512',

  //winston logger
  logPath:"/tmp/logs",
  logLevel:"info",

  //pouch datastore's config https://pouchdb.com/api.html#create_database
  dsName:"/tmp/auth",
  dsOptions:{},
  initDataPath:"./init.json",

  //restful api end point
  apiEndpoint:"/api"
}