const express = require("express");
const dotenv = require("dotenv");
const Caver = require('caver-js');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const port = 5000;

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
const factoryABI = require('./ABI/factoryABI.json');
const KIP7ABI = require('./ABI/KIP7ABI.json');
const KIP17ABI = require('./ABI/KIP17ABI.json');
const DEPLOY_ADDRESS = '0x5320C38e5b23534Ec56062b30bEE824EEA85a770';
const KIP7_ADDRESS = '0xb9d8261b561b79fd21c3466d30dfa007bd087a48';
const KIP17_ADDRESS = '0x872fdf97aa4a1e36684450f0e3594c5e841e12cc';

const getContract = () => {
  const contractInstance = factoryABI
      && DEPLOY_ADDRESS
      && new caver.klay.Contract(factoryABI, DEPLOY_ADDRESS);
  return contractInstance;
}

const getContract7 = () => {
  const contractInstance = factoryABI
    && KIP7_ADDRESS
    && new caver.klay.Contract(factoryABI, KIP7_ADDRESS);
  return contractInstance;
}

const getContract17 = () => {
  const contractInstance = KIP17ABI
    && KIP17_ADDRESS
    && new caver.klay.Contract(KIP17ABI, KIP17_ADDRESS);
  return contractInstance;
}

// 매니저 지갑
const address = "0xA056a429661D5609709433ff25b8Ea82590A0053";





// 토큰 지급
app.get('/reward', (req, res) => {
    let rdNum=Math.floor(Math.random()*2)
    if (rdNum==1){
        getContract().methods.mint(req.query.address, 10).send({
            from: address,
            gas: '200000'
        })
        .once('receipt', receipt => {
            console.log(receipt);
            res.send('success');
        })
        .once('error', error => {
            console.log(error);
            res.send('fail');
        }) 
    }
    else{
        console.log('sorry...');
    }
})

// 토큰 사용
app.get('/use', (req, res) => {
    getContract().methods.burnFrom(req.query.address, req.query.amount).send({
        from: address,
        gas: '200000'
    })
    .once('receipt', receipt => {
        console.log(receipt);
        res.send('used');
    })
    .once('error', error => {
        console.log(error);
        res.send('fail');
    })
})

// 사용자 토큰 갯수
app.get('/token', async (req, res) => {
    const result = await getContract7().methods.balanceOf(req.query.address).call()
    res.json({token:result});
})

// 인증서 발급
app.get('/cert', (req, res) => {
    getContract().methods.mintCert(req.query.address, req.query.course,req.query.id).send({
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

// 인증서 데이터 조회
app.get('/certData', async (req, res) => {
    const result = await getContract17().methods.certData(req.query.address,req.query.id).call()
    res.json({course:result[0],time:result[1]});
})

// http://localhost:5000/reward?address=0xA056a429661D5609709433ff25b8Ea82590A0053&

// 새로운 지갑 주소 생성
app.get('/new', (req, res) => {
    axios.post('https://wallet-api.klaytnapi.com/v2/account', '', walletHeaders)
    .then(({data}) => {
        res.send(data.address);
    })
})

// 서버 시작
app.listen(port, () => {
    console.log(`server start port ${port}`);
    const wallet = caver.klay.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
    caver.klay.accounts.wallet.add(wallet);
});