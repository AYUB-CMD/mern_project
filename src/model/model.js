const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cpassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required:true
        }
    }]
});


//generating token
userSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        console.log(token);
        return token;
    }
    catch (e) {
res.send(e)
    }
}


//converting into hash
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
    console.log(`the current password ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10); 
        this.cpassword = await bcrypt.hash(this.cpassword, 10);
        
    };

    next();
})

const LegalUser = new mongoose.model('user', userSchema);

module.exports = LegalUser;
