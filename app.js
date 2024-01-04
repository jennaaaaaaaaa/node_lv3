import express from 'express';
import catagoryRouter from './src/routes/category.router.js'
import errorHandlingMiddleware from './src/middlewares/error.handling.middleware.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.get('/', (req, res) => {
   return res.json({ message: 'hi' });
});

app.use('/api', [router, catagoryRouter]);
app.use(errorHandlingMiddleware) // 미들웨어를 적용 시키기 위해 추가한 부분 !

app.listen(port, () => {
   console.log(port, '서버열림');
});
