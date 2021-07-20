const crypto =require('crypto');
const Buffer=require('buffer').Buffer;
let id=null;

module.exports.genId=()=>{
    if (!id){
        id=crypto.randomBytes(20);
        Buffer.from('AT0001','utf8').copy(id,0);
    }
    return id;
}