require('dotenv').config({ path: '../.env'});
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const express= require("express");
const routes= require('./routes/routes');

const app= express();
const port= process.env.PORT || 3000;
require('./database/db');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use('/',routes)

app.listen(port,()=>{
    console.log(`server is connected on port${port}`)
})