import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import Joi from 'joi';
import imageUploader from '../../assets/imageupload.js';

const router = express.Router();

const menuSchema = Joi.object({
   name: Joi.string().min(1).required(),
   description: Joi.string().min(1).required(),
   image: Joi.string().min(1),
   price: Joi.string().min(1).required(),
   order: Joi.number().integer(),
   status: Joi.string().valid('FOR_SALE', 'SOLD_OUT'),
});

//메뉴 등록
router.post('/categories/:categoryId/menus', imageUploader.single('image'), async (req, res, next) => {
   try {
      const { categoryId } = req.params;

      const category = await prisma.category.findFirst({ where: { id: +categoryId } });
      if (!category) {
         return res.status(404).json({ message: '존재하지 않는 카테고리입니다.' });
      }

      // const bodySchema = Joi.object({
      //    name: Joi.string().min(1).required(),
      //    description: Joi.string().min(1).required(),
      //    image: Joi.string().min(1),
      //    price: Joi.string().min(1).required(),
      // });

      //비동기적으로 처리 안함
      // const validation = bodySchema.validate(req.body);
      // if (validation.error) {
      //    console.log(validation.error.details);
      //    return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다' });
      // }

      // const { name, description, price } = req.body;

      const validation = await menuSchema.validateAsync(req.body);
      const { name, description, price } = validation;
      req.body.image = req.file.location;

      // req.body.image = req.file ? req.file.location : null;

      const lastOrder = await prisma.menu.findFirst({
         orderBy: {
            order: 'desc',
         },
         select: {
            order: true,
         },
      });

      const orderCheck = lastOrder ? lastOrder.order + 1 : 1;

      const menuInfo = await prisma.menu.create({
         data: {
            name,
            description,
            // image,
            image: req.file.location,
            price,
            status: 'FOR_SALE',
            order: orderCheck,
            category_id: +categoryId,
         },
      });

      return res.status(200).json({ menuInfo });
   } catch (error) {
      next(error);
      // console.error(error);
      // return res.status(500).json({ errorMessage: '서버에서 애러가 발생했습니다.' });
   }
});

//카테고리별 메뉴조회
router.get('/categories/:categoryId/menus', async (req, res, next) => {
   try {
      const { categoryId } = req.params;

      if (!categoryId) {
         return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다' });
      }

      const category = await prisma.category.findFirst({ where: { id: +categoryId } });

      if (!category) {
         console.error(error);
         return res.status(404).json({ message: '존재하지 않는 카테고리입니다.' });
      }

      const menus = await prisma.menu.findMany({ where: { category_id: +categoryId } });

      return res.status(200).json({ menus });
   } catch (error) {
      return res.status(500).json({ errorMessage: '서버에서 에러가 발생했습니다' });
   }
});

//상세조회
router.get('/categories/:categoryId/menus/:menuId', async (req, res, next) => {
   try {
      const { categoryId, menuId } = req.params;
      if (!categoryId || !menuId) {
         return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다' });
      }

      const category = await prisma.category.findFirst({ where: { id: +categoryId } });

      if (!category) {
         return res.status(404).json({ message: '존재하지 않는 카테고리입니다' });
      }

      const menu = await prisma.menu.findFirst({
         where: { id: +menuId },
         select: {
            id: true,
            name: true,
            description: true,
            image: true,
            price: true,
            order: true,
            status: true,
         },
      });

      return res.status(200).json({ data: menu });
   } catch (error) {
      return res.status(500).json({ errorMessage: '서버에서 에러가 발생했습니다' });
   }
});

//수정
router.patch('/categories/:categoryId/menus/:menuId', async (req, res, next) => {
   try {
      const { categoryId, menuId } = req.params;

      const category = await prisma.category.findFirst({ where: { id: +categoryId } });
      if (!category) {
         return res.status(404).json({ message: '존재하지 않는 카테고리입니다' });
      }

      const menu = await prisma.menu.findFirst({ where: { id: +menuId } });
      if (!menu) {
         return res.status(404).json({ message: '존재하지 않는 메뉴입니다' });
      }

      // const bodySchema = Joi.object({
      //    name: Joi.string().min(1).required(),
      //    description: Joi.string().min(1).required(),
      //    price: Joi.string().min(1).required(),
      //    order: Joi.number().integer().required(),
      //    status: Joi.string().valid('FOR_SALE', 'SOLD_OUT').required(),
      // });

      // //비동기적으로 처리 안함
      // const validation = bodySchema.validate(req.body);
      // if (validation.error) {
      //    return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다' });
      // }

      // const { name, description, price, order, status } = req.body;

      const validation = await menuSchema.validateAsync(req.body);
      const { name, description, price, order, status } = validation;

      if (price < 0) {
         return res.status(400).json({ message: '메뉴 가격은 0보다 작을 수 없습니다' });
      }

      //body에 입력한 order값을 데이터베이스에서 이미 존재하는 값인지 찾음
      const checkExistsOrder = await prisma.menu.findFirst({ where: { order: order } });
      //이미 다른 메뉴로 존재하는 값이라면
      // 찾은 checkExistsOrder 데이터의 id로 찾아서 찾은 메뉴품목의 order 값을
      // 현재 위에서 params로 받은 menuId로 찾은 menu값의 order 값으로 값을 수정해줌
      if (checkExistsOrder) {
         await prisma.menu.update({
            where: { id: checkExistsOrder.id },
            data: { order: menu.order },
         });
      }

      await prisma.menu.update({
         where: { id: +menuId },
         data: { name, description, price, order, status },
      });
      return res.status(200).json({ message: '메뉴를 수정하였습니다.' });
   } catch (error) {
      return res.status(500).json({ errorMessage: '서버에서 에러가 발생했습니다' });
   }
});

//삭제
router.delete('/categories/:categoryId/menus/:menuId', async (req, res, next) => {
   try {
      const { categoryId, menuId } = req.params;

      if (!categoryId || !menuId) {
         return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다' });
      }

      const category = await prisma.category.findFirst({ where: { id: +categoryId } });
      if (!category) {
         return res.status(404).json({ message: '존재하지 않는 카테고리입니다' });
      }

      const menu = await prisma.menu.findFirst({ where: { id: +menuId } });
      if (!menu) {
         return res.status(404).json({ message: '존재하지 않는 메뉴입니다' });
      }

      await prisma.menu.delete({ where: { id: +menuId } });

      return res.status(200).json({ message: '메뉴를 삭제하였습니다' });
   } catch (error) {
      return res.status(500).json({ errorMessage: '서버에서 에러가 발생했습니다' });
   }
});

export default router;
