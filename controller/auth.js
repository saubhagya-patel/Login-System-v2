import pg from "pg";
import bcrypt from "bcrypt";

import passport from "../controller/passport-cofig.js"
import User from "../db/userModel.js";
import { sendMail } from "./otp-sender.js";

const saltRounds=10;

export function renderHomePage(req,res) {
    res.render("home.ejs");
}

export function renderLoginPage(req,res) {
    const message = req.query.message;
    res.render("login.ejs",{message});
} 

export function loginUser(req, res, next){
    passport.authenticate("local", {
        successRedirect: "/user/result",
        failureRedirect: "/user/login/?message=Invalid%20credentials.%20Try%20again,%20or%20use%20login%20via%20google.",
    })(req, res, next)
}

export function renderSignupPage (req,res) {
    const message = req.query.message;
    res.render("signup.ejs",{message});
}

export async function signupUser(req,res) {
    const name = req.body.name;
    const email = req.body.username;
    const password = req.body.password;
    try {
        const checkUserRegistered = await User.findByEmail(email);
        if(checkUserRegistered.rows.length > 0) {
            res.redirect("/user/login/?message=User%20already%20registered.%20Please%20login.")
        }else {
            const otp = await sendMail(email);
            bcrypt.hash(password, saltRounds, async function(err, hash) {
                console.log(`the otp sent to mail is = ${otp}`);
                if(err) {
                    console.error("ERROR HASHING PASSWORD : ",err);
                    res.status(500).send("Internal Server Error");
                }
                else {
                    const result = await User.create({ name, email, hash, otp });
                    const user = result.rows[0];
                    res.redirect(`/user/verifyotp/?message=${email}`);
                }
            }) 
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

export function renderVerifyOtpPage(req,res) {
    const email = req.query.message;
    res.render("verifyotp.ejs",{email});
}

export async function verifyOtp(req,res) {
    const email = req.body.username;
    const enteredOtp = parseInt(req.body.otp);
    try {
        const result = await User.findByEmail(email);
        if(result.rows.length === 0) {
            res.status(404).render("/user/signup/?message=Sorry%20some%20error%20occurred.%20Try%20again.")
        }else {
            const user = result.rows[0]
            if(user.otp === enteredOtp) {
                req.login(user,(err) => {
                    if(err) console.log(err);
                    res.redirect("/user/result");
                })
            }else {
                const result = await User.delete(email);
                res.redirect("/user/signup/?message=Sorry%20incorrect%20OTP.%20Try%20again.")
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

export function loginWithGoogle(req, res, next) {
    passport.authenticate("google", {
        scope:["profile","email"],
    })(req, res, next)
}

export function authenticateWithGoogle(req, res, next) {  
    passport.authenticate("google", {
        successRedirect: "/user/result",
        failureRedirect: "/user/login/?message=Internal%server%20error.%20Try%20again."
    })(req, res, next)
}

export function displayResultPage(req,res) {
    // console.log("Result=",req.user)
    if(req.isAuthenticated()) {
        res.render("result.ejs");
    }else {
        res.redirect("/user/login");
    }
}

export function logoutUser(req,res) {
    req.logout((err)=> {
      if(err) console.log(err);
      res.redirect("/user");
    })
}