'use strict';
const db = require('./db');

function User(user) {
    this.username = user.username;
    this.password = user.password;
    this.email = user.email;
    this.vcode = user.vcode;
    this.pic = user.pic;

}
/**
 * 查找用户通过用户名
 * @param  {Function} callback [回调函数]
 * @return {[type]}            [description]
 */
// User.prototype.findUserByUsername = function(callback) { //function(err,data)
//         db.query('select * from users where username = ?', [this.username], callback);
// }


//由于findUserByUsername函数使用的时候只用到了一个值，为了其他地方方便使用，挂载到构造函数上，条件作为参数来传递就可以,如果查询不到是返回[{}]
User.findUserByUsername = function(username,callback){
    db.query('select * from users where username = ?', [username], callback);
}

    /**
     * 通过email查找用户信息
     * @param  {Function} callback [回调函数]
     * @return {[type]}            [description]
     */
User.prototype.findUserByEmail = function(callback) {
    db.query('select * from users where email = ?', [this.email], callback);
}

User.prototype.save = function(callback) {
    db.query(`insert into users 
        (username,password,email,active_flag) 
        values (?,?,?,0)
        `,[this.username,this.password,this.email],callback);
}
/**
 * [updateActiveFlagByUserName 通过用户名更新激活状态]
 * @param  {[type]}   username [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
User.updateActiveFlagByUserName = function(username,callback){
    db.query(`update users set active_flag = 1 where username = ?`,[username],callback);
}

/**
 * [update 更新操作]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
User.prototype.update = function(callback){
    db.query(`update users set pic = ? where username = ?`,[this.pic,this.username],callback);
};

//导出
module.exports = User;
