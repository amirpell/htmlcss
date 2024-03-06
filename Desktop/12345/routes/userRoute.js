const express = require('express');
const router = express.Router();
const User = require("../models/userModel");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Member = require('../models/memberModel');

router.post('/register' , async (req,res) => {
    try{

        const userExist = await User.findOne({email: req.body.email})
        if(userExist){
            return res.status(400).send({message: "User already exist" , success: false });
            
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password , salt);
        req.body.password = hashedPassword;
        req.body.isAdmin = true;
        const newuser = new User(req.body);
        await newuser.save();
        res.status(200).send({message : "User created" , success: true});
    } catch(error){
        console.log(error)

        res.status(500).send({message : "error creating User" , success: false, error});

    }
})

 router.post('/registeruser' , async (req,res) => {
    try{

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password , salt);
        req.body.password = hashedPassword;


        const newdoctor = new Member({...req.body});
        


        const adminUser= await User.findOne({email: req.body.useremail});

        newdoctor.boss = adminUser._id

        await newdoctor.save();

            const clients = adminUser.clients
            clients.push(
                 newdoctor._id,
                

           )
           await User.findOneAndUpdate(adminUser._id, {clients})


        res.status(200).send({message : "User created" , success: true});
    } catch(error){
        console.log(error)

        res.status(500).send({message : "error creating User" , success: false, error});

    }
 })

router.post('/login' , async (req,res) => {
    try{
        const user  = await User.findOne({ email : req.body.email}) 
        
        if(!user){
            return res.status(200).send({message : " User not exist" , success : false});

        }
        const isMatch = await bcrypt.compare(req.body.password , user.password);
        if(!isMatch){
            return res.status(200).send({message : " Password is incorrect" , success : false});

        }
        else{
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET ,{
                expiresIn: "1d"
            })
            res.send({message:"login successful", success:true , data:token});

        }
      
    } catch(error){
        console.log(error)
        res.status(500).send({message : "error loggin in" , success: false ,error })
    }
})
router.post('/userlogin' , async (req,res) => {
    try{
        const adduser  = await Member.findOne({ email : req.body.email})
        if(!adduser){
            return res.status(200).send({message : " User not exist" , success : false});

        }
        const isMatch = await bcrypt.compare(req.body.password , adduser.password);
        if(!isMatch){
            return res.status(200).send({message : " Password is incorrect" , success : false});

        }
        else{
            const token = jwt.sign({id: adduser._id}, process.env.JWT_SECRET ,{
                expiresIn: "1d"
            })
            res.send({message:"login successful", success:true , data:token});

        }
      
    } catch(error){
        console.log(error)
        res.status(500).send({message : "error loggin in" , success: false ,error })
    }
})
router.post("/get-user-info-by-id" ,authMiddleware,  async(req,res)=>{
    try{

        const user = await User.findOne({ _id : req.body.userId});
        
        user.password = undefined;

        if(!user){
            return res.status(200).send({message : "user does not exist", success: false});
            
        }
        else{
            return res.status(200).send({ 
                success: true ,
                 data: user,
                });

        }
    }catch(error){
        return res.status(500).send({message : "error getting user info", success: false ,error});

    }
});
router.post("/get-member-info-by-id" ,authMiddleware,  async(req,res)=>{
    try{

        const user = await Member.findOne({ _id : req.body.userId});
        
        user.password = undefined;

        if(!user){
            return res.status(200).send({message : "user does not exist", success: false});
            
        }
        else{
            return res.status(200).send({ 
                success: true ,
                 data: user,
                });

        }
    }catch(error){
        return res.status(500).send({message : "error getting user info", success: false ,error});

    }
});

router.post("/get-posts",authMiddleware, async (req, res) => {
    try {
       
      const adminmembers = await Member.find({ boss :  req.body.userId });
      return res.status(200).send({ 
        adminmembers
        });


    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  
  

module.exports = router ;