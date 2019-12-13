const multer = require('multer');
const multerS3 = require('multer-s3')
const AWS = require('aws-sdk');

const accessKeyId =  require("../keys").awsAccessKey
const secretAccessKey = require("../keys").awsSecretKey
const bucketName = 'todo-northone'

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});

const s3 = new AWS.S3();

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' 
        || file.mimetype === 'image/png' 
        || file.mimetype === 'application/pdf'
        || file.mimetype === 'application/msword'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: bucketName,
      key: function (req, file, cb) {
        cb(null, `${file.originalname}-${Date.now().toString()}`);
        }
    }),
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Max file size is 5 MB
    }
})

module.exports = {
    s3,
    upload,
    bucketName
}