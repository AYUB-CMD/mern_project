require('dotenv').config()
const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3000;
require('./db/conn');
const LegalUser = require('./model/model');
const auth = require('./middleware/auth')
const { json } = require('express');

const static_path = path.join(__dirname, "../public")

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}))
app.use(express.static(static_path))//for static
const temp_path = path.join(__dirname, "../templates/views")
const partials_path =path.join(__dirname,"../templates/partials")
//seting view
app.set('view engine', 'hbs')
app.set('views', temp_path)//for templates
hbs.registerPartials(partials_path)//for partials


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/secret', auth,(req, res) => {
    //console.log(`cookie maams ${req.cookies.jwt}`)
    res.render('secret')
})

app.get('/logout',auth,async (req, res) => {
    try { 

        //single logout

        // req.user.tokens = req.user.tokens.filter((curEl) => {
        //     return curEl.token !== req.token
        // })

        //logout all  device
        req.user.tokens = [];


        res.clearCookie('jwt')
        console.log('logout')
        await req.user.save();
        res.render('login')
    }
    catch (e) {
        res.status(401).send(e)
    }
})
app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/register', (req, res) => {
    res.render('register')
})
app.post('/register', async (req, res) => {
    try {
        const password = req.body.pass;
        const cpassword = req.body.re_pass;
        if (password === cpassword) {
    
            
        const user =new LegalUser({
            name: req.body.name,
            email: req.body.email,
            password: password,
            cpassword: cpassword
        });
        //middleware
        const token = await user.generateAuthToken();
        //cookie
        res.cookie("jwt",token)    
            
        const register = await user.save();
        res.status(200).render('index');
        }
        else {
            res.send('password not match')
        }

    } catch (e) {
        res.status(400).send(e)
    }
});
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userEmail = await LegalUser.findOne({ email: email });
        //to read the data 
        //console.log(`${email} ${password}`)
        const isMatch = await bcrypt.compare(password, userEmail.password);
        //midleware
        const token = await userEmail.generateAuthToken();
        //cookie
        res.cookie("jwt", token)
        //cookie parser
        
        console.log(token)
        if (isMatch) {
            res.status(200).render('index')
        }
        else {
            res.send('invalid password details');
        }
    }
    catch (e) {
        res.send('invalid login details')
    }
})




app.listen(port, () => {
    console.log(`running on port number : ${port}`)
})
