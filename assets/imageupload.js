import AWS from 'aws-sdk';
import multer from 'multer';

AWS.config.update({
   region: '',
   accessKeyId: env(AWS_ACCESS_KEY_ID),
   secretAccessKdy: env(AWS_SECRET_ACCESS_KEY),
});

const s3 = new AWS.S3();

const allowedExtenstions = ['.png', 'jpg', 'jpeg', 'bmp'];

const imageUploader = multer({
   storage: multerS3({
      s3: s3,
      bucket: 'hagnhae-nodelv3',
      key: (req, file, callback) => {
         const uploadDirectory = req.query.directory ?? '';
         const extension = path.extname(file.originalname);
         if (!allowedExtenstions.includes(extension)) {
            return callback(new Error('wrong extension'));
         }
         callback(null, `${uploadDirectory}/${Data.now()}_${file.originalname}`);
      },
      acl: 'public-read-write',
   }),
});

export default imageUploader;
