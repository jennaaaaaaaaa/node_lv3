import express from 'express';
import Joi from 'joi';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();
// 조이 유효성 검사 추가
const schema = Joi.object({
   name: Joi.string().min(2).max(20).required(),
});

// 조이를 통한 유효성 검사 및 에러 추가
// 카테고리 등록 API
router.post('/categories', async (req, res, next) => {
   try {
      const validation = await schema.validateAsync(req.body);
      const { name } = validation;

      const lastCategory = await prisma.category.findFirst({
         orderBy: { order: 'desc' },
      });
      const newOrder = lastCategory ? lastCategory.order + 1 : 1;
      const createCategory = await prisma.category.create({
         data: {
            name,
            order: newOrder,
         },
      });
      return res.status(200).json({ message: '카테고리를 등록 하였습니다.', data: createCategory });
   } catch (err) {
      next(err);
   }
});

// 카테고리 목록 조회 API
router.get('/categories', async (req, res, next) => {
   try {
      const categories = await prisma.category.findMany({
         select: {
            id: true,
            name: true,
            order: true,
         },
         orderBy: [{ order: 'desc' }],
      });
      return res.status(200).json({ data: categories });
   } catch (err) {
      next(err);
   }
});

// 유효성 검사 및 에러 핸들링 추가.
// 카테고리 수정 API
router.patch('/categories/:id', async (req, res, next) => {
   try {
      const { id } = req.params;
      const { name, order } = req.body;

      if (order === undefined || order === null) {
         throw { name: 'ValidationError' };
      }

      const category = await prisma.category.findUnique({
         where: { id: +id },
      });

      if (!category) throw { name: 'CastError' };

      const updatedCategory = Joi.object({
         name: Joi.string().min(1).max(50),
         order: Joi.number().min(1).max(50).allow(null),
      });

      const validateBody = await updatedCategory.validateAsync(req.body);

      // order가 null이 아니면서, 변경된 경우에 중복 체크 수행
      if (validateBody.order !== null && order !== category.order) {
         const existingCategoryWithOrder = await prisma.category.findFirst({
            where: {
               order: +validateBody.order,
               id: { not: +id },
            },
         });

         if (existingCategoryWithOrder) {
            await prisma.category.updateMany({
               where: {
                  OR: [{ id: +id }, { order: +validateBody.order }],
               },
               data: {
                  order: {
                     set: category.order,
                  },
               },
            });
         }
      } else if (validateBody.order === null && order !== category.order) {
         throw { name: 'ValidationError' };
      }

      const updatedData = {
         name: validateBody.name !== null ? validateBody.name : category.name,
         order: validateBody.order !== null ? validateBody.order : category.order,
      };

      const updatedCategoryResult = await prisma.category.update({
         where: { id: +id },
         data: updatedData,
      });

      return res.status(200).json({ message: '수정에 성공했습니다.', data: updatedCategoryResult });
   } catch (err) {
      next(err);
   }
});

// 카테고리 삭제 API
router.delete('/categories/:id', async (req, res, next) => {
   try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
         where: { id: +id },
      });
      if (!category) throw { name: 'CastError' };
      await prisma.category.delete({
         where: { id: +id },
      });
      return res.status(200).json({ message: '카테고리 정보를 삭제하였습니다.' });
   } catch (err) {
      next(err);
   }
});

export default router;
