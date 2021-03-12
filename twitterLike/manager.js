// Data service operations setup
const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//Schema Setups
const userSchema = require('./msc_users.js');
const tweetSchema = require('./msc_tweets.js');
const { resolve } = require('path');

module.exports = function() {
    let user;
    let tweet;
    
    

    return {
         connect: function() {
            return new Promise((resolve, reject) =>{
                // Create connection to the database
                console.log('Attempting to connect to the database...');

                //MongoDB connection link
                mongoose.connect('mongodb+srv://dbUser2:Clippers@cluster0.wpsdo.mongodb.net/TwitterStyle?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true})
                
                var db = mongoose.connection;

                db.on('error', (error) => {
                    console.log('Connection error:', error.message);
                    reject(error);
                });

                db.once('open', () => {
                    console.log('Connection to the database was successful');
                    user= db.model("user", userSchema, "user");
                    tweet = db.model("tweet", tweetSchema, "tweet");
                    resolve();
                });
                
              });
            },
        

          //Get All Tweets on the app (Read a tweet)
           getAllTweets: function(){
            return new Promise((resolve,reject)=>{
                tweet.find()
                  .sort({date: -1})
                  .exec((error, items) => {
                    if (error) {
                      // Query error
                      return reject(error);
                    }else
                    // Found, a collection will be returned
                    return resolve(items);
                  });
            })
          },

         //Create a Tweet
          createNewTweet: function(tweetPacket) {
                return new Promise(function (resolve, reject) {
                    tweet.create(tweetPacket, (error, item) =>{
                        if(error){
                            console.log(error);
                            return reject(error);
                        }
                        else{
                               
                             return resolve(item);
                        }
                     })
                });

            },

            //update a tweet 
            findAndChangeTweet: function(_id,newMessage){
                return new Promise((resolve,reject)=>{
                    tweet.findByIdAndUpdate(_id, newMessage, {new:true}, (error, item) => {
                        if (error) {
                            return reject(err.message);
                        }
                        else{
                            console.log(item)
                            return resolve(item);

                        
                    }});
                });
            },

            //Liking a tweet
            
           likesIncrimentor: async function(t_id){
            return new Promise(function (resolve, reject) {
                let process;
                process = tweet.update({ '_id': t_id}, { $inc: { likes: 1 } }, { new: true });
                process.exec((error, resultQuery) => {
                   if (error)
                       return reject(error);
                   else if (resultQuery.ok == 1)
                       return resolve();
                   else
                       return reject(`Tweet could not be liked.`);
                  }); 
              });

          },

            //Retweeting
            retweet: function(tweet_id, username){
                let process2
                return new Promise(function (resolve,reject){
                    tweet.findById
                    ( tweet_id, (error,item) =>{
                        if(error){
                            console.log(error)
                            return reject(error);
                        }else{
                            //Essentially a retweet is a tweet inside of a tweet
                            //So we make a new tweet and store the retrieved tweet inside it
                            item.retweets++;
                            console.log(item)
                            retweet = {
                                "username": username,
                                "date": new Date(),
                                "message": item,
                                "likes": 0,
                                "retweets": 0,
                                "linkedTo": item._id 
                            }
                            tweet.create((retweet),(error,item) =>{
                                if(error){
                                    console.log(error)
                                    return reject(error)
                                }
                                else{
                                    return resolve(item)
                                }
                            })
                       }
                   
                    })
                })
            
                
            },

            //Delete a tweet
            findAndDelete:  function(tweet_id) {
             return new Promise((resolve, reject) =>{
                tweet.findByIdAndRemove((tweet_id), (err) =>{
                    if(err){
                        console.log('Tweet not found');
                        return reject(error);
                    }
                    else{
                        console.log('Deleted')
                        return resolve();
                    }
                 })

                });
            },

            //User Functions

            //Create a new user
            userCreate: function(newUser){
                return new Promise((resolve,reject) =>{
                    user.create(newUser, function(err, item) {
                        if (err) {
                            return reject(console.error(err));
                        }
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
            }

            
    }

        
}


