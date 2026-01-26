const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');



async function registerController(req,res){
    const {fullName: {firstName, lastName}, email, password} = req.body;

    const userAlreadyExists = await userModel.findOne({email});

    if(userAlreadyExists){
        return res.status(400).json({
            message: "User already exists!"
        })
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        fullName: {
            firstName, lastName
        },
        email,
        password: hashPassword
    })


    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });

    res.cookie('token',token, {
        httpOnly: true,                // Prevent XSS attacks
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        sameSite: 'strict',            // Protect against CSRF (since frontend is on same domain)
        maxAge: 24 * 60 * 60 * 1000    // 1 Day 
    });

    res.status(201).json({
        message: 'User registered successfully',
        user:{
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })
}

async function loginController(req,res){
    const {email, password} = req.body;
    console.log("logincontroller");
    const user = await userModel.findOne({email});

    if(!user){
        return res.status(400).json({
            message: 'Invalid email or password!'
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).json({
            message: 'Invalid email or password!'
        })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });

    console.log("before setting cookie");

   res.cookie("token", token, {
     httpOnly: true,
     secure: true, // Always true for Render
     sameSite: "none", // Allows the cookie to cross the redirect boundary easily
     maxAge: 24 * 60 * 60 * 1000,
   });

    res.status(200).json({
        message: 'user logged in successfully',
        user:{
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })
}

function verifyController(req, res){
    res.status(200).json({
        authenticated: true,
        user: req.user
    })
}

function logoutController(req, res){
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    
    res.status(200).json({message: "Logged out"});
}

module.exports = {
    registerController,
    loginController,
    verifyController,
    logoutController
}