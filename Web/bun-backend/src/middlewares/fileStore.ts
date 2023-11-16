import multer from 'multer'

export const MULTER_FOLDER = './datas'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, MULTER_FOLDER)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})

export const upload = multer({ storage: storage })