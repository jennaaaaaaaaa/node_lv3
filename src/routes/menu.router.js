import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import Joi from 'joi';

const router = express.Router();

//메뉴 등록
router.post('/categories/:categoryId/menus', async (req, res, next) => {
   try {
      const { categoryId } = req.params;

      if (!categoryId) {
         return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다' });
      }

      const category = await prisma.category.findFirst({ where: { id: +categoryId } });
      if (!category) {
         return res.status(404).json({ message: '존재하지 않는 카테고리입니다.' });
      }

      const body = Joi.object({
         name: Joi.string().min(1),
         description: Joi.string().min(1),
         image: Joi.string().min(1),
      });
      return res.status(200).json({});
   } catch (error) {
      return res.status(500).json({});
   }
});

export default router;
