import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

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
        name, // 캐릭터 이름 저장
        health: 500,
        power: 100,
        money: 10000,
        account: { connect: { accountId } }, // 계정에 연결
      },
    });

    res.status(200).json({ message: '캐릭터가 생성되었습니다.', character_Info: newCharacter });
  } catch (error) {
    console.error('캐릭터 생성 오류:', error);
    res.status(500).json({ error: '캐릭터 생성 중 오류가 발생했습니다.' });
  }
});

// **"회원"에 귀속된 캐릭터 삭제하기**
router.delete('/character/delete', authMiddleware, async (req, res) => {
  const { characterId } = req.body;
  const { accountId } = req.accountInfo;

  try {
    // 캐릭터가 해당 계정에 속해 있는지 확인
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { account: true },
    });

    if (!character || character.account.accountId !== accountId) {
      return res
        .status(403)
        .json({ message: '해당 캐릭터를 찾을 수 없거나 삭제할 권한이 없습니다.' });
    }

    // 캐릭터 삭제
    await prisma.character.delete({
      where: { id: characterId },
    });

    res.status(200).json({ message: '캐릭터가 삭제되었습니다.' });
  } catch (error) {
    console.error('캐릭터 삭제 중 에러 발생', error);
    return res.status(500).json({ message: '캐릭터 삭제 중 오류가 발생했습니다.' });
  }
});

// **캐릭터 상세 조회하기 (캐릭터 소유자면 money까지 공개, 그렇지 않으면 일부 정보만 공개)**
router.get('/character/detail', authMiddleware, async (req, res) => {
  const { characterId } = req.body;
  const { accountId } = req.accountInfo;

  try {
    // 캐릭터 정보 조회
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { account: true },
    });

    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 해당 캐릭터의 소유자인지 확인
    const Owner = character.account.accountId === accountId;

    const characterData = {
      name: character.name,
      health: character.health,
      power: character.power,
    };

    // 소유자라면 money 정보도 포함
    if (Owner) {
      characterData.money = character.money;
    }

    return res.status(200).json(characterData);
  } catch (error) {
    console.error('캐릭터 조회 중 에러가 발생하였습니다.', error);
    return res.status(500).json({ message: '캐릭터 조회 중 오류가 발생하였습니다.' });
  }
});

export default router;
