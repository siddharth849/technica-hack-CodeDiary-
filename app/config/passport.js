const LocalStrategy=require("passport-local").Strategy
const User=require("../models/user");
const bcrypt=require("bcrypt");

const init=(passport)=>{
    passport.use(new LocalStrategy({usernameField:"name"},async(name,password,done)=>{
        const user= await User.findOne({name:name});
        if(!user){
            return done(null,false,{message:"No user with this name"})
        }

        bcrypt.compare(password,user.password).then(match=>{
            if(match){
                return done(null,user,{message:"Logged in Successfully"})
            }
            return done(null,false,{message:"Wrong password or name"})
        }).catch(err=>{
            return done(null,false,{message:"Something went wrong"})
        })
    }))

    //Storing users data 
    passport.serializeUser((user,done)=>{
        done(null,user._id);
    })

    // fetching users data
    passport.deserializeUser((id,done)=>{
        User.findById(id,(err,user)=>{
            done(err,user);
        })
    })

}

module.exports=init;