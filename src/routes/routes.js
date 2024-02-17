const express= require('express');
const controller= require('../controller/userController');
const itemController= require('../controller/itemController');
const { Auth } = require('../middleware/middleware');
const router= express.Router();


//user routes
router.post('/register',controller.register);
router.post('/login',controller.login);
router.get('/getUser/:id',Auth,controller.getDetails);
router.get('/getAllUsers',controller.getAllDetails);
router.put('/updatePassword/:id',Auth,controller.updatePassword);
router.put('/updateDetails/:id',Auth,controller.updateUserDetails);
router.delete('/delete/:id',Auth,controller.deleteUser);


//items routes
router.post('/itemRegister',Auth,itemController.itemRegister);
router.get('/getItemDetails/:itemId',Auth,itemController.getItemDetails);
router.get('/getAllItemsDetails',itemController.getAllItemsDetails);
router.put('/updateItemDetails/:itemId',Auth,itemController.updateItemDetails);
router.delete('/deleteItem/:itemId',Auth,itemController.deleteItem);

module.exports= router;