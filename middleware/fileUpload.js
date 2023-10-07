const multer = require("multer")


// when we use multer always check header does not contain in postman content-type
// in form should be multipart/formdata
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.FILE_DIR)
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
const upload = multer({ storage: storage })

module.exports = upload;
