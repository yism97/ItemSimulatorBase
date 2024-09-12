// middlewares/auth.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenInfo = authHeader.split(' ');

    if (tokenInfo.length != 2) {
      res.status(400).json({ error: '잘못된 인증 정보입니다.' });
      return;
    }

    if (tokenInfo[0] != 'Bearer') {
      res.status(400).json({ error: '잘못된 토큰 타입입니다.' });
      return;
    }

    const token = tokenInfo[1];
    const decodeToken = jwt.verify(token, 'secretOrPrivateKey');
    const accountId = decodeToken.accountId;
    // 사용자 정보 조회
    const accountInfo = await prisma.account.findUnique({
      where: { accountId: accountId },
      select: { accountId: true, password: false, userName: true },
    });
    if (!accountInfo) {
      res.status(400).json({ error: '계정 정보를 찾을 수 없습니다.' });
      return;
    }

    req.accountInfo = accountInfo;
    next();
  } catch (error) {
    console.log(error);
  }
};

export default authMiddleware;
