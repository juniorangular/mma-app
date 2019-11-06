const app = require('express')();
const express=require('express');
const http=require('http').Server(app);
const io= require('socket.io')(http);
const $ = require('cheerio');
const rp=require('request-promise');
const db=require('./db.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const request = require('request');
const schedule=require('node-schedule');
app.use(express.static('public'));
app.use('/images',express.static(__dirname+'/images'));
let fightersTable;

io.on("connection",socket=>{

  socket.on('getFollowedFighters',()=>{
    db.getFollowedFighters(function (result) {
      socket.emit('followedFighters',result);
    });
  });
  socket.on('loadCalendar',()=>{
    db.getCalendar(function (result) {
      socket.emit('calendar',result);
    })

  });
  socket.on('loadFightersTable',(name)=>{
    let url="https://www.tapology.com/search?term="+name;
    rp(url)
      .then(function(data){
        fightersTable =$('.searchResultsFighter >.fcLeaderboard',data);
        editTable(fightersTable);
        socket.emit('fightersTable',fightersTable.toString())
      })
      .catch(function(err){
      });

  });
  socket.on('follow',fighter=>{
      rp(fighter.url)
      .then(function(data){
        let img=$('.fighterImg img',data).attr('src');
        let nameWithoutQuotes=fighter.name.replace(/"/g,"");
        let imageName='images/'+nameWithoutQuotes+'.jpg';
        request(img).pipe(fs.createWriteStream(imageName));
        fighter.image=imageName;

        db.follow(fighter,function (result) {
          if(result.affectedRows===1){
            socket.emit('followed',fighter);
            updateCalendar(fighter,socket);
          }
        });
      })
      .catch(function(err){
      });
  });
  socket.on('unfollow',fighter=>{//izbrisi iz baze match i fetchuj calendar
    db.unfollow(fighter,function(result){
      fs.unlink(fighter.image, function(err) {
        if (err) throw err;
        db.deleteMatches(fighter,function (calendar) {
          socket.emit('unfollowed',fighter);
          socket.emit('calendar',calendar);
        });
      });
    })
  })
});
http.listen(4444);
console.log('Server Listening on 4444');

var j = schedule.scheduleJob('0 0 * * *', function(){//run everyday at midnight
  db.getFollowedFighters(function (fighters) {
    (async () => {
      let urls = [];
      fighters.forEach(f => urls.push(f.url));
      let browser = await puppeteer.launch();
      let page = await browser.newPage();
      let result = [];
      for (let i = 0; i < fighters.length; i++) {
        await page.goto(urls[i], {waitUntil: 'networkidle0', timeout: 0});
        await page.waitForSelector('.fighterFightResults', {visible: true, timeout: 0});
        let data = await page.evaluate(() => {
          let opponent, event, date, fighter;
          if (document.querySelector('[data-result="upcoming"]')) {
            fighter = document.querySelectorAll('.fighterUpcomingHeader h1')[1].innerText;
            opponent = document.querySelector('[data-result="upcoming"] .name').innerText;
            event = document.querySelector('[data-result="upcoming"] .notes').innerText;
            date = document.querySelector('[data-result="upcoming"] .date').innerText;
          }
          return {
            fighter,
            opponent,
            event,
            date
          }
        });
        if(!isEmpty(data))
          result.push(data);
      }
      db.insertCalendar(result,function (res) {}) ;
      await browser.close();
    })();
  });
});
function isEmpty(obj) {
  for(let key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
  }
  return true;
}
function updateCalendar(fighter,socket) {///sort not working
    puppeteer
      .launch()
      .then(browser => browser.newPage())
      .then(page => {
        return page.goto(fighter.url,{ timeout: 0,waitUntil: 'networkidle0' }).then(function() {
          return page.content();
        });
      })
      .then(html => {
        const ch = $.load(html);
        let eventDiv=ch('.fighterFightResults ul li [data-result="upcoming"]');
        let date=eventDiv.find('.date').text();
        let opponent=eventDiv.find('.name').text();
        let event=eventDiv.find('.notes').text();

        if(event){
          let match={};
          match.fighter=fighter.name;
          match.opponent=opponent;
          match.date=date;
          match.event=event;
          db.insertMatch(match,function (match) {
            db.getCalendar(function (result) {
              socket.emit('calendar',result);
            })
          })
        }else {
          db.getCalendar(function (result) {
            socket.emit('calendar',result);
          })
        }
      })
      .catch(console.error);

}
function editTable(fightersTable){
  //add another column with follow button
  $('tr',fightersTable).filter(i=>i==0).append('<th></th>');
  $('tr',fightersTable).filter(i=>i>0).append('<td class="follTd"></td>');
  $('a',fightersTable).each(function() {
    $(this).attr("href", function(index, old) {return "https://www.tapology.com"+old;});
  });
}













