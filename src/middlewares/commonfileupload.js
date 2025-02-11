// commonfileupload.js
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const getCommonStorage = (folderName) => {
    return multer.diskStorage({
        destination: function(req, file, cb) {
            const baseDir = 'CommonFileFolders/';
            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir);
            }

            const uploadDir = path.join(baseDir, folderName);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }

            cb(null, uploadDir);
        },
        filename: function(req, file, cb) {
            const originalName = file.originalname;
            cb(null, originalName);
            // let ext = path.extname(file.originalname)
            // cb(null, Date.now() + ext)
        }
    });
};

// Export the function directly instead of an object
module.exports = function(folderName) {
    return multer({
        storage: getCommonStorage(folderName),
        fileFilter: function(req, file, callback) {
            if(
                file.mimetype == "image/png" ||
                file.mimetype == "image/jpeg" ||
                file.mimetype === "application/pdf" || 
                file.mimetype === "image/tiff" ||
                file.mimetype === "image/heic"
            ){
                console.log('FILE', file);
                callback(null, true)
            }
            else{
                console.log('Only pdf, jpg or png file supported');
                callback(null, false)
            }
        },
    });
};