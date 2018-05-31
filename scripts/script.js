const ch = require('./run');
module.exports =  function(bot){
  
    bot.respond(/a/, async function(res){
      //res.send('很開心 ^^');
      //console.log("1234564")
      let qwe= await ch.check_hb()
      console.log(qwe)
       res.send('send mail');
    });
    
   
      
  }