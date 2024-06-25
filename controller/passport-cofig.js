import dotenv from 'dotenv';
// dotenv.config({path:"../.env"});
dotenv.config();

import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";


import User from "../db/userModel.js";

passport.use("local",
    new Strategy(async function verify(username, password, cb) {
        try {
            const result = await User.findByEmail(username);
            if (result.rows.length === 0) {
                return cb(null, false, { message: "User not found" });
            } else {
                const user = result.rows[0];
                const storedHashedPassword = user.password;
                // console.log("this is from login passport", user);
                bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                    if (err) {
                        console.error("ERROR COMPARING PASSWORDS: ", err);
                        return cb(err);
                    } else {
                        if (valid) {
                            return cb(null, user);
                        } else {
                            return cb(null, false);
                        }
                    }
                })
            }
        } catch (error) {
            console.log(error);
            return cb(error);
        }
    }))


passport.use("google",
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/user/auth/google/secrets",
        userProfileURL: "https://googleapis.com/oauth2/v3/userinfo",
    }, async (accessToken, refreshToken, profile, cb) => {
        // console.log(profile);
        try {
            const result = await User.findByEmail(profile.email);
            if (result.rows.length === 0) {
                const newUser = await User.create({
                    name: profile.displayName,
                    email: profile.email,
                    hash: "google",
                    otp: 111111,
                });
                cb(null, newUser.rows[0]);
            } else {
                // already existing user 
                cb(null, result.rows[0])
            }
        } catch (error) {
            cb(error);
        }
    })
)


passport.serializeUser((user, cb) => {
    cb(null, user);
})

passport.deserializeUser((user, cb) => {
    try {
        cb(null, user);
    } catch (error) {
        cb(error);
    }
})

export default passport;

