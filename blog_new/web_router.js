const express = require('express');
const userController = require('./controllers/userController');
const articleController = require('./controllers/articleController');
const commentController = require('./controllers/commentController');
//创建路由对象
let router = express.Router();

//配置路由规则
router.get('/',articleController.showIndex)//文章显示首页
.get('/register', (req, res, next) => { //get请求同步提交
        return res.render('register');
})
.post('/doRegister', userController.doRegister)
.get('/active',userController.activeUser)//激活用户的功能
.get('/login',userController.showLogin)//显示登录页面
.post('/doLogin',userController.doLogin)//处理登录的验证
.get('/logout',userController.logout)//退出
.get('/getPicture',userController.getPicture)//生成图片
.get('/settings',userController.showSettings)//显示设置
.post('/upload',userController.upload)//上传图片
.post('/doSettings',userController.doSettings)//保存设置
.get('/publishArticle',articleController.showPublishArticle)//显示发布文章的页面
.post('/publish/article',articleController.doPublish)//发布文章
.get('/getArticlesByPage/:page',articleController.showIndex)//根据页数显示文章列表
.post('/searchByCondition',articleController.searchByCondition)//按照条件查找
.get('/searchByCondition/:page',articleController.searchByCondition)//按照条件查找
.get('/getArticleByAid',articleController.showArticle)//显示文章详情
.get('/edit/article/:aid',articleController.showEdit)//显示文章编辑
.post('/comment/saveComment',commentController.saveComment)//提交评论
module.exports = router;



