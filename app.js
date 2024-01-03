import express from 'express';
import menuRouter from './src/routes/menu.router.js';
import catagoryRouter from './src/routes/category.router.js';
// import imageUploader from './assets/imageupload.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

// router.post('/upload', imageUploader.single('image'), (req, res) => {
//    res.json({ fileUrl: req.file.location });
// });

app.use('/api', [catagoryRouter, menuRouter]);
app.use(router);

app.listen(port, () => {
   console.log(port, '서버열림');
});
