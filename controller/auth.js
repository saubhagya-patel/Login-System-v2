import pg from "pg";
import bcrypt from "bcrypt";

import passport from "../controller/passport-cofig.js"
import User from "../db/userModel.js";
import { sendMail, sendPasswordResetOtp } from "./otp-sender.js";

const saltRounds = 10;

export function renderHomePage(req, res) {
    res.render("home.ejs");
}

export function renderLoginPage(req, res) {
    const message = req.query.message;
    res.render("login.ejs", { message });
}

export function loginUser(req, res, next) {
    passport.authenticate("local", {
        successRedirect: "/user/result",
        failureRedirect: "/user/login/?message=Invalid%20credentials.%20Try%20again,%20or%20use%20login%20via%20google.",
    })(req, res, next)
}

export function renderForgotPasswordPage(req, res) {
    res.render("forgot-password.ejs")
}

const otpStore = {};

export async function postForgotPassword(req, res) {
    const email = req.body.username;
    try {
        const checkUserRegistered = await User.findByEmail(email);
        if (checkUserRegistered.rows.length === 0) {
            return res.status(404).render("/user/signup/?message=User%20not%20registered.%20Try%20again.")
        } else {
            const otp = 123123;
            if (otp !== -1) {
                const expires = Date.now() + 300000;
                otpStore[email] = { otp, expires };
                console.log(otpStore)
                return res.render("reset-password.ejs", { email })
            }
            else {
                return res.status(500).send("Internal Server Error");
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
}

export async function resetPassword(req, res) {
    console.log(otpStore)
    const email = req.body.username;
    const otp = req.body.otp;
    const password = req.body.password;
    const storedOtp = otpStore[email];

    if (!storedOtp) {
        return res.status(400).redirect("/user/login/?message=OTP%20has%20expired%20or%20is%20invalid.1")
    }

    const { otp: validOtp, expires } = storedOtp;
    console.log(parseInt(otp) !== parseInt(validOtp))
    console.log(otp, validOtp)
    console.log(Date.now() > expires);
    console.log(Date.now(), expires);
    if (parseInt(otp) !== parseInt(validOtp) || Date.now() > expires) {
        return res.status(400).redirect("/user/login/?message=OTP%20has%20expired%20or%20is%20invalid.2")
    }

    try {
        const user = await User.findByEmail(email);
        if (user.rows.length === 0) {
            return res.status(400).render("/user/signup/?message=User%20not%20registered.%20Try%20again.")
        }
        bcrypt.hash(password, saltRounds, async function (err, hash) {
            if (err) {
                console.error("ERROR HASHING PASSWORD : ", err);
                return res.status(500).send("Internal Server Error");
            }
            else {
                try {
                    const result = await User.updatePassword({ email, hash });
                    delete otpStore[email];
                    return res.status(200).redirect("/user/login/?message=Password%20updated%20successfully.%20Please%20login.");
                } catch (updateError) {
                    console.error("Error updating password: ", updateError);
                    return res.status(500).send("Internal Server Error");
                }
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
}

export function renderSignupPage(req, res) {
    const message = req.query.message;
    res.render("signup.ejs", { message });
}

export async function signupUser(req, res) {
    const name = req.body.name;
    const email = req.body.username;
    const password = req.body.password;
    try {
        const checkUserRegistered = await User.findByEmail(email);
        if (checkUserRegistered.rows.length > 0) {
            res.redirect("/user/login/?message=User%20already%20registered.%20Please%20login.")
        } else {
            const otp = await sendMail(email);
            if (otp !== -1) {
                bcrypt.hash(password, saltRounds, async function (err, hash) {
                    // console.log(`the otp sent to mail is = ${otp}`);
                    if (err) {
                        console.error("ERROR HASHING PASSWORD : ", err);
                        res.status(500).send("Internal Server Error");
                    }
                    else {
                        const result = await User.create({ name, email, hash, otp });
                        const user = result.rows[0];
                        res.redirect(`/user/verifyotp/?message=${email}`);
                    }
                })
            } else {
                console.error("ERROR SENDING OTP");
                res.status(500).send("Internal Server Error");
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

export function renderVerifyOtpPage(req, res) {
    const email = req.query.message;
    res.render("verifyotp.ejs", { email });
}

export async function verifyOtp(req, res) {
    const email = req.body.username;
    const enteredOtp = parseInt(req.body.otp);
    try {
        const result = await User.findByEmail(email);
        if (result.rows.length === 0) {
            res.status(404).render("/user/signup/?message=Sorry%20some%20error%20occurred.%20Try%20again.")
        } else {
            const user = result.rows[0]
            if (user.otp === enteredOtp) {
                req.login(user, (err) => {
                    if (err) console.log(err);
                    res.redirect("/user/result");
                })
            } else {
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
        scope: ["profile", "email"],
    })(req, res, next)
}

export function authenticateWithGoogle(req, res, next) {
    passport.authenticate("google", {
        successRedirect: "/user/result",
        failureRedirect: "/user/login/?message=Internal%server%20error.%20Try%20again."
    })(req, res, next)
}

export function displayResultPage(req, res) {
    if (req.isAuthenticated()) {
        res.render("result.ejs");
    } else {
        res.redirect("/user/login");
    }
}

export function logoutUser(req, res) {
    req.logout((err) => {
        if (err) console.log(err);
        res.redirect("/user");
    })
}