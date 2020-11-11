const express = require("express");
const dotenv = require("dotenv");
const Caver = require('caver-js');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs')

const app = express();
dotenv.config();

https://stackoverflow.com/questions/41915955/using-react-native-camera-how-to-access-saved-pictures

const Course = require('./model/Course');
const Score = require('./model/Score');
const Point = require('./model/Point');
const Record = require('./model/Record');
const User = require('./model/User');

let tokenId = 1005;

// const ipfsClient = require('ipfs-http-client');
// const fileUpload = require('express-fileupload');
// const ipfs = new ipfsClient({host: 'localhost', port : '5000',protocol:'http'});
// app.use(fileUpload());

// const tImg = multer({dest: 'images/'}) //dest : 저장 위치

// router.post('/upload',upload.single('img'),(req,res) => {
//     res.json(req.file)
//     console.log(req.file)
// })

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
const KIP7_ADDRESS = '0x20ed2e5bf766d4bffbbe298ad7d3a02e241f7a6f';
const KIP17_ADDRESS = '0x19ddaee94efa8a7adfacf6468a9c2b61462fc714';

const getContract = () => {
  const contractInstance = factoryABI
      && DEPLOY_ADDRESS
      && new caver.klay.Contract(factoryABI, DEPLOY_ADDRESS);
  return contractInstance;
}

const getContract7 = () => {
  const contractInstance = KIP7ABI
    && KIP7_ADDRESS
    && new caver.klay.Contract(KIP7ABI, KIP7_ADDRESS);
  return contractInstance;
}

const getContract17 = () => {
  const contractInstance = KIP17ABI
    && KIP17_ADDRESS
    && new caver.klay.Contract(KIP17ABI, KIP17_ADDRESS);
  return contractInstance;
}

// 매니저 지갑
const address = '0xA056a429661D5609709433ff25b8Ea82590A0053';

// 등산 기록 등록 및 업데이트
app.post('/score', (req, res) => {
    if(req.body.score) {
        Score.findOne()
        .populate('course')
        .sort('-start')
        .exec((err, score) => {
            if(err) return res.json({result: 0, err});
            
            if(req.body.score > score.score && score.course.seq == req.body.course) {
                let updateData = {
                    score: req.body.score
                }
                // 등산 완료 여부 체크 후 마지막 시간 등록
                if(score.course.courseDetail.length-1 == req.body.score) {
                    updateData.end = new Date();
                }

                Score.findOneAndUpdate({_id: score._id}, updateData, err => {
                    if(err) return res.json({result: 0, err});

                    // 해당 포인트 체크 시간 기록
                    record = new Record();
                    record.score = score._id
                    record.point = score.course.courseDetail[req.body.score];
                    record.save(err => {
                        if(err) console.log(err);

                        // 등산 완료 시 태깅한 개수만큼 토큰 보상
                        if(updateData.end) {
                            Record.find({score: score._id}, (err, cnt) => {
                                tokenCnt = cnt.length;

                                // 코스 완료 보상
                                getContract().methods.mint(req.body.address, tokenCnt).send({
                                    from: address,
                                    gas: '200000'
                                })
                                .once('receipt', () => {
                                    res.json({result: 1, id: score._id, finish: tokenCnt});
                                })
                                .once('error', error => {
                                    console.log(error);
                                    res.json({result: 1, id: score._id});
                                }) 
                            })
                        } else {
                            // 랜덤 토큰 지급
                            const rdNum=Math.floor(Math.random()*2);
                            if (rdNum==1){
                                getContract().methods.mint(req.body.address, 1).send({
                                    from: address,
                                    gas: '200000'
                                })
                                .once('receipt', () => {
                                    res.json({result: 1, id: score._id, token: 1});
                                })
                                .once('error', error => {
                                    console.log(error);
                                    res.json({result: 1, id: score._id});
                                }) 
                            } else {
                                res.json({result: 1, id: score._id});
                            }
                        }

                    })
                })
            } else {
                res.json({result: 0});
            }
        })
    
    // 등산 기록 등록
    } else {
        score = new Score();
        score.address = req.body.address;
        score.score = req.body.score
    
        Course.findOne({seq: req.body.course}, (err, course) => {
            if(err) return res.json({result: 0, err})
            
            score.course = course._id;
            score.save(err => {
                if(err) return res.json({result: 0, err});
                
                // 해당 포인트 체크 시간 기록
                record = new Record();
                record.score = score._id
                record.point = course.courseDetail[req.body.score];
                record.save(err => {
                    if(err) console.log(err);
                })

                // 랜덤 토큰 지급
                const rdNum=Math.floor(Math.random()*2);
                if (rdNum==1){
                    getContract().methods.mint(req.body.address, 1).send({
                        from: address,
                        gas: '200000'
                    })
                    .once('receipt', () => {
                        res.json({result: 1, id: score._id, token: 1});
                    })
                    .once('error', error => {
                        console.log(error);
                        res.json({result: 1, id: score._id});
                    }) 
                } else {
                    res.json({result: 1, id: score._id});
                }
            })
        })
    }
})

