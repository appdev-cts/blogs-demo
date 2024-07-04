// middlewares/upload.js
const multer = require('multer');
const path = require('path');
const destinationPath = path.resolve(__dirname, '../uploads/profile');
const storage = multer.diskStorage({
    destination: destinationPath,
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type
function checkFileType(file, res, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname) {
        return cb(null, true);
    } else {
        res.status(400).json({status: false,  error: 'Images Only!' });
    }
}

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, req.res, cb); // Pass the res object from the request
    }
}).single('profilePic');

module.exports = upload;
