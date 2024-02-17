const User = require('../model/userModel');
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const valid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const validRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

function telephoneCheck(str) {
    if (/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(str)) {
        return true
    }
    return false
}

function emailCheck(str) {
    if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(str)) {
        return true
    }
    return false
}


const register = async (req, res) => {
    try {
        const requestBody = req.body;
        if (!validRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: 'invalid request' })
        }
        const { fname, lname, phone,email, password } = req.body;
        if (!valid(fname)) {
            return res.status(400).send({ status: false, msg: 'fname is required' })
        }
        if (!valid(lname)) {
            return res.status(400).send({ status: false, msg: 'lname is required' })
        }
        const isNumberorEmailAlreadyUsed = await User.findOne({ phone }, { email });
        if (isNumberorEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${phone} number or ${email} mail is already registered` })
        }
        if (!valid(email)) {
            return res.status(400).send({ status: false, msg: 'email is required' })
        }
        if (!emailCheck(email)) {
            return res.status(400).send({ status: false, msg: "email is not valid" })
        }
        if (!valid(phone)) {
            return res.status(400).send({ status: false, msg: 'phone is required' })
        }
        if (!telephoneCheck(phone)) {
            return res.status(400).send({ status: false, msg: "phone no. is not valid" })
        }
        if (!valid(password)) {
            return res.status(400).send({ status: false, msg: 'password is required' })
        }
        if (!((password.length > 7) && (password.length < 16))) {
            return res.status(400).send({ status: false, message: `Password length should be between 8 and 15.` })
        }

        const EncrypPassword = await bcrypt.hash(password, 10);
        const data = { fname, lname, phone, email, password: EncrypPassword };
        const userData = await User.create(data);
        const createdUser = await User.findById(userData._id).select("-password");

        res.status(200).send({ status: true, createdUser, msg: 'register successfull' })

    } catch (error) {
        res.status(500).send({ status: false, msg: `error occur${error}` })
    }
}

const login = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!validRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: 'Invalid request' });
        }

        const { email, password } = requestBody;

        if (!email || !password) {
            return res.status(400).send({ status: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ status: false, msg: "Email does not exist" });
        }

        if (user.isDeleted) {
            return res.status(404).send({ status: false, msg: 'User has been deleted' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if(!isValidPassword) {
            return res.status(400).send({ status: false, msg: "password is wrong" });
        }

        const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

       
            const accessToken = jwt.sign({
                _id: user._id,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                phone: user.phone
            }, process.env.SECRET_KEY, { expiresIn: '2h' });
            res.cookie('accessToken', accessToken, options);
            res.status(200).send({ status: true, msg: "Success", data: { userId: loggedInUser, token: accessToken, msg: 'User login successful' } });

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

const getDetails = async function (req, res) {
    try {

         const {id} = req.params;
        if (req.user?._id != id) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }

        if (req.user.isDeleted) {
            return res.status(404).send({ status: false, msg: 'User has been deleted' });
        }

        const userDetails= req.user;

        if (!userDetails) {
            return res.status(404).send({ status: false, msg: 'User not found' });
        }

        res.status(200).send({ status: true, msg: 'user details', data: userDetails })
  
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const getAllDetails = async function (req, res) {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;


        const userdata = await User.find({ isDeleted: false })
        .select('-password')
        .skip(skip)
        .limit(limit);

        if (!userdata) {
            return res.status(404).send({ status: false, msg: 'data is not avilable' });
        }
        res.status(200).send({ status: true, msg: 'all user details fetched',numberOfDatas: userdata.length, data: userdata })
  
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const updatePassword = async (req, res) => {
    try {
        const requestBody = req.body;
        const { id } = req.params;
        if (req.user?._id != id) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }

        if (req.user.isDeleted) {
            return res.status(404).send({ status: false, msg: 'User has been deleted' });
        }

        if (!validRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: 'invalid request' })
        }

        const { oldPassword, newPassword} = req.body;

        if (!((newPassword.length > 7) && (newPassword.length < 16))) {
            return res.status(400).send({ status: false, message: `newPassword length should be between 8 and 15.` })
        }

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).send({ status: false, msg: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(oldPassword, existingUser.password)

        if (!isPasswordCorrect) {
            return res.status(400).send({ status: false, msg: ' old password not matched' })
        }

        const EncrypPassword = await bcrypt.hash(newPassword, 10);

        const updatedata = await User.findOneAndUpdate({ _id: id } , {password: EncrypPassword },{new:true})

        res.status(200).send({ status: true, msg: "success", data: { userId: User._id, updatedata, msg: 'user details updated' } })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const updateUserDetails = async (req, res) => {
    try {
        const requestBody = req.body;
        const { id } = req.params;
        if (req.user?._id != id) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }

        if (req.user.isDeleted) {
            return res.status(404).send({ status: false, msg: 'User has been deleted' });
        }

        if (!validRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: 'invalid request' })
        }

        const {fname,lname, email, phone} = req.body;

        const isNumberorEmailAlreadyUsed = await User.findOne({ $or: [{ phone }, { email }] });
        if (isNumberorEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${phone} number or ${email} mail is already registered` })
        }
        if (email && !valid(email)) {
            return res.status(400).send({ status: false, msg: 'email is required' })
        }
        if (email && !emailCheck(email)) {
            return res.status(400).send({ status: false, msg: "email is not valid" })
        }
        if (phone && !valid(phone)) {
            return res.status(400).send({ status: false, msg: 'phone is required' })
        }
        if (phone && !telephoneCheck(phone)) {
            return res.status(400).send({ status: false, msg: "phone no. is not valid" })
        }

        const updatedser = await User.findByIdAndUpdate(id,{$set: {fname,lname,email,phone}},{new: true}).select("-password");

            if (!updatedser) {
                return res.status(404).send({ status: false, msg: 'User not found' });
            }

            res.status(200).send({ status: true,  data: updatedser, msg: 'user details updated' })
  
        
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const deleteUser= async(req,res)=>{
    try {
        
        const { id } = req.params;
        if (req.user?._id != id) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }

        if (req.user.isDeleted) {
            return res.status(404).send({ status: false, msg: 'User has been deleted' });
        }

        const deleteData = await User.findOneAndUpdate({ _id: id, isDeleted: false },
            { $set:{ isDeleted: true, deletedAt: new Date() }},{ new: true });
        if (!deleteData) {
            return res.status(404).send({ status: false, msg: 'User not found' });
        }

        res.status(200).send({ status: true, msg: "success", deleteData, msg: 'user details deleted' } )

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { register, login, getDetails, getAllDetails, updatePassword,updateUserDetails, deleteUser }