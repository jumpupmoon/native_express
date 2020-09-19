const express = require("express");
const dotenv = require("dotenv");
const Caver = require('caver-js');
const mongoose = require('mongoose');

const app = express();
const port = 5000;

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 몽고 디비 연결
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
.then(() => console.log('connected to mongodb'))
.catch(e => console.error(e));

// kas node api
const option = {
    headers: [
      {name: 'Authorization', value: 'Basic ' + Buffer.from(process.env.ACCESS_KEY + ':' + process.env.SECRET_ACCESS).toString('base64')},
      {name: 'x-chain-id', value: 1001},
    ]
  }
  
const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option))

// 배포한 컨트랙트 인스턴트 만들기
const deployedABI = require('./deployedABI.json');
const DEPLOY_ADDRESS = '0x2850f56374Ad1cE6649D2adC53D6057ba2D9aEFA';

const getContract = () => {
  const contractInstance = deployedABI
      && DEPLOY_ADDRESS
      && new caver.klay.Contract(deployedABI, DEPLOY_ADDRESS);
  return contractInstance;
}

// 매니저 지갑
const address = '0xA056a429661D5609709433ff25b8Ea82590A0053';

// 등산 시작
app.get('/start', (req, res) => {
    getContract().methods.start('0xA056a429661D5609709433ff25b8Ea82590A0053', 3).send({
        from: address,
        gas: '200000'
    })
    .once('receipt', receipt => {
        console.log(receipt);
        res.send('1');
    })
    .once('error', error => {
        console.log(error);
        res.send('fail');
    })
})

// 등산 종료
app.get('/end', (req, res) => {
    getContract().methods.end('0xA056a429661D5609709433ff25b8Ea82590A0053', 1, 5).send({
        from: address,
        gas: '200000'
    })
    .once('receipt', receipt => {
        console.log(receipt);
        res.send('ok');
    })
    .once('error', error => {
        console.log(error);
        res.send('fail');
    })
})

// 등산 기록 확인
app.get('/score/:idx', async (req, res) => {
    const result = await getContract().methods.getRecord('0xA056a429661D5609709433ff25b8Ea82590A0053', req.params.idx).call()
    res.json(result);
})

// 총 등산 횟수 확인
app.get('/count', async (req, res) => {
    const result = await getContract().methods.getLength('0xA056a429661D5609709433ff25b8Ea82590A0053').call()
    res.json(result);
})

// 서버 시작
app.listen(port, () => {
    console.log(`server start port ${port}`);
    const wallet = caver.klay.accounts.privateKeyToAccount('0x7799f99c68259cec434d35cbaf419bc1c3f8dce0b4db6f2e6a972ade4a58bdac');
    caver.klay.accounts.wallet.add(wallet);
});
