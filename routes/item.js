import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// [심화] 라우터마다 prisma 클라이언트를 생성하고 있다. 더 좋은 방법이 있지 않을까?
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// [필수] 1. 아이템 생성
// 1. 아이템 코드, 아이템 명, 아이템 능력, 아이템 가격을 req(request)에서 json으로 전달받기
// 2. 데이터베이스에 아이템 저장하기
router.post('/item/create/:itemId', async (req, res) => {
  try {
    const itemCode = req.body.itemcode;
    const itemName = req.body.itemname;
    const atk = req.body.atk;
    const price = req.body.price;

    const createItem = await prisma.item.create({
      data: {
        itemCode: itemCode,
        itemName: itemName,
        atk: atk,
        price: price,
      },
    });

    res.status(200).json({ item_info: createItem });

    console.log(createItem);
  } catch (error) {
    res.status(500).json({ error: '아이템 입력에 실패했어요' });
    console.log(error);
  }
});

// [필수] 2. 아이템 목록 조회
router.get('/item/list', async (req, res) => {
  try {
    const list = await prisma.item.findMany();
    return res.status(200).json({ item_info: list });
  } catch (error) {
    res.status(500).json({ error: '아이템 목록 조회에 실패했어요' });
    console.log(error);
  }
});

// [필수] 3. 특정 아이템 조회
// 아이템 코드는 URL의 parameter로 전달받기
// GET http://localhost:3000/api/item/:itemCode
router.get('/item/:itemCode', async (req, res) => {
  try {
    const itemCode = req.params.itemCode; // String

    // 찾아드렸습니다.
    const findItem = await prisma.item.findUnique({
      where: {
        itemCode: +itemCode, // 앞에 parseInt 또는 + 붙이면 숫자로 바뀜
      },
    });
    if (findItem === null) {
      res.status(404).json({ error: '그런 말 같지도 않은 아이템은 존재하지 않아요' });
      return;
    }
    // 보내드립니다.
    res.status(200).json({ item_info: findItem });
  } catch (error) {
    res.status(500).json({ error: '아이템 조회에 실패했어요' });
    console.log(error);
  }
});

// [필수] 4. 특정 아이템 수정
// 아이템 코드는 URL의 parameter로 전달 받기
// 수정할 아이템 명, 아이템 능력을 req(request)에서 json으로 전달받기
router.put('/item/update/:itemCode', async (req, res) => {
  try {
    const { itemCode } = req.params;

    const { itemName, atk, price } = req.body;

    const updateItem = await prisma.item.update({
      where: {
        itemCode: +itemCode,
      },
      data: {
        itemName,
        atk,
        price,
      },
    });
    res.status(200).json({ message: '아이템이 수정되었습니다.', updateItem });
  } catch (error) {
    console.log(error);
  }
});

export default router;
