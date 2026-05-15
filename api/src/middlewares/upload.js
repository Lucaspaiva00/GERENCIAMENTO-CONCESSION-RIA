const multer = require("multer");

const path = require("path");

module.exports = multer({

    storage: multer.diskStorage({

        destination: (req, file, cb) => {

            cb(null, path.resolve(__dirname, "..", "uploads"));

        },

        filename: (req, file, cb) => {

            const time = Date.now();

            cb(null, `${time}-${file.originalname}`);

        }

    })

});