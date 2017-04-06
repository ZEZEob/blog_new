'use strict';

const express = require('express');
//引入handlebars
const handlebars = require('express-handlebars');
//引入cookie-parser
const cookieParser = require('cookie-parser');
//引入express-session对象
const session = require('express-session');
const path = require('path');
let userController = require('./controllers/userController');
//引入路由对象
let web_router = require('./web_router');
let hbsObj = handlebars({ //构建hbs对象
    defaultLayout: 'main', //设置主体部分
    partialsDir: 'views/parts', //设置重用头尾部分
    extname: '.hbs' // 设置这个以后，app.engine名字要一致，因为express需要在rander的时候查找
});

//引入body-parser对象
const bodyParser = require('body-parser');

//创建服务器对象
let app = express();

//设置模板引擎
app.engine('hbs', hbsObj);
//设置express的渲染时用的模板
app.set('view engine', 'hbs');

//处理静态资源 url:/public, url =  （/public）暗号 + url
app.use('/public', express.static('public')); //   /public/js/bootstrap-paginator.js
//通过中间件解析body
app.use(bodyParser.urlencoded({ extended: false }));

//在路由处理以前先解析cookie
app.use(cookieParser());
//加入session中间件
app.use(session({
  secret: 'blog',
  resave: false, //是否强制保存,如果在请求发生以后，具体session完全没有发生改变，也存储一次
  saveUninitialized: true,//是否保存未初始化的数据到session,选择true,一访问首页就会分配session
  // cookie: { secure: true } //only https
}));
//把路由加入到中间件队列
app.use(web_router);

//开启服务器
app.listen(80, '127.0.0.1');
