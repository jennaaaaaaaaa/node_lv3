import express from 'express';
import menuRouter from './src/routes/menu.router.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.get('/', (req, res) => {
   return res.json({ message: 'hi' });
});

app.use('/api', [menuRouter]);

app.listen(port, () => {
   console.log(port, '서버열림');
});
