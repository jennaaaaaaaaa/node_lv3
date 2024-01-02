import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

// 카테고리 등록 API
router.post("/categories", async (req, res, next) => {
  try {
    const { name } = req.body;

    const lastCategory = await prisma.category.findFirst({
      orderBy: { order: "desc" },
    });
    const newOrder = lastCategory ? lastCategory.order + 1 : 1;
    const createCategory = await prisma.category.create({
      data: {
        name,
        order: newOrder,
      },
    });
    return res
      .status(200)
      .json({ message: "카테고리를 등록 하였습니다.", data: createCategory });
  } catch (err) {
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }
});

// 카테고리 목록 조회 API
router.get("/categories", async (req, res, next) => {
  try {
    const categorys = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        order: true,
      },
      orderBy: [{ order: "desc" }],
    });
    return res.status(200).json({ data: categorys });
  } catch (err) {
    return res.status(400).json({ errorMessage: err.message });
  }
});

// 카테고리별 정보 변경 API
router.patch("/categories/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: +id },
    });

    if (!category) {
      return res
        .status(404)
        .json({ errorMessage: "존재하지 않는 카테고리입니다." });
    }

    if (order !== undefined && order !== category.order) {
      // order 값이 변경되고, 변경된 값이 현재의 값과 다를 때 중복 체크 수행
      const existingCategoryWithOrder = await prisma.category.findFirst({
        where: {
          order: +order,
          id: { not: +id }, // 현재 수정 중인 카테고리 제외
        },
      });

      if (existingCategoryWithOrder) {
        // 중복된 order 값이 이미 존재하면 교환
        await prisma.category.updateMany({
          where: {
            OR: [{ id: +id }, { order: +order }],
          },
          data: {
            order: {
              set: category.order,
            },
          },
        });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: +id },
      data: { name, order },
    });

    return res
      .status(200)
      .json({ message: "수정에 성공했습니다.", data: updatedCategory });
  } catch (err) {
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }
});

// 카테고리 삭제 API
router.delete("/categories/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: +id },
    });
    if (!category) {
      return res
        .status(404)
        .json({ errorMessage: "존재 하지 않는 카테고리입니다." });
    }
    await prisma.category.delete({
      where: { id: +id },
    });
    return res.status(200).json({ message: "카테고리 정보를 삭제하였습니다." });
  } catch (err) {
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }
});


export default router;