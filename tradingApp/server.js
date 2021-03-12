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

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/api", (req, res) => {
    const links = [];
    // This app's resources...
    links.push({ "rel": "collection", "href": "/api/users", "methods": "GET,POST,PUT,DELETE" });
    links.push({ "rel": "collection", "href": "/api/stocks", "methods": "GET,POST,PUT,DELETE" });
  
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

 

// User Related routes - works
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

//Deposit into wallet - works
app.put("/api/users/deposit/:id", (req,res)=>{
    withAuth(req.body.token)
    m.addToBalance(req.params.id, req.body.amount)
    .then(response =>{
        res.status(200).json(response)
    })
    .catch((error) =>{
        res.status(404).json({error:error.message})
        })
});

//Get just the balance - works
app.get("/api/users/getBalance/:id", (req,res)=>{
    withAuth(req.body.token)
    m.addToBalance(req.params.id)
    .then(response =>{
        res.status(200).json(response)
    })
    .catch((error) =>{
        res.status(404).json({error:error.message})
        })
})

//Buy Stock - works
app.post("/api/stocks/buy/:id", (req,res)=>{
    withAuth(req.body.token)
    m.buyShares(req.params.id,req.body.stock)
    .then(response =>{
        res.status(200).json(response)
    })
    .catch((error) =>{
        res.status(404).json({error:error.message})
    })
})

//Sell Stocks
app.put("/api/stocks/sell/:id", (req,res)=>{
    withAuth(req.body.token)
    m.sellShares(req.params.id, req.body.index)
    .then(response =>{
        res.status(200).json(response)
    })
    .catch((error) =>{
        res.status(404).json({error:error.message})
    })
})

//Not found route
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



