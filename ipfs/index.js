const express = require('express');
const Caver = require('caver-js')
const app = express();
const fs = require('fs');
const caver = new Caver()
caver.ipfs.setIPFSNode('ipfs.infura.io', 5001, true)


app.get('/', async (req,res) => {
  // const contents = Buffer.from("Text for ipfs test"); //원하는 텍스트 입력
  const contents = fs.readFileSync('./symbol.jpg'); //원하는 이미지 입력

  console.log("uploading data to IPFS. data =", contents) 
  const addedWithContents = await caver.ipfs.add(contents)
  console.log("uploaded.", addedWithContents)

  // Get contents from IPFS
  const fileFromIPFS = await caver.ipfs.get(addedWithContents)
  console.log("downloaded.", fileFromIPFS)

  console.log("hex representation: ", caver.ipfs.toHex(addedWithContents))
  res.render(addedWithContents);
  // res.redirect(`https://ipfs.io/ipfs/${addedWithContents}`);
})

app.listen(5000,()=>{
  console.log('server start');
});