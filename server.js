const express=require("express")
require('dotenv').config()
const mongoose=require("mongoose");
const url="mongodb://localhost:27017/diary"

const app=express()
const ejs=require("ejs")
const path=require("path")
const expressLayouts=require("express-ejs-layouts")

const User=require("./app/models/user");
const session=require("express-session");
const flash=require("express-flash");
const MongoDbStore = require('connect-mongo')(session)
const bcrypt=require("bcrypt");
const passport=require("passport");

//diaries
 diaries=[]


//Database
mongoose.connect(url, { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify : true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connection failed...')
});



//session store
let mongostore=new MongoDbStore({
    mongooseConnection:connection,
    collection:"sessions"
})

//session config
app.use(session({ cookie: { maxAge: 60000 }, 
    secret: 'woot',
    store:mongostore,
    resave: false, 
    saveUninitialized: false}));

//Passport Config
const passportInit=require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize())
app.use(passport.session())

//Assets
app.use(flash());
app.use(express.static("public"));
app.use(express.urlencoded({extended:false}))
app.use(express.json());

//Global middleware
app.use((req,res,next)=>{
    res.locals.session=req.session
    res.locals.user=req.user
    next()
})


app.get("/",(req,res)=>{
    res.render("home");
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/login",async(req,res,next)=>{
    const name=req.body.name
    const password=req.body.password
    if(!name || !password) {
        req.flash('error', 'All fields are required')
        return res.redirect('/login')
    }
    passport.authenticate('local', (err, user, info) => {
        if(err) {
            req.flash('error', info.message )
            return next(err)
        }
        if(!user) {
            req.flash('error', info.message )
            return res.redirect('/login')
        }
        req.logIn(user, (err) => {
            if(err) {
                req.flash('error', info.message ) 
                return next(err)
            }

            return res.redirect("/")
        })
    })(req, res, next)

})

app.get("/register",(req,res)=>{
    res.render("register")
})

app.post("/register",async(req,res)=>{
    const name=req.body.name;
    const password=req.body.password;
    const email=req.body.email;
    if(!name || !email || !password){
        req.flash("error","All the fields are required");
        req.flash("name",name);
        req.flash("email",email);
        res.redirect('/register');
    }

    User.exists({email:email},async(err,result)=>{
        if(result){
            req.flash("error","Email already taken");
            req.flash("name",name);
            req.flash("email",email);
            res.redirect("/register");
        }
    })

    const hashed= await bcrypt.hash(password,10);

    const user=new User({
        name:name,
        email:email,
        password:hashed
    })
    user.save().then((user) => {
        console.log("User inserted Sucessfully");
        return res.redirect('/')
     }).catch(err => {
         console.log("Unable to insert User")
        req.flash('error', 'Something went wrong')
            return res.redirect('/register')
     })
})

app.get("/leisureBox",(req,res)=>{
    res.render("tools");
})


app.get("/logout",(req,res)=>{
    req.logOut()
    res.redirect("/login")
})

app.get("/tools",(req,res)=>{
    res.render("tools")
})

app.get("/compose",(req,res)=>{
    res.render("compose",{diaries:diaries});
})

app.post("/compose",(req,res)=>{
    const title=req.body.title
    const content=req.body.content

    const diary={
        title:title,
        content:content
    }
    diaries.push(diary);

})

//Template engine
app.use(expressLayouts);
app.set("views",path.join(__dirname,"/resources/views"));
app.use(express.json());
app.set('view engine', 'ejs')



//Starting the server
app.listen(3000,()=>{
    console.log("Server listening on port 3000");
})

