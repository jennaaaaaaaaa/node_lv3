import express from 'express';
import menuRouter from './src/routes/menu.router.js';
import catagoryRouter from './src/routes/category.router.js';
import errorHandlerMiddleware from './middlewares/error.handler.middleware.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

app.use('/api', [catagoryRouter, menuRouter]);
app.use(errorHandlerMiddleware);

app.listen(port, () => {
   console.log(port, '서버열림');
});
