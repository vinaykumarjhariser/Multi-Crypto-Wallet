const express = require('express');
const mongoose = require('mongoose');
const app = express()
const wallethRoute = require('./routes/crypto');
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
const port = 3000

mongoose.connect('mongodb://localhost:27017/CryptoWallet', {
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(function () {
    console.log("Connection connected Successfully");
}).catch(function () {
    console.log("Connection Fail");
})


app.use(wallethRoute)
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})