const express = require("express");
const dotenv = require("dotenv");
const Caver = require('caver-js');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 몽고 디비 연결
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
.then(() => console.log('connected to mongodb'))
.catch(e => console.error(e));

// wallet header
const walletHeaders = {
    headers: {
        "Authorization": 'Basic ' + Buffer.from(process.env.ACCESS_KEY + ':' + process.env.SECRET_ACCESS).toString('base64'),
        "X-Chain-Id": '1001'
    }
}

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
const DEPLOY_ADDRESS = '0x8F34C3c00479910D0cBF3CCa1E7bDb2b1E7E045e';

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
    getContract().methods.start(req.query.address, req.query.course).send({
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
    getContract().methods.end(req.query.address, req.query.idx, 5).send({
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

// 등산 기록 단일
app.get('/score', async (req, res) => {
    const result = await getContract().methods.getRecord(req.query.address, req.query.idx).call()
    res.json({...result, idx: req.query.idx});
})

// 등산 기록 목록
app.get('/list/:address', async (req, res) => {
    const score = await getContract().methods.lookUp(req.params.address).call();
    res.json({score});
})

// 새로운 지갑 주소 생성
app.get('/new', (req, res) => {
    axios.post('https://wallet-api.klaytnapi.com/v2/account', '', walletHeaders)
    .then(({data}) => {
        res.send(data.address);
    })
})

// 서버 시작
app.listen(process.env.PORT || 5000, () => {
    console.log('server start');
    const wallet = caver.klay.accounts.privateKeyToAccount('0x7799f99c68259cec434d35cbaf419bc1c3f8dce0b4db6f2e6a972ade4a58bdac');
    caver.klay.accounts.wallet.add(wallet);
});