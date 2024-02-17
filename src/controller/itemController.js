const Item = require('../model/itemModel');


const valid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const validRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const itemRegister = async (req, res) => {
    try {
        const requestBody = req.body;
        if (!validRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: 'invalid request' })
        }

        if (!req.user) {
            return res.status(401).send({ status: false, msg: "not Unauthorized" })
        }

        if (req.user.isDeleted) {
            return res.status(404).send({ status: false, msg: 'User has been deleted' });
        }

        const { itemName, description, price } = req.body;
        if (!valid(itemName)) {
            return res.status(400).send({ status: false, msg: 'itemName is required' })
        }
        if (!valid(description)) {
            return res.status(400).send({ status: false, msg: 'description is required' })
        }
        if (!valid(price)) {
            return res.status(400).send({ status: false, msg: 'price is required' })
        }
        
        const data = { itemName, description, price, owner: req.user?._id };
        const itemData = await Item.create(data);
        const createdItem = await Item.findById(itemData._id);

        res.status(200).send({ status: true, createdItem, msg: 'item register successfull' })

    } catch (error) {
        res.status(500).send({ status: false, msg: `error occur${error}` })
    }
}

const getItemDetails = async function (req, res) {
    try {

         const {itemId} = req.params;

         const itemdata = await Item.findOne({_id:itemId});

         if (!itemdata) {
            return res.status(404).send({ status: false, msg: 'item not found' });
        }

        if (!req.user?._id.equals(itemdata.owner)) {
            return res.status(401).send({ status: false, msg: "Unauthorized" });
        }

        if (req.user.isDeleted) {
            return res.status(404).send({ status: false, msg: 'User has been deleted' });
        }


        res.status(200).send({ status: true, msg: 'item details', data: itemdata })
  
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const getAllItemsDetails = async function (req, res) {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;


        const itemData = await Item.find().skip(skip).limit(limit);

        if (!itemData) {
            return res.status(404).send({ status: false, msg: 'data is not avilable' });
        }
        res.status(200).send({ status: true, msg: 'all user details fetched',numberOfDatas: itemData.length, data: itemData })
  
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const updateItemDetails = async (req, res) => {
    try {
        const requestBody = req.body;
        const { itemId } = req.params;

        const itemdata = await Item.findOne({_id:itemId});

        if (!itemdata) {
            return res.status(404).send({ status: false, msg: 'item not found' });
        }

        if (!req.user?._id.equals(itemdata.owner)) {
            return res.status(401).send({ status: false, msg: "Unauthorized" });
        }
        
        if (req.user.isDeleted) {
            return res.status(404).send({ status: false, msg: 'User has been deleted' });
        }

        if (!validRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: 'invalid request' })
        }

        const { itemName, description, price} = req.body;

        const itemNameAlreadyUsed = await Item.findOne({ itemName });
        if (itemNameAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${itemName} is already registered` })
        }
        if (itemName && !valid(itemName)) {
            return res.status(400).send({ status: false, msg: 'itemName is required' })
        }
        if (description && !valid(description)) {
            return res.status(400).send({ status: false, msg: "description is required" })
        }
        if (price && !valid(price)) {
            return res.status(400).send({ status: false, msg: 'price is required' })
        }
        

        const updatedItem = await Item.findByIdAndUpdate(itemId,{$set: { itemName, description, price}},{new: true});

            if (!updatedItem) {
                return res.status(404).send({ status: false, msg: 'Item not found' });
            }

            res.status(200).send({ status: true,  data: updatedItem, msg: 'items details updated' })
  
        
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const deleteItem = async(req,res)=>{
    try {
        
        const { itemId } = req.params;
        
        const itemdata = await Item.findOne({_id:itemId});

        if (!itemdata) {
            return res.status(404).send({ status: false, msg: 'item not found' });
        }

        if (!req.user?._id.equals(itemdata.owner)) {
            return res.status(401).send({ status: false, msg: "Unauthorized" });
        }
        
        if (req.user.isDeleted) {
            return res.status(404).send({ status: false, msg: 'User has been deleted' });
        }

        const deleteData = await Item.findOneAndDelete({_id: itemId });
        if (!deleteData) {
            return res.status(404).send({ status: false, msg: 'User not found' });
        }

        res.status(200).send({ status: true, msg: "success", deleteData, msg: 'item details deleted' } )

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { itemRegister, getItemDetails, getAllItemsDetails, updateItemDetails, deleteItem}