let mysql=require('mysql');
function getConnection(){
  return mysql.createConnection({host:"localhost", user:"root", password:"password", database:"new_schema"});
}
let con=getConnection();

function queryDB(query,callb){
  return con.query(query,function (err, result, fields) {
    if (err) throw err;
    if(!result) callb(undefined);
    else callb(result);
  })
}

module.exports.getFollowedFighters=function(fn){
  queryDB(`SELECT * FROM fighters`,fn);
};

module.exports.follow=function (fighter, fn) {
  let sql=`INSERT INTO fighters (name,weight,record,country,image,url) VALUES (?,?,?,?,?,?)`
  con.query(sql,[fighter.name,fighter.weight,fighter.record,fighter.country,fighter.image,fighter.url],function (err, result, fields) {
    if(err) throw err;
      fn(result)
  })
};
module.exports.insertMatch=function(match,fn){
  let sql=`INSERT INTO calendar (fighter,opponent,event,date) VALUES (?,?,?,?)`
  con.query(sql,[match.fighter,match.opponent,match.event,match.date],function (err, result, fields) {
    if(err) throw err;
    fn(result)
  })
};

module.exports.deleteMatches=function(fighter,fn){
  let sql="DELETE FROM calendar where fighter= ?"
  con.query(sql,[fighter.name],function (err, result, fields) {
    queryDB(`SELECT * FROM calendar`,function (calendar) {
      fn(calendar);
    })
  })
};

module.exports.unfollow=function(fighter,fn){
  queryDB(`DELETE FROM fighters where url="${fighter.url}" `,function(result){
      fn(result.affectedRows)
  })
};

module.exports.insertCalendar=function(matches,fn){
  let c=0;
  queryDB(`DELETE FROM calendar`,function (result) {
    let sql=`INSERT INTO calendar (fighter,opponent,event,date) VALUES (?,?,?,?)`
    matches.forEach(match=>{
      con.query(sql,[match.fighter,match.opponent,match.event,match.date],function (err, result, fields) {
        if(err)throw err;
        c++;
        if(c==matches.length) fn(result);
      });
    })
  });
};

module.exports.getCalendar=function(fn){
  queryDB(`SELECT * FROM calendar`,fn);
};

module.exports.checkIfFollowing=function(url,fn){
  let sql=`SELECT * FROM fighters WHERE url='${url}'`;
  con.query(sql,function (err, result, fields) {
    if(err) throw err;
    fn(result);
  })
};

