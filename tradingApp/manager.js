// Data service operations setup
const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//Schema Setups
const userSchema = require('./msc_users.js');
const stockSchema = require('./msc_stocks.js');
const { resolve } = require('path');

module.exports = function() {

    let user;
    let stocks;

    return{


        connect: function() {
            return new Promise((resolve, reject) =>{
                // Create connection to the database
                console.log('Attempting to connect to the database...');

                //MongoDB connection link
                mongoose.connect('mongodb+srv://dbUser2:Clippers@cluster0.wpsdo.mongodb.net/Stocks?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true})
                
                var db = mongoose.connection;

                db.on('error', (error) => {
                    console.log('Connection error:', error.message);
                    reject(error);
                });

                db.once('open', () => {
                    console.log('Connection to the database was successful');
                    user= db.model("user", userSchema, "user");
                    stocks = db.model("stocks", stockSchema, "stocks");
                    resolve();
                });
                
            });
        },


    
        //Create a new user
        userCreate: function(newUser){
            return new Promise((resolve,reject) =>{
                user.create(newUser, function(err, item) {
                    if (err) {
                        return reject(console.error(err));
                    }
                     for(i in item.holdings){
                         item.balance+= item.holdings.value
                     }
                        item.save();
                        return resolve(item);
                });
            });
        },

        //Authenticate
        authenticateUser: function(name, pass) {
            return new Promise((resolve, reject) =>{
                user.findOne({"username": { "$regex": name, "$options": "i"}}, 
                 function(err,item){
                    if(err)
                        return reject({message:"failed to find match"})
                    if (item){
                        if(pass.password===item.password)
                          return resolve(item);
                        else
                            console.log('failed')
                            return reject();
                    }  
                })
            });
        },

        //Find User and increase balance size
        addToBalance: function(u_id, amount){
            return new Promise((resolve,reject)=>{
                user.findByIdAndUpdate(u_id, { $inc: {balance: amount}}, {new:true}, (error, item) => {
                    if (error) {
                        return reject(error);
                    }
                    else{
                       
                        return resolve(item);
                        
                    }
                })})
        },

        getBalance: function(u_id){
            return new Promise((resolve,reject) =>{
                user.findById
                ( u_id, (error,item) =>{
                    if(error){
                        console.log(error)
                        return reject(error);
                    }else{
                        return resolve(item.balnce)
                    }
            })})
        },

        //Buying shares involves 3 steps
        //(1) - finding the user, (2) - linking the purchase to the user
        //(3) - Adjusting the numbers
        buyShares: function(user_id,stockHldg){
            return new Promise((resolve,reject)=>{
                    console.log(stockHldg)
                    user.findById( user_id, 
                    function(err,item){
                       if(err){
                            console.log(err)
                           return reject(err)
                       }
                       else{
                           console.log(item)
                           item.holdings.push(stockHldg)
                           return resolve(item.holdings)
                       }
                    })});
                
        },

        //Selling Shares involves  steps
        //1 - find the user 2 - use the index to extract the holding value
        //3 - adjust the balance by the holdings value
        //I cannot for the life of me figure out why this function won't work

        sellShares: function(u_id, index){
          return new Promise((resolve,reject) =>{
              user.findById( u_id, function(err,item) {
                       if(err)
                           return reject(error)
                       else{
                         console.log(item)
                         let temp = item.holdings[index];
                         item.balance+= temp.value;
                         item.holdings.splice(index, index+1);
                         return resolve(item);
                       }
                    })})
        },

    }

}


 