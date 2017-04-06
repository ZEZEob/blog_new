"use strict";
let User = require('../models/user');
//加密对象
const utils = require('utility');
const fs = require('fs');
const picture = require('../commons/picture');
const formidable = require('formidable');//处理文件上传
const moment = require('moment');//处理日期
const fs_extra = require('fs-extra');
const path = require('path');

/**
 * [doRegister 注册用户]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.doRegister = function(req,res,next){
     //获取请求体数据
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let vcode = req.body.vcode;
    let formUser = new User({ //封装成对象
        username,
        password,
        email,
        vcode
    });
    //vcode要与图片生成的vcode结果一致
    if(req.session.vcode != vcode){
        return res.render('register', { msg: '验证码错误' });
    }
    //密码长度6-12位
    if (formUser.password.length < 6 || formUser.password.length > 12) {
        return res.render('register', { msg: '密码长度必须为6-12位之间' });
    }
    //用户名不存在
    User.findUserByUsername(formUser.username,function(err, users) {
        if (err) next(err);
        //不出异常，不代表有数据或者没有数据
        if (users.length != 0) {
            //存在用户 ： 用户名已经存在
            return res.render('register', { msg: '用户名已经存在' });
        }
        //没有用户判断email //email也要唯一
        formUser.findUserByEmail((err, users) => {
            if (err) next(err);
            if (users.length != 0) {
                //存在同样的邮箱
                return res.render('register', { msg: '邮箱已经存在' });
            }
            //加密密码再进行保存
            formUser.password = utils.md5(utils.md5(formUser.password));

            //注册用户--> 保存数据
            formUser.save((err, data) => {
                if (err) next(err);
                let token = utils.md5(utils.md5('itcast_' + formUser.username + '_itcast'));
                let href = '/active?username=' + formUser.username + '&token=' + token;
                let msg = `${formUser.username},您好，注册已经成功，用户状态暂未激活,请激活`;
                //提示用户
                return res.render('showNotice',{msg,href,info:href});
            });

        });

    });
};



/**
 * [avtiveUser 激活用户]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.activeUser = function(req,res,next){
    //首先通过req.query来获取请求参数对象
    //获取到username
    let username = req.query.username;
    let tokenOld = req.query.token;
    //进行加密
     let token = utils.md5(utils.md5('itcast_' + username + '_itcast'));
    //对比参数中token，如果相等就激活
    if(token === tokenOld){
        //激活成功 --修改激活标记
         return User.updateActiveFlagByUserName(username,(err,result)=>{
            if(err) next(err);
            if(result.changedRows === 0){
                return res.render('showNotice',{msg:'请勿重复激活'});
            }
            // console.log('激活成功')
          return res.render('showNotice',{msg:'激活成功!',href:'/',info:'点我到首页'});
        });
    }
    //非法激活
    return res.render('showNotice',{msg:'非法激活'});
};

/**
 * [showLogin 显示登录页]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.showLogin = function(req,res,next){
    //处理cookie带来的数据
    // console.log(req.headers.cookie);
    // console.log(req.cookies);//没有安装cookieParser，这个属性是undefine
    let obj = {};
    if(req.cookies.remember_me){ //如果该数据是空，没有cookie
                let username = req.cookies.username;
                let password = req.cookies.password;
                let remember_me = req.cookies.remember_me;
                password = Buffer.from(password,'base64').toString('utf8');
                let checked = '';
                if(remember_me === 'on'){
                    checked = 'checked';
                }
                obj = {
                      password,username,checked
                }
    }
   

    //返回登录页面
    return res.render('login',obj);
};
/**
 * [doLogin 处理登录的验证]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.doLogin = function(req,res,next){
    //接收数据
    let username = req.body.username;
    let password = req.body.password;
    let remember_me = req.body.remember_me;//记住我
    //什么情况不能进
    //1:用户名不存在
    
    User.findUserByUsername(username,function(err,users){
        if(err) next(err);
        if(users.length === 0 ){
            return res.render('login',{msg:'用户名或者密码不正确'});
        }
        //  1.5:如果有该用户，但是没有激活，提示用户激活
        let dbUser = users[0];
        if(dbUser.active_flag!=1){
            return res.render('login',{msg:'用户还未激活请到邮箱'+dbUser.email+'中验证'});
        }
         let md5Password = utils.md5(utils.md5(password));
         //2:密码不正确
         if(dbUser.password != md5Password){
            return res.render('login',{msg:'用户名或者密码不正确'});
         }  

        //完成记住我功能
        
        if(remember_me=== 'on'){
            //1:发给浏览器一把钥匙
            //获取一周的毫秒值
            let time = 1000 * 60 * 60 * 24 * 7;//记住我一周
            res.cookie('username',dbUser.username,{maxAge:time});//让服务器去写一个头信息
            let base64Pwd = Buffer.from(password).toString('base64');
            res.cookie('password',base64Pwd);//让服务器去写一个头信息
            res.cookie('remember_me',remember_me);//让服务器去写一个头信息
        }else{
            //没有勾选记住我，清除cookie
            res.cookie('username','',{maxAge:-1});
            res.cookie('password','',{maxAge:-1});
            res.cookie('remember_me','',{maxAge:-1});
        }
         //通过session来记住用户的数据
         req.session.user = dbUser;//connect.sid =xxxxsada
         return res.redirect('/');



    });
    
   
};
/**
 * [logout 退出程序]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.logout = function(req,res,next){
    req.session.user = null;
    res.render('logout');
};
/**
 * [getPicture 获取图片及答案]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getPicture = function(req,res,next){
    //获取图片及答案的对象
    let returnObj = picture.getPic();
    let anwser = returnObj.content+'';//将答案转成字符串
    //将答案挂载到session之上
    req.session.vcode = anwser;
    res.send(returnObj.buf);//将二进制数据返回
};

exports.showSettings = function(req,res,next){
    //获取数据
    if(!req.session.user)return res.redirect('/');//如果是从首页访问就驱逐跳转
    let username = req.session.user.username;
    User.findUserByUsername(username,(err,users)=>{//最好查找最新数据
        if(err) next(err);
        let user = users[0];
        return res.render('setting',{user});
    });
};
/**
 * [upload 接收上传图片]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.upload = function(req,res,next){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err) next(err);
        //移动文件: 文件的源头路径  -->目标路径
        let sourcePath  = files.pic.path;
        //引入项目根目录
        let projectRootPath = require('../config').projectRootPath;
        let returnPath = '/public/img/'+moment().format('YYYY-MM-DD')+'/'+Date.now();

        let extName = path.extname(files.pic.name);
        //拼接后缀名及文件路径
        returnPath += extName;

        //returnPath可以作为ajax的返回值

        //最后拼接上根目录
        let distPath = projectRootPath + returnPath;
        fs_extra.move(sourcePath,distPath,function(err){
            res.json({path:returnPath});
        });
    });
};
/**
 * [doSettings 保存设置]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.doSettings = function(req,res,next){
    //获取表单数据
    let username = req.body.username;
    let pic = req.body.pic;
    let formUser = new User({
        username,pic
    });
    //修改：更新
    formUser.update((err,result)=>{
        if(err) next(err);
        res.render('index',{user:formUser});
    });
}