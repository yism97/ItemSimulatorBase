// routes/character.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// [심화] 라우터마다 prisma 클라이언트를 생성하고 있다. 더 좋은 방법이 있지 않을까?
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// **"회원"에 귀속된 캐릭터를 생성하기**
router.post('/character/createfromuser', authMiddleware, async (req, res) => {
  const { name } = req.body;
  const { accountId } = req.accountInfo; // authMiddleware에서 accountId를 가져옴

  try {
    // 같은 이름의 캐릭터가 있는지 확인
    const existingCharacter = await prisma.character.findUnique({
      where: { name },
    });

    if (existingCharacter) {
      return res.status(400).json({ error: '이미 존재하는 캐릭터 이름입니다.' });
    }

    // 새로운 캐릭터 생성
    const newCharacter = await prisma.character.create({
      data: {
        name: name, // 캐릭터 이름
        health: 500,
        power: 100,
        money: 10000,
        account: { connect: { accountId } }, // 계정에 연결
      },
    });

    res.status(200).json({ message: '캐릭터가 생성되었습니다.', character_Info: newCharacter });
  } catch (error) {
    console.error('캐릭터 생성 오류:', error);
    res.status(500).json({ error: '캐릭터 생성에 실패했습니다.' });
  }
});

// "회원"에 귀속된 캐릭터를 삭제하기
router.post('/character/delete', authMiddleware, async (req, res) => {});

// 캐릭터 상세 조회하기
router.get('/character/detail', authMiddleware, async (req, res) => {});

export default router;
