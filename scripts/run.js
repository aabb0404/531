module.exports.check_hb = function (){
const mysql = require('mysql');
const winston = require('winston');
// const moment = require('moment');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dog01050435@gmail.com',
    pass: '01050435'
  }
});

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'pi-tokyo.cg2pfxtgs7ya.ap-northeast-1.rds.amazonaws.com',
  user: 'shannon',
  password: 'PIpigogogo123',
  database: 'v2-prod',
  multipleStatements: true,
  timezone: 'UTC',
  port: 63306,
});
const queryPromise = (sql, params = []) => {
  return new Promise((resolve, reject) => {
          pool.query(sql, params, (err, results, fields) => {
              if (err) {
                  winston.error(err);
                  winston.error(sql);
                  reject(err);
                  return;
              }
              resolve(JSON.parse(JSON.stringify(results)), fields);
          });
      })
      .catch((error) => {
          winston.error('caught', error);
      });
};

hb_chk().then((timeout)=>{
  if(timeout[0]==0){ //timeout[0] >=12 &&
 console.log('ok')
  }
  else
  {
    const mailOptions = {
      from: 'dog01050435@gmail.com',
      to: 'dog01050435@gmail.com',
      subject: 'Sending Email using Node.js',
      text: 'error look pigo.tw:3008\n'+timeout[1]+'\n連續性'+timeout[2]
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
});

async function hb_chk() {
let now = new Date();
let msof10mins = 10 * 60 * 1000;
let msof20mins = 20 * 60 * 1000;
let utctimestamp = new Date(now.getTime() - msof10mins).getTime() / 1000;
let utctimestamp_last = new Date(now.getTime() - msof20mins).getTime() / 1000;
let hbSql = `select hb.receiverId, hb.heartbeatTime, r.MAC,
rs.name from ReceiverHeartbeat hb
join Receiver r
on r.id = hb.receiverId
join ReceiverSettings rs
on r.id = rs.receiverId and rs.isActive = 1
where hb.receiverId in (select id from Receiver 
where isActive = 1) and 
UNIX_TIMESTAMP(hb.heartbeatTime) >=${utctimestamp}`;
let hbSql_last = `select hb.receiverId, hb.heartbeatTime, r.MAC,
rs.name from ReceiverHeartbeat hb
join Receiver r
on r.id = hb.receiverId
join ReceiverSettings rs
on r.id = rs.receiverId and rs.isActive = 1
where hb.receiverId in (select id from Receiver 
where isActive = 1) and 
UNIX_TIMESTAMP(hb.heartbeatTime) >=${utctimestamp_last}`;
let heartbeatLogDB = await queryPromise(hbSql);
let heartbeatLog = heartbeatLogDB.reduce((cul, cur) => {
  if (!cul[cur.name]) {
      cul[cur.name] = 0;
     
  }
  cul[cur.name] += 1;
  return cul;
}, {});
let result = [];
let err =[];
let ans=[];
let err_er=[];
    for (const name in heartbeatLog) {
        if (heartbeatLog.hasOwnProperty(name)) {
            result.push([name, heartbeatLog[name]]);
            if(heartbeatLog[name]<=7)
            {
              err.push([name, heartbeatLog[name]]);
            }
        }
    }
    for(let i=0;i< err.length;i++){
      err_er.push(err[i][0],err[i][1]);
    }


    let heartbeatLogDB_last = await queryPromise(hbSql_last);
    let heartbeatLog_last = heartbeatLogDB_last.reduce((cul_last, cur_last) => {
      if (!cul_last[cur_last.name]) {
          cul_last[cur_last.name] = 0;
      }
      cul_last[cur_last.name] += 1;
   //   console.log(cul_last)
      return cul_last;
    }, {});
  let result_last=[];
  let err_last=[];
  let err_er_last=[];
    for (const name in heartbeatLog_last) {
      if (heartbeatLog_last.hasOwnProperty(name)) {
          result_last.push([name, heartbeatLog_last[name]]);
      }
  }
//console.log(result_last)
let ans_time=[];
  for(let i=0;i< result_last.length;i++){
  //  console.log(result_last[i][0])
    for(let j=0;j< result.length;j++){
     // console.log(result[j][0]);
    if(result_last[i][0]==result[j][0]){
      if(result_last[i][1]-result[j][1]<5){
        ans_time.push(result_last[i][0])
      }
           
      }
    }
  }
    if(ans_time==''){
      ans_time='is ok'
    }
    if(err.length>0){
      ans=[err.length,err_er,ans_time]
    }
    else{
      ans=[err.length]
    }
    console.log(ans);
    return ans
    /*
let heartbeatLogDB =  queryProxmise(hbSql).then((qwe)=>{
})*/ 
}


}