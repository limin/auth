
module.exports = {
  httpServer:{
    port: 3000,
    origin: "http(s)?:\/\/[localhost||limin.herokuapp.com||limin.github.io](:[\d]+)?",
    //restful api end point
    apiEndpoint:"/api",
  },
  // Password-Based Key Derivation Function 2
  pbkdf2:{
    iterations: 1000,
    keylen: 24,
    digest: "sha512"
  },
  token:{
      //10 hours in seconds
      ttl: 36000
  },

  logger:{
    path:".",
    level:"info"
  },   

  db:"pouchdb",

  pouchdb:{
      path:".db",
      options:{},
      initDataPath:"./init.json"
  },

  mongodb:{
      url:"mongodb://localhost:27017"
  },

}
