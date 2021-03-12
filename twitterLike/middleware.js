const { response } = require('express');
const jwt = require('jsonwebtoken');
const secret = 'mysecretsshhh';

  const withAuth = function(token) {    
      jwt.verify(token, secret, function(err, decoded){
        if(decoded){
          console.log(decoded)
          return decoded;
        }
        if(err)
          console.log(err)
          return err;
      });
  }
  
module.exports = withAuth;