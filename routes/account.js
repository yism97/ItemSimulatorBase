// routes/account.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// [심화] 라우터마다 prisma 클라이언트를 생성하고 있다. 더 좋은 방법이 있지 않을까?
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// 6. [도전] 인증 미들웨어 구현
// Request의 Authorization 헤더에서 JWT를 가져와서 인증 된 사용자인지 확인하는 Middleware를 구현합니다

// 6-1. [도전] 회원가입
router.post('/account/join', async (req, res) => {
  try {
    const joinSchema = joi.object({
      accountId: joi.string().alphanum().lowercase().required(),
      password: joi.string().min(6).required(),
      confirmPassword: joi.valid(joi.ref('password')).required(),
      userName: joi.string().required(),
    });

    const validateResult = joinSchema.validate(req.body);
    console.log(validateResult);
    if (validateResult.error) {
      res.status(400).json({ error: '입력된 값이 잘못됐어요.' });
      return;
    }
    const inputValue = validateResult.value;

    const accountId = req.body.accountId; // 영어 소문자랑 숫자로만 구성 필요
    const password = req.body.password; // 최소 여섯자 이상이며 비밀번호 확인과 일치해야 한다.
    const userName = req.body.userName;

    // 비밀번호는 평문으로 쓰지말고 해싱해서 저장필요
    // 단방향 암호화
    const hashedPassword = await bcrypt.hash(password, 10);
    const existAccount = await prisma.account.findUnique({
      where: {
        accountId: accountId,
      },
    });
    if (existAccount) {
      res.status(400).json({ error: '중복된 아이디에요!' });
      return;
    }

    const joinAccount = await prisma.account.create({
      data: {
        accountId: accountId,
        password: hashedPassword,
        userName: userName,
      },
    });

    res.status(200).json({
      message: '회원가입이 완료 되었습니다.',
      account_info: { accountId: joinAccount.accountId, userName: joinAccount.userName },
    }); // 회원가입 시, 비밀번호를 제외 한 사용자의 정보를 반환
  } catch (error) {
    console.log(error);
  }
});

// 6-2. [도전] 로그인
// 아이디, 비밀번호, 비밀번호 확인, 이름 넘기기
router.post('/account/login', async (req, res) => {
  const loginSchema = joi.object({
    accountId: joi.string().alphanum().lowercase().required(),
    password: joi.string().min(6).required(),
  });

  const validateResult = loginSchema.validate(req.body);
  if (validateResult.error) {
    res.status(400)({ error: '잘못된 요청입니다.' });
    return;
  }

  const inputValue = validateResult.value;
  const accountId = inputValue.accountId;
  const password = inputValue.password;

  const account = await prisma.account.findUnique({ where: { accountId: accountId } });
  if (account == null) {
    res.status(400).json({ error: '계정이 존재하지 않습니다.' });
    return;
  }

  const passwordValidate = await bcrypt.compare(password, account.password); // 입력한 password와 등록된 password 일치 여부 확인
  if (!passwordValidate) {
    res.status(400).json({ error: '비밀번호가 일치하지 않습니다.' });
    return;
  }

  const accessToken = jwt.sign(
    { accountId: accountId, userName: account.userName },
    'secretOrPrivateKey',
    { expiresIn: '1h' },
  );

  res.status(200).json({ account_info: { accessToken: accessToken } });
});

export default router;
