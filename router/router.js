import express from "express";
const router = express.Router();

import {
    renderHomePage,
    renderLoginPage,
    loginUser,
    renderForgotPasswordPage,
    postForgotPassword,
    resetPassword,
    renderSignupPage,
    verifyOtp,
    signupUser,
    renderVerifyOtpPage,
    loginWithGoogle,
    authenticateWithGoogle,
    logoutUser,
    displayResultPage,
} from "../controller/auth.js";

router.get("/", renderHomePage);

router.get("/login", renderLoginPage);

router.post("/login", loginUser)

router.get("/forgot-password", renderForgotPasswordPage)

router.post("/forgot-password", postForgotPassword)

router.post("/reset-password", resetPassword)

router.get("/signup", renderSignupPage);

router.post("/signup", signupUser);

router.get("/verifyotp", renderVerifyOtpPage);

router.post("/verifyotp", verifyOtp);

router.get("/login/google", loginWithGoogle);

router.get("/auth/google/secrets", authenticateWithGoogle);

router.get("/result", displayResultPage);

router.get("/logout", logoutUser);

export default router;