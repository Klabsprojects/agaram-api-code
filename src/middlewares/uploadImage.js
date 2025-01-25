const path =  require('path');
const multer = require('multer');
const fs = require('fs');

var storageImage = multer.diskStorage({
    destination: function(req, file, cb){
        const uploadDir = 'imageUploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
        //cb(null, '/uploads')
    },
    filename: function(req, file, cb){
        const originalName = file.originalname;
        cb(null, originalName);
        // let ext = path.extname(file.originalname)
        // cb(null, Date.now() + ext)
    }
})

var uploadImage= multer({
    storage: storageImage,
    fileFilter: function(req, file, callback){
        if(
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpeg" ||
            file.mimetype === "image/tiff" ||
            file.mimetype === "image/heic" ||
            file.mimetype === "application/pdf"
        ){
            console.log('FILE', file);
            callback(null, true)
        }
        else{
            console.log('Only pdf, jpg or png file supported');
            callback(null, false)
        }
    }
})

module.exports = uploadImage