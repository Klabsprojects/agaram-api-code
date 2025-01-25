const path =  require('path');
const multer = require('multer');
const fs = require('fs');

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        const uploadDir = 'uploads/';
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

var upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback){
        if(
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpeg" ||
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

module.exports = upload