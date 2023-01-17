require("dotenv").config();        // for environmental variables  // should be above
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();



app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({                                      //important to place it here
secret: "Our little secret",
resave: false,
saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


main().catch(err => console.log(err));
 
async function main() {
    
  await mongoose.connect('mongodb://localhost:27017/userDB');
  mongoose.set('strictQuery', false);
  console.log("Connected");

const userSchema = new mongoose.Schema({                          // It is so beacause we are using encryption
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);                        // for hashing and salting

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());                             // for authenticate

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login")
});

app.get("/register", function(req, res){
   res.render("register");
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login")
    }
});

app.get("/logout", function(req, res){
    res.logout();
    res.redirect("/");
});

app.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password, function(err, user){     // it comes from passport local mongoose, instead of creating saving new user
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
   
   
});

app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){                          //It comes from passport
        if (err){
            console.log(err);
        } else {
            password.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});











app.listen(3000, function(){
    console.log("Server started in port 3000");
});

}