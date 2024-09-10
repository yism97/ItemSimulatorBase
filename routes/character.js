import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// [심화] 라우터마다 prisma 클라이언트를 생성하고 있다. 더 좋은 방법이 있지 않을까?
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// [필수] 3. 캐릭터 생성
router.post('/character/create', (req, res) => {});

// [필수] 4. 캐릭터 삭제
router.post('/character/delete', (req, res) => {});

// [필수] 5. 캐릭터 상세 조회
router.get('/character/detail', (req, res) => {});

// 6-3. [도전] "회원"에 귀속된 캐릭터를 생성하기
router.post('/character/createfromuser', (req, res) => {});

// 6-4. [도전] "회원"에 귀속된 캐릭터를 삭제하기
router.post('/character/createfrom', (req, res) => {});

export default router;
