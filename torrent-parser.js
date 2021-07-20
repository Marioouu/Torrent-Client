const fs=require('fs');
const bencode=require('bencode');
const bignum=require('bignum');
    

//torrent-parser.open

module.exports.open=filepath=>{
    return bencode.decode(fs.readFileSync(filepath));
}




//torrent-parser.size

module.exports.size=torrent=>{
   const size=torrent.info.files ? torrent.info.files.map(file=>file.length).reduce((a,b)=>a+b) : torrent.info.length;

   return bignum.toBuffer(size,{size:8});
}





//torrent-parse.infoHash

module.exports.infoHash=torrent=>{
    const info=bencode.decode(torrent.info);
    return crypto.createHash('sha1').update(info).digest();
}
