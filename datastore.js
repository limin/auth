/**
 * @file
 * 
 * @copyright 2018 {@link https://limin.github.io Min Li}
 * 
 * @license Licensed under {@link https://www.apache.org/licenses/LICENSE-2.0.html Apache License 2.0}
 * 
 */
class Datastore{  
  static get credentialType() {return 'credential'}
  static get jwtType() {return 'jwt'}
  /**
   * 
   * Create credential
   * 
   * @param {string} loginId - The login ID
   * @param {string} password - The password 
   * 
   */
  createCredential (loginId, password){}

  /**
   * 
   * Update credential
   * 
   * @param {string} loginId - The login ID
   * @param {string} password - The password 
   * 
   */
  updateCredential (loginId, password){}

  /**
   * 
   * Authenticate with loginId and password
   * 
   * @param {string} loginId - The login ID
   * @param {string} password - The password 
   * @returns {string} The token to represent of the user
   */
  authenticate (loginId, password){}

  /**
   * 
   * Verify the token
   * 
   * @param {string} token
   * @returns {string} loginId
   */
  verify(token){}  

}

module.exports=Datastore
