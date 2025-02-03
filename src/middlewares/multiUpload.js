const multer = require('multer');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// 2. Create the dynamic upload middleware
const createUploadMiddleware = (req, res, next) => {
    // Log the incoming field names to debug
    // console.log('Incoming fields:', Object.keys(req.body));
    // console.log('Incoming files:', req.files);

    // Create the fields configuration
    const fields = [
        { name: 'orderFile', maxCount: 1 }
    ];

    // Add fields for installments dynamically
    // We'll allow up to 10 installments with 5 files each
    for (let i = 0; i < 10; i++) {
        fields.push({
            name: `installments[${i}][conductRulePermissionAttachment]`,
            maxCount: 5
        });
    }

    // Apply multer middleware
    return upload.fields(fields)(req, res, next);
};

module.exports = createUploadMiddleware;