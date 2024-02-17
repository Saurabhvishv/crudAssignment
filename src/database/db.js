const mongoose= require('mongoose');

const url = process.env.MONGODB_URI;
const connects= ()=>{
    mongoose.connect(url)
    .then(()=>{
        console.log('mongodb is connected')
    })
    .catch(()=>{
        console.log('error in connection')
    })
}
connects();

module.exports= connects;