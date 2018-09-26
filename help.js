/**
 * @file
 * 
 * @copyright 2018 Min Li
 * 
 */

const html = `
  <pre>
    Welcome to the RESTful API!

    Use an Authorization header to work with your own data:

    fetch(url, { headers: { 'Authorization': 'token you get from login api' }})

    The following endpoints are available:

    POST /lmppd/api/login
      USAGE:
        Login to retrieve token

      FORMAT: json

      PARAMS: 
        _id - String: login account id
        password - String: login password

        e.g.
        {
          "_id": "admin",
          "password": "admin"
        }

      EXAMPLE:
        curl -X POST -H 'Content-Type: application/json' -d '{"_id":"admin","password":"admin"}' https://limin.herokuapp.com/lmppd/api/login

      RETURNS:
        token - token to be used in the api call
        user - the user data of current user

        e.g.
        {
          "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjYifQ.eyJpc3MiOiJsbXBwZCIsInN1YiI6Ii91c2VyL2FkbWluIiwic2NvcGUiOlsic2VsZiJdLCJleHAiOjE1MzUzMzYyNDMsImp0aSI6ImM1N2NmOThhLWU5NzMtNDQ0NC05MzE2LWFmOTkyYzNjNDY2ZSIsImlhdCI6MTUzNTMzMjY0M30.dojhqqDfem7M4MIlVKeuyKHckpJZODwgqbBW49LbuLQ",
          "user": {
            "type": "user",
            "name": "admin",
            "organization": {
              "_id": "a7c69640-9c70-11e8-9750-3da597856c91"
            },
            "passhash": "308087e13d0ce05dac48ccdf05625113b5ace964404a7955",
            "salt": "JAFMZWZfXljFMDDtEP4+q5osFYtwbVOp9b6xRQYaFZY0WZdVtSed1tLb0ybFeTSZ7tJoepLmh32axQ/lUW1Y2ikChcGjgih1lXMyKY9esLX1KyqqEiqySRB7Oqr1qhS2OzTBa/WFeoJEzS1CC3+KVOyD5DXyGfySQTpbbVptLqJtIm3Ht/OdnRpb6yvZEbTPPaqa//IVcoSzOzWfvAyhf4/tX/j9wAw8vLb1dmwf4Mf2pm99Zipw+WMa3ychBd/KhufLGFVHBcLfFDXf/65BoclYH2BldH58q5m5Cem0bnR5h1or4qQIBr+sGiYvgErDW1QCqzoXcwueQ7u24EXNTA==",
            "permissions": [
              "CreateProduct",
              "ReadProduct",
              "UpdateProduct",
              "DeleteProduct",
              "CreateFunction",
              "ReadFunction",
              "UpdateFunction",
              "DeleteFunction",
              "CreateOrganization",
              "ReadOrganization",
              "UpdateOrganization",
              "DeleteOrganization",
              "CreateLicense",
              "ReadLicense",
              "UpdateLicense",
              "DeleteLicense",
              "CreateUser",
              "ReadUser",
              "UpdateUser",
              "DeleteUser"
            ],
            "_id": "admin",
            "_rev": "1-f96e006b8b1e0ddd37e422aeed90a073"
          }
        }        


    GET /lmppd/api/license
      USAGE:
        Get license

      FORMAT: json
      
      Header:        
        authorization - String: token got from login api

        e.g.
        {
          "name": "authorization",
          "value": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJsbXBwZCIsInN1YiI6Ii91c2VyL0pMQkxWVzgzTTciLCJzY29wZSI6WyJzZWxmIl0sImV4cCI6MTUzNTMzNzA2MiwianRpIjoiMGI4NWVlMjYtODkzMS00NTY2LWI2ODgtNGM0ZjQ5MDM0ODc0IiwiaWF0IjoxNTM1MzMzNDYyfQ.Gpq2zvi9nLJ61EM3RV22Evcr97RDuZ5eug1heaUmQaE"
        }        

      PARAMS:
        json - String: query string in json format

        e.g.
        https://limin.herokuapp.com/lmppd/api/license?json={"selector":{"key": "JLLU3NK9S3-EILZKJXZ7M-DTBEOMF815"}}

      Example
        curl -X GET -H 'Authorization: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjUifQ.eyJpc3MiOiJsbXBwZCIsInN1YiI6Ii91c2VyL2FkbWluIiwic2NvcGUiOlsic2VsZiJdLCJleHAiOjE1MzU5NTU1MjIsImp0aSI6IjExODUxNGVhLWVkZTYtNGMzOC04OWM5LTdhNWFhYzVlZTBjZCIsImlhdCI6MTUzNTk1MTkyMn0.zzJYp8cJEngGJwxT-aM3kYJU8wFKhzushnI7HTfpzPw' https://limin.herokuapp.com/lmppd/api/license?json=%7B%22selector%22%3A%7B%22key%22%3A+%22JLLU3NK9S3-EILZKJXZ7M-DTBEOMF815%22%7D%7D

      RETURNS:        
        license object
        
        e.g.
        {
          "product": {
            "_id": "8dfcacb0-a998-11e8-9c2a-dd04ca1cf0a0"
          },
          "assignments": [
            {
              "organization": {
                "_id": "97659460-a998-11e8-9c2a-dd04ca1cf0a0"
              },
              "validityTerm": 30,
              "validityFrequency": 5,
              "onlineTerm": 7
            }
          ],
          "key": "JLBLUBK4A7-8F5JB188F3-7R125GEZFQ",
          "timestamp": 1535333361412,
          "deleted": false,
          "status": "pending",
          "binding": {},
          "type": "license",
          "_id": "9fb14c40-a998-11e8-9c2a-dd04ca1cf0a0",
          "_rev": "1-39827a747666a85d1280a935915f7ae7"
        }
  

    PUT /lmppd/api/license
      USAGE:
        Update license

      FORMAT: json
      
      Header:        
        authorization - String: token got from login api

        e.g.
        {
          "name": "authorization",
          "value": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJsbXBwZCIsInN1YiI6Ii91c2VyL0pMQkxWVzgzTTciLCJzY29wZSI6WyJzZWxmIl0sImV4cCI6MTUzNTMzNzA2MiwianRpIjoiMGI4NWVlMjYtODkzMS00NTY2LWI2ODgtNGM0ZjQ5MDM0ODc0IiwiaWF0IjoxNTM1MzMzNDYyfQ.Gpq2zvi9nLJ61EM3RV22Evcr97RDuZ5eug1heaUmQaE"
        }        

      PARAMS:
        binding.ip - String: IP address 
        binding.deviceId - String: device id 

        e.g.
        {
          "product": {
            "_id": "8dfcacb0-a998-11e8-9c2a-dd04ca1cf0a0"
          },
          "assignments": [
            {
              "organization": {
                "_id": "97659460-a998-11e8-9c2a-dd04ca1cf0a0"
              },
              "validityTerm": 30,
              "validityFrequency": 5,
              "onlineTerm": 7
            }
          ],
          "key": "JLBLUBK4A7-8F5JB188F3-7R125GEZFQ",
          "timestamp": 1535333361412,
          "deleted": false,
          "status": "active",
          "binding": {
            "ip": "192.168.3.1",
            "deviceId": "N1MBWY7JEC-8M614VA2-SCOPZR2M35"
          },
          "type": "license",
          "_id": "9fb14c40-a998-11e8-9c2a-dd04ca1cf0a0",
          "_rev": "1-39827a747666a85d1280a935915f7ae7",
          "activatedTimestamp": 1535333515621
        }

        EXAMPLE:
          curl -X POST -H 'Content-Type: application/json' -d '{...,"binding": { "ip": "192.168.3.1", "deviceId": "N1MBWY7JEC-8M614VA2-SCOPZR2M35"},...}' https://limin.herokuapp.com/lmppd/api/license

 </pre>
  `
module.exports = html
