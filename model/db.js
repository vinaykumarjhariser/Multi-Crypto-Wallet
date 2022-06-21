const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/CryptoWallet', {
//     useNewUrlParser: true,
//     useUnifiedTopology:true,
// }).then(function () {
//     console.log("Connection connected Successfully");
// }).catch(function () {
//     console.log("Connection Fail");
// })


//Schema
const CryptoSchema = new mongoose.Schema({
    username: {
        type: String,
        required:true,
        index:{
            unique:true
        }
        
    },
    email:{
        type:String,
        required:true,
        index:{
            unique:true
        },
        match:/^("(?:[!#-\[\]-\u{10FFFF}]|\\[\t -\u{10FFFF}])*"|[!#-'*+\-/-9=?A-Z\^-\u{10FFFF}](?:\.?[!#-'*+\-/-9=?A-Z\^-\u{10FFFF}])*)@([!#-'*+\-/-9=?A-Z\^-\u{10FFFF}](?:\.?[!#-'*+\-/-9=?A-Z\^-\u{10FFFF}])*|\[[!-Z\^-\u{10FFFF}]*\])$/u
    },
    password:{
        type:String,
        required:true
        
    },
    address:{
        type:String,
        default:""
    },
    privateKey:{
        type:String
    },
    otp:{
        type:String,
    },
    isVerfied:{
        type:Boolean
    }},
   {timestamps: true});
//Model
const CryptoWallet = mongoose.model('userApi', CryptoSchema);
module.exports =CryptoWallet