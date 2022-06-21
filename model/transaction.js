const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/CryptoWallet', {
//     useNewUrlParser: true,
//     useUnifiedTopology:true,
// }).then(function () {
//     console.log("Mongo connected Successfully");
// }).catch(function () {
//     console.log("Mongo connection Fail");
// })
//Schema
const trsasactionSchema = new mongoose.Schema({
    transactionFrom: {
        type: String
    },
    transactionTo:{
        type:String
    },
    hash:{
        type:String
    },
    value:{
        type:String 

    },
    network:{
        type:String
    },
    username:{
        type:String
    },
    email:{
        type:String
    }},
{timestamps:true});
//Model
const allTrasaction = mongoose.model('allTrasaction', trsasactionSchema);
module.exports =allTrasaction