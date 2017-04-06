'use strict';
const mysql = require('mysql');
const config = require('../config');
let pool  = mysql.createPool({
   host     : config.host,
   user     : config.user,
   password : config.password,
   database : config.database
});

//不需要频繁的开启和关闭连接，需要查询的时候，从连接池取出连接即可，使用完毕，放回连接池

/**
 * 通过model的调用从连接池中获取连接操作完毕，就释放连接
 * @param  {[type]} sql    [传入的sql语句]
 * @param  {[type]} params [sql语句对应的参数]
 * @return {[type]} callback    [function(err,data)]
 */
module.exports.query = function(sql,params,callback){//'select * from users',[]
      pool.getConnection(function(err, connection) {
      console.log('当前执行sql：'+sql,',当前参数:'+params);
      connection.query(sql,params,(err,result)=>{//function(err,data)
         callback(err,result);  //如果有数据，err就是null,如果没有数据err就有值
         connection.release();
      });
   });
}