// 등산 기록 단일 조회
app.get('/score/:id', (req, res) => {
    Score.findOne({_id: req.params.id})
    .populate('course')
    .exec((err, score) => {
        if(err) return res.json({result: 0, err})
        
        res.json({result: 1, score})
    })
})

// 등산 기록 목록
app.get('/list/:address', (req, res) => {
    Score.find({address: req.params.address})
    .populate('course')
    .sort('-start')
    .exec((err, scores) => {
        if(err) return res.json({result: 0, err})
        res.json({result: 1, scores})
    })
})

// 토큰 충전
app.get('/charge', (req, res) => {
    getContract().methods.mint(req.query.address, req.query.amount).send({
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
})

// // 토큰 사용
// app.get('/use', (req, res) => {
//     getContract().methods.burnFrom(req.query.address, req.query.amount).send({
//         from: address,
//         gas: '200000'
//     })
//     .once('receipt', receipt => {
//         console.log(receipt);
//         res.send('used');
//     })
//     .once('error', error => {
//         console.log(error);
//         res.send('fail');
//     })
// })

// 사용자 토큰 갯수
app.get('/token/:address', async (req, res) => {
    const result = await getContract7().methods.balanceOf(req.params.address).call()
    res.json({token:result});
})

// 인증서 발급
app.get('/cert', (req, res) => {
    getContract().methods.mintCert(req.query.address, req.query.course,tokenId).send({
        from: address,
        gas: '200000'
    })
    .once('receipt', receipt => {
        tokenId++;
        Score.findOneAndUpdate({_id : req.query.scoreId},{token: tokenId},(err)=>{
            if(err) return res.send('fail');
            res.send('ok');
        })
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
// 

// 새로운 지갑 주소 생성
app.get('/new', (req, res) => {
    axios.post('https://wallet-api.klaytnapi.com/v2/account', '', walletHeaders)
    .then(({data}) => {
        user = new User();
        user.address = data.address;
        user.save(err => {
            if(err) return res.send(null);
            res.send(data.address);
        })
    })
})

// 단일 코스 정보
app.get('/course/:idx', (req, res) => {
    Course.findOne({seq: req.params.idx})
    .populate({path: 'courseDetail', options: {sort: {'seq': 1}}})
    .exec((err, course) => {
        if(err) res.json({result: 0, err})
        else res.json({result: 1, course})
    })
})

// 코스 목록
app.get('/course', (req, res) => {
    Course.find({})
    .populate({path: 'courseDetail', options: {sort: {'seq': 1}}})
    .exec((err, list) => {
        if(err) res.json({result: 0, err})
        else res.json({result: 1, list})
    })
})

// nfc id로 코스 정보 가져오기
app.get('/nfc/:id', (req, res) => {
    Point.find({nfc: req.params.id})
    .populate('course')
    .exec((err, point) => {
        if(err) return res.json({result: 0, err})
        res.json({result: 1, point})
    })
})

// 유저 정보 수정
app.post('/user', (req, res) => {
    User.findOneAndUpdate(
        {address: req.body.address}, 
        {
            name: req.body.name,
            email: req.body.email
        }, 
        {new: true}, 
        (err, user) => {
            if(err) return res.json({result: 0, err})
            res.json({result: 1, user});
    })

})

// 
app.get('/', (req, res) => {
    Score.aggregate([
        {$match: {end: {$ne: null}}},
        {$group: {
            _id: "$address",
            count: {$sum: 1}
        }}
    ])
    .exec((err, data) => {
        console.log(err)
        console.log(data)
    })

    res.send('23')
})

let img = require('fs').readFileSync('./klaytn.jpg');
let testFileName = './klaytn.jpg'
let contents;
let addedWithContents;

app.get('/ipfs/set', (req,res)=>{
    tcaver.ipfs.setIPFSNode('ipfs.infura.io', 5000, true)
    console.log('set')
})

app.get('/ipfs/create', (req,res)=>{
     // Create test txt file for IPFS
     fs.openSync(testFileName, 'w+')
     fs.writeFileSync(testFileName, 'test data for IPFS')
     console.log(testFileName)
})

app.get('/ipfs/add1', (req,res)=>{
    // Add file to IPFS with file contents
    contents = fs.readFileSync(testFileName)
    console.log("add1")
    console.log(contents);
})

app.get('/ipfs/add2',async (req,res)=>{
    //  tcaver.ipfs.setIPFSNode('ipfs.infura.io', 5000, true)
    // Add file to IPFS with file contents
    // const addedWithContents = await tcaver.ipfs.add(contents)
    // expect(typeof addedWithContents).to.equal('string')
    contents=await tcaver.ipfs.add(testFileName)
    console.log(contents)

})

app.get('/ipfs/get',async (req,res)=>{
    // Get contents from IPFS
    const fileFromIPFS = await tcaver.ipfs.get(addedWithContents)
    console.log(fileFromIPFS);
    console.log("get")
})


app.get('/api', (req, res) => {
    res.send('1')
})

// 서버 시작
app.listen(process.env.PORT || 5000, () => {
    console.log('server start');
    const wallet = caver.klay.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
    caver.klay.accounts.wallet.add(wallet);
})