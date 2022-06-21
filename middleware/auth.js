const jwt = require('jsonwebtoken');
module.exports= (req,res,next)=>{
        let headerToken = req.headers.authorization;
        // console.log(headerToken);
    try{
        let token = headerToken.split(" ")[1];
       let decode = jwt.verify(token, 'LionistheKingOftheAnimal');
       req.userData = decode;
        // console.log(token);
        next();
    }
    catch(err){
        res.json({
            msg:"invalid Token",
            err:err
        })
    }  
}