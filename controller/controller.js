const mongoose = require('mongoose');
const CryptoWallet = require("../model/db");
const allTrasaction = require('../model/transaction')
const otpGenerator = require('otp-generator')
const nodemailer = require("nodemailer");
const transporter = require('../nodemailer/nodemailer')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authanticationToken = require('../middleware/auth');
const Web3 = require("web3");
const web3 = new Web3("https://ropsten.infura.io/v3/1679001d1bb04d6fb6a4b0ed4590b846");
const accounts = require('web3-eth-accounts');
const web3_bnb = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
const request = require('request')

//SIGNUP
exports.signup =async(req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    if (password !== confirmpassword) {
        res.json({
            msg: "Password Not Matched!"
        })
    } else {
        otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });
        bcrypt.hash(password, 10, function (err, hash) {
            // Store hash in your password DB.
            if (err) {
                return res.json({
                    result: "Something went Wrong",
                    error: err
                })
            } else {
                const userDeatils = new CryptoWallet({
                    _id: new mongoose.Types.ObjectId(),
                    username: username,
                    email: email,
                    password: hash,
                    isVerfied: false,
                    otp: otp

                })
                userDeatils.save()
                    .then(function (doc) {
                        res.status(201).json({
                            msg: "User Registered Sucessfully",
                            result: doc
                        })
                    }).catch(function (err) {
                        res.json(err)
                    })
            }
        });
    }
}

//SEND OTP
exports.sendOtp = async function (req, res) {
    // email = req.body.email;
    let {id} = req.params;
    let User = await CryptoWallet.findById({_id: id});
    // console.log(User);
    let userEmail = User.email;
    // send mail with defined transport object
    const mailOptions = {
        to: userEmail,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.json(error);
        }
        res.status(200).json('OTP Send Successfully');
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('otp');
    });
}

//VERIFY OTP
exports.verifyOtp = async function (req, res) {
    let {id} = req.params;
    let User = await CryptoWallet.findById({_id: id});
    let OTP = User.otp;
    if (req.body.otp === OTP) {
        User.otp = null;
        User.isVerfied = true;
        await User.save();
        res.status(200).json("You has been successfully registered");
    } else {
        res.status(401).json("Otp is incorrect! Try Again");
    }
}

//LOGIN
exports.login = async(req, res, next) => {
    // res.json(req.userData);
    try {
        let user = await CryptoWallet.findOne({email: req.body.email});
        if(!user){
            res.status(400).json('Wrong Credentials');
        }
        else{
         let isvalid= await  bcrypt.compare(req.body.password, user.password); // true
            if(!isvalid){
                res.status(400).json('Wrong Credentials');
            }
            else{
                const token = jwt.sign({
                    id:user._id,
                    username: user.username
                }, 'LionistheKingOftheAnimal', {
                    expiresIn: "1h"
                });

                res.status(200).json({
                    message: "User found",
                    token: token
                })
                // const {password,privateKey,isVerfied,createdAt,updatedAt,otp, ...others} =user._doc
                // res.status(200).json(others)
            }
        }
    } 
    catch (err) {
        res.status(400).json(err)
    }

}

//ACTIVATE ACCOUNT
exports.activateAccount = async(req,res)=>{
    let {id} = req.params;
    let User = await CryptoWallet.findById({_id: id});
    let entropy = web3.utils.randomHex(32)
    const userAccount = web3.eth.accounts.create([entropy]);
    const address = userAccount.address;
    const privateKey = userAccount.privateKey;
    User.address = address;
    User.privateKey = privateKey;
     await User.save();
     res.status(200).json({"address":address})
}

//ETH BALANCE
exports.ethBalance = async(req,res,next)=>{
    let {id} = req.params;
    let User = await CryptoWallet.findById({_id: id});
    const userAddress = User.address;
    const ethBalance = async(userAddress)=>{
    try{
        web3.eth.getBalance(userAddress, async (err, result) => {
            if (err) {
               res.status(400).json(err);
                return;
            }
           let balance = web3.utils.fromWei(result, "ether");
             res.status(200).json(balance + " ETH");
        });
    }catch(err){
        res.status(500).json('Something went wrong!')
    }
}
ethBalance(userAddress);
}

//BNB BALANCE
exports.bnbBalance = async(req,res)=>{
    let {id} = req.params;
    let User = await CryptoWallet.findById({_id: id});
    const userAddress = User.address;
    const bnbBalance = async(userAddress)=>{
        try{
        web3_bnb.eth.getBalance(userAddress, async (err, result) => {
            if (err) {
               res.status(400).json(err);
                return;
            }
            let balance = web3.utils.fromWei(result, "ether");
             res.status(200).json(balance + " BNB");
        });  
    }catch(err){
        res.status(500).json(err)
    }
    }
    bnbBalance(userAddress);
}

//ETH Trasaction
exports.ethTrasaction = async(req,res)=>{
    let {id} = req.params;
    let User = await CryptoWallet.findById({_id: id});
    const userAddress = User.address;
    const privateKey = User.privateKey;
    let {transactionTo} = req.body;
    const {value} = req.body.value;
  
      async function eth_transaction(){
          const value = web3.utils.toWei(req.body.value, 'ether')   
          const SignedTransaction = await web3.eth.accounts.signTransaction({
             to: transactionTo, 
             value: value,
             gas: 2000000,
             nonce: web3.eth.getTransactionCount(userAddress)
        },   privateKey);
      
        web3.eth.sendSignedTransaction(SignedTransaction.rawTransaction).then((receipt) => {
              res.status(200).json(receipt)
              const deatils = new allTrasaction ({
                transactionFrom:receipt.from,
                transactionTo:receipt.to,
                hash: receipt.transactionHash,
                value:value,
                network:"ETH",
                username:User.username,
                email:User.email
            })
            deatils.save()
        })       
      }
eth_transaction();
}

// BSC TRANSACTION
exports.bscTrasaction = async(req,res)=>{
    let {id} = req.params;
    let User = await CryptoWallet.findById({_id: id});
    const userAddress = User.address;
    const privateKey = User.privateKey;
    const {transaction_to} = req.body;
    const {value} = req.body.value;
    async function bsc_transaction(){  
        const value = web3_bnb.utils.toWei(req.body.value, 'ether')  
        const SignedTransaction = await web3_bnb.eth.accounts.signTransaction({
             to:  transaction_to,
             value:value,
             gas: 5000000,
             gasPrice: 18e9,
             nonce: web3_bnb.eth.getTransactionCount(userAddress)
        },   privateKey);
      
        web3_bnb.eth.sendSignedTransaction(SignedTransaction.rawTransaction).then((receipt) => {
              res.status(200).json(receipt);
              const deatils = new allTrasaction ({
                transactionFrom:receipt.from,
                transactionTo:receipt.to,
                hash: receipt.transactionHash,
                network:"BSC",
                value:value,
                username:User.username,
                email:User.email
            })
            deatils.save()
        })
      }
      bsc_transaction();
}

//ADDRESS SHOW 
exports.showAddress = async(req,res)=>{
    let {id} = req.params;
    try{
        let User = await CryptoWallet.findById({_id: id});
        const userAddress = User.address;
        const privateKey = User.privateKey;
        res.status(200).json({"address":userAddress, "privateKey":privateKey});

    }catch(err){
        res.status(500).json(err)
    }
}

//USER PROFILE 
exports.userProfile = async(req,res)=>{
    let {id} = req.params;
    try{
        let User = await CryptoWallet.findById({_id: id});
        let userName = User.username;
        let userEmail = User.email;
        res.status(200).json({"username":userName, "userEmail":userEmail})
    }catch(err){
        res.status(500).json(err)
    }
}


//ETH HISTORY
exports.ethHistory = async(req,res)=>{
    let {id} = req.params;
    let {pageNo} = req.query
    try{
    let User = await CryptoWallet.findById({_id: id});
    const userAddress = User.address;
    const API_KEY = 'XCW8YMKH67KDTW99NQA9ZWRGZYVXC448G4';
  request(`https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&page=${pageNo}&offset=10&sort=asc&apikey=${API_KEY}`, function (error, response, body) {
  let result = JSON.parse(body);
  res.status(200).json(result);
});
    }catch(err){
        res.status(400).json(err);
    }
}

//BSCHISTORY
exports.bscHistory = async(req,res)=>{
    let {id} = req.params;
    let {pageNo} = req.query
    try{
    let User = await CryptoWallet.findById({_id: id});
    const userAddress = User.address;
    const API_KEY = 'TSX8QKBBCHZU9FNBWFUAGGSRR1JV3FQ7FY';
  request(`https://api-testnet.bscscan.com/api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&page=${pageNo}&offset=10&sort=asc&apikey=${API_KEY}`, function (error, response, body) {
  let result = JSON.parse(body);
  res.status(200).json(result);
});
    }catch(err){
        res.status(400).json(err);
    }
}

//Dashboard
exports.dashboard = async(req,res)=>{
    let {id} = req.params;
    try{
    let User = await CryptoWallet.findById({_id: id});
    const userAddress = User.address;
    let ethresult = await web3.eth.getBalance(userAddress)
    let bnbresult = await  web3_bnb.eth.getBalance(userAddress)

    let ethbalance = await web3.utils.fromWei(ethresult, "ether");
    let bnbbalance =await web3.utils.fromWei(bnbresult, "ether");
    res.status(200).json({"BNB": bnbbalance, "ETH":ethbalance,"address":userAddress});
    }
    catch(err){
        res.status(400).json(err);
    }
}