const m = require('../manager.js')
var assert = require('assert');
const { resolve } = require('path');



//Basic Unit and Verification tests

describe("userCreate", function() {
 var user ={
     username:"harryLeg",
     password:"harrycat123",
     email:"harrison.ford@gamil.com"
 }
    it("creates new user", function() {
      assert.equal(m.userCreate(user), resolve());
    });
  
});

describe("userAuthenticate", function() {
    var user ={
        username:"harryLeg",
        password:"harrycat123"
    }
       it("creates resolves when username and password are found", function() {
         assert.equal(m.authenticateUser(user.username,user.password), resolve());
       });
     
});


