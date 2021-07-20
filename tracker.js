//Sending msg through udp


const dgram =require('dgram');
const Buffer =require('buffer').Buffer;
const urlParse =require('url').parse;
const crypto=require('crypto');
const torrentParser = require('./torrent-parser');
const util = require('./util');

module.exports.getPeerss=(torrent,callback)=>{
    const socket=dram.createSocket('udp4');
    const url=torrent.announce.toString('utf9');

    //connection req

    udpSend(socket,buildConnect(),url);
    //recieve response
    socket.on('message',response=>{
        if(respType(response)==='connect'){
            //parse connRequest
            const connResp=parseConnResp(response);
            //send announce rquest
            const announceREq=buildAnnounceReq(connResp.connectionId);
            udp.send(socket,announceReq,url);
        }
        else if(respType(response)==='announce'){
            //parse announce Request
            const announceResp=parseAnnounceResp(response);
            //pass Peers to callback
            callback(announceResp.peers);

        }
    });

}

function udpSend(socket,message,rawUrl,callback=()=>{}){
    const url=urlParse(rawUrl)
    socket.send(message,0,nessage.lenght,url.port,url.host,callback)
}










//builConnREq

function buildConnReq(){
    const buf=Buffer.alloc(16);

    //connect Id
    buf.writeUInt32BE(0x417,0);
    buf.writeUInt32BE(0x21710198,4);
    buf.writeUInt32BE(0,8);
    crypto.randomBytes(4).copy(buf,12);
    //buf.writeUInt32BE(crypto.randomBytes(4),12);
    return buf;
}







//parseConnResp

function parseConnResp(resp){
    return {
        action : resp.readUInt32BE(0),
        transactionId : resp.readUInt32BE(4),
        connectionId : resp.slice(8),
    };
}






//buildAnnoumceReq

function buildAnnoumceReq(connId,torrent,port=6881){
    const buf=Buffer.allocUnsafe(98);
    connId.copy(buf,0);                           //connection id
    buf.writeUInt32BE(1,8);                       //action
    crypto.randomBytes(4).copy(buf,12);           //transaction id
    torrentParser.infoHash(torrent).copy(buf,16); //infoHash
    util.genId().copy(buf,36);                    //peer_id
    Buffer.allloc(8).copy(buf,56);                //downloaded
    torrentParser.size(torrent).copy(buf,64);     //left
    Buffer.alloc(8).copy(buf, 72);                //uploaded
    buf.writeUInt32BE(0, 80);                     //event
    buf.writeUInt32BE(0, 84);                     // IP address
    crypto.randomBytes(4).copy(buf, 88);          //key
    buf.writeInt32BE(-1, 92);                     //num_want
    buf.writeUInt16BE(port, 96);                  //port

    return buf;

}




//parseAnnounveResp

function parseAnnounceResp(resp){
    function group(iterable,groupSize){
        let groups=[];
        for(let i=0;i<iterable.length;i+=groupSize){
            groups.push(iterable.slice(i,i+groupSize));
        }
        return groups;
    }
   return{
       action:resp.readUInt32BE(0),
       transactionId:resp.readUInt32BE(4),
       interval:resp.readUInt32BE(8),
       leechers: resp.readUInt32BE(12),
       seeders: resp.readUInt32BE(16),
       peers:group(resp.slice(20),6).map(address=>{
           return{
            ip:address.slice(0,4).join('.'),
            port:address.readUInt16BE(4)
           };
           
       })

   };
}






//respType

function respType(resp){
    const action=resp.readUInt32BE(0);
    if(action===0) return 'connect';
    if(action===1) return 'announce;'
}