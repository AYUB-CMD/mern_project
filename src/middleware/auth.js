const jwt = require('jsonwebtoken');
const LegalUser = require('../model/model');

const auth = async (req,res,next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        console.log(verifyUser)
        const user = await LegalUser.findOne({_id:verifyUser._id})
        console.log(user);

        req.token = token;
        req.user = user;

        next();
    }
    catch (e) {
        res.status(400).send(e)
    }
}

module.exports = auth;