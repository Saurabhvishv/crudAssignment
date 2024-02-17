//user
//post    http://localhost:3000/register
req.body
{
    "fname": "Saurabh",
    "lname": "Vishwakarma",
    "phone": 7071468607,
    "email": "sdh@gmail.com",
    "password": "012345678"
}

//post    http://localhost:3000/login
req.body
{
    "email": "sdh@gmail.com",
    "password": "012345678"
}

//get     http://localhost:3000/getUser/65cc6895256e618f2f2bf51a

//get     http://localhost:3000/getAllUsers?page=&limit

//put     http://localhost:3000/updatePassword/65cb40d8480085b6380cc996
req.body
{
    "oldPassword": "012345678",
    "newPassword": "01234568"
}

//put     http://localhost:3000/updateDetails/65cb40d8480085b6380cc996
req.body
{
    "email": "swd@gmail.com"
}


//delete  http://localhost:3000/delete/65cc6895256e618f2f2bf51a

//items
//post    http://localhost:3000/itemRegister
req.body
{
    "itemName": "G.K",
    "description": "this is book for current knowledge",
    "price": 788
}

//get     http://localhost:3000/getItemDetails/65d090528f609e29fe2f67e3

//get     http://localhost:3000/getAllItemsDetails

//put     http://localhost:3000/updateItemDetails/65d090528f609e29fe2f67e3
req.body
{
    "price": 599
}

//delete  http://localhost:3000/deleteItem/65d090528f609e29fe2f67e3
