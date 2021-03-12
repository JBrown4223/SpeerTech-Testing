const express = require("express");
const cors = require("cors");
const path = require("p");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const HTTP_PORT = process.env.PORT || 8080;


// Add support for incoming JSON entities
const app = express();
app.use(bodyParser.json());
// Add support for CORS - i can create a whitelist for specific ip addresses if need be 
app.use(cors());

//////////////////////////////////////////////////////////////

//Access to all the fun functionality
const manager = require('./manager');
const m = manager();

//Access to authentication aspect
const withAuth = require('./middleware.js');
const { response } = require("express");
const secret = 'mysecretsshhh';
const tokenTime = 43200
var portNum = 3000;

////////////////////////////////////////////////////////////////

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/api", (req, res) => {
    const links = [];
    // This app's resources...
    links.push({ "rel": "collection", "href": "/api/users", "methods": "GET,POST,PUT,DELETE" });
    links.push({ "rel": "collection", "href": "/api/tweets", "methods": "GET,POST,PUT,DELETE" });
  
    const linkObject = { 
      "apiName": "TwitterLike API",
      "apiDescription": "Web API",
      "apiVersion": "1.0", 
      "apiAuthor": "Jonathan Brown",
      "links": links
    };
    res.json(linkObject);
  });

  app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Origin: http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });

  //================= User Routes =============//
  //Add New User - works
 app.post("/api/users/add", (req,res)=>{
        m.userCreate(req.body)
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            res.status(500).json({ "message": error });
        })
   });

 
 //Authenticate User -works
 app.post("/api/users/auth/:id", (req,res)=>{
    username = req.params.id;
    m.authenticateUser(username,req.body)
    .then((data) =>{
          const token = jwt.sign({username}, secret, {
            expiresIn: tokenTime
          });
          res.status(200).json({token: token});
          console.log(data);
    })
    .catch((error) =>{
        res.status(500).json({error:error.message});
    })
});

//create tweet - works
app.post("/api/tweets/send/:id",(req,res) =>{
    
    withAuth(req.body.token)
    m.createNewTweet(req.body.tweet)
    .then(response =>{
        res.status(200).json(response)
    })
    .catch((error) =>{
        res.status(404).json({error:error.message})
        })
       
       
});

//Edit a tweet - works
app.put("/api/tweets/update/:id", (req,res) =>{
    withAuth(req.body.token)
    m.findAndChangeTweet(req.params.id,req.body.tweet)
        .then(response =>{
            res.status(200).json(response)
        })
        .catch((error) =>{
            res.status(404).json({'message': error.message})
        })
    
    .catch((error) =>{
        res.status(404).json({'message': error.message})
    })
    
});


//Liking a tweet - works
app.put("/api/tweets/like/:id", (req,res)=>{
    withAuth(req.body.token)
    m.likesIncrimentor(req.params.id)
    .then(response =>{
        res.status(200).json(response)
    })
    .catch((error) =>{
        res.status(404).json({'message': error.message})
    })
})

app.put("/api/tweets/retweet/:id", (req,res)=>{
    withAuth(req.body.token)
    m.retweet(req.params.id,req.body.username)
    .then(response =>{
        res.status(200).json(response)
    })
    .catch((error) =>{
        res.status(404).json({'message': error.message})
    })
})


//delete a tweet -works
app.delete("/api/tweets/delete/:id", (req,res) =>{
    withAuth(req.body.token)
    m.findAndDelete(req.params.id)
      .then(() => {
        res.status(204).end();
        })
        .catch((error)=>{
            res.status(400).json({'message': error.message})
        })
   
});

//Get all tweets ( Homepage or Opening app screen) - works
app.get("/api/tweets", (req,res)=>{
    m.getAllTweets()
      .then( response =>{
        res.status(200).json(response)
    })
    .catch((error) =>{
        res.status(404).json(error.message)
    })
});


//Not found
app.use((req, res) => {
    res.status(404).send("Resource not found");
  });

m.connect().then(() => {
    app.listen(HTTP_PORT, () => { console.log("Ready to handle requests on port " + HTTP_PORT) });
  })
  .catch((err) => {
      console.log("Unable to start the server:\n" + err);
      process.exit();
 });
