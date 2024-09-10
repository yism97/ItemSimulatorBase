import express from 'express';
import itemRouter from './routes/item.js';
import characterRouter from './routes/character.js';
import accountRouter from './routes/account.js';

const app = express();
// [도전] 환경변수로 분리할 수 있지 않을까?
const PORT = 3000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!!!');
});

// localhost:3000/api
app.use('/api', [itemRouter, characterRouter, accountRouter]);

// [작성 방법]
// 1. AWS RDS를 생성한 뒤, vscode와 연동하세요 (https://teamsparta.notion.site/3-1-RDB-bea43ca6f6974edca853248b21ad7ebb)
// 2. .env 파일에서 1에서 생성한 데이터베이스의 정보와 일치하도록 변경하세요.
// 3. npm run dev를 입력해보세요.
// 4. 위 과정들에서 막히면 튜터님들께 찾아가 도움을 요청합니다. (세팅 문제는 누구에게나 공평하게 어렵습니다!)
// 5. routes 내부의 파일에서 필수 - 도전 - 심화 순으로 구현합니다.
