const Article = require('../models/article');
const User = require('../models/user');
const Pager = require('../models/pager');
const config = require('../config');
const Comment = require('../models/comment');
const md = require('markdown-it')();

/**
 * [showPublishArticle 显示文章页面]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.showPublishArticle = function(req,res,next){
    res.render('publish');
};

exports.doPublish = function(req,res,next){
        // - 文章id,文章标题(表单发送),文章内容(表单),uid用户ID(session),answerCount(0)，发表时间(当前时间)
    let title = req.body.title;//获取文章标题
    let content = req.body.content;//获取文章内容
    let uid = req.session.user.id;
    let answerCount = 0;

    //构造对象
    let article = new Article({
        title,content,uid,answerCount
    });
    //把markdown数据转换成html
    article.content = md.render(article.content);

    //调用保存的函数
    article.save(function(err,result){
        if(err)next(err);
        //页面去哪里
        //页面保存以后立刻跳转到查看页面详情
        res.redirect('/getArticleByAid?aid='+result.insertId);
    });

};
/**
 * [showIndex 显示文章首页根据分页]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.showIndex = function(req,res,next){
    
    // 定义产品每页显示数
    let viewCount = config.viewCount;

    // 先查询具体的记录数
    Article.countArticles(function(err,result){
        if(err)next(err);
        console.log(result[0].total);
        //获取记录数
        let total = result[0].total;
        // 求合计页数 
        let totalPages = Math.ceil(total / viewCount);
        // 定义当前页
        let currentPage = req.params.page || 1;
        //构造分页对象
        let pager = new Pager({
            totalPages,currentPage,pageUrl:'/getArticlesByPage'
        });

        //以上部分关于分页显示栏
        //==========================================
        //以下部分是数据的查询
        let offset = (currentPage - 1) * viewCount;
        let count = viewCount;
        Article.findArticles(offset,count,function(err,articles){
               //查找作者信息

              //区分是登录后进入首页还是未登录
                let user = {};
                if(req.session){
                    user = req.session.user;
                }
                return res.render('index',{user,articles,pager});


        });//select * from articles limit ?,?
    });

}

// 思路，由于分页本身可以共用，如果有页数就走页数，没有页数走1
// exports.showArticlesByPage = function(req,res,next){
//     //显示哪些页数
//     let currentPage = req.params.page;
//     // 求一共有多少页
//     let start = (currentPage -1 ) * viewCount;
//     //一共有多少页
//     //查询出所有的记录数/ viewCount 向上取整
// }
// 
/**
 * [searchByCondition 按照搜索条件查询]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.searchByCondition = function(req,res,next){
    //接收参数
    let q = req.body.q;//只能在搜索以后来点击翻页
    //点击翻页Q不存在,
    if(typeof req.app.locals.q === 'undefined'){//初次使用
        req.app.locals.q = q; //我
    }else{
        //有值我就使用之前的值
        q = req.app.locals.q;//我爱——>我
    }

     // 定义产品每页显示数
    let viewCount = config.viewCount;

    // 先查询具体的记录数
    Article.countArticlesByCondition(q,function(err,result){
        if(err)next(err);
        //获取记录数
        let total = result[0].total;
        // 求合计页数 
        let totalPages = Math.ceil(total / viewCount);
        // 定义当前页
        let currentPage = req.params.page || 1;
        //构造分页对象
        let pager = new Pager({
            totalPages,currentPage,pageUrl:'/searchByCondition'
        });

        //以上部分关于分页显示栏
        //==========================================
        //以下部分是数据的查询
        let offset = (currentPage - 1) * viewCount;
        let count = viewCount;
    
        Article.findArticlesByCondition(q,offset,count,function(err,articles){
              //区分是登录后进入首页还是未登录
                let user = {};
                if(req.session){
                    user = req.session.user;
                }
                return res.render('index',{user,articles,pager});


        });//select * from articles limit ?,?
    });
}
/**
 * [showArticle 显示详情]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.showArticle = function(req,res,next){
    //获取显示文章id
    let aid = req.query.aid;
    Article.getArticlesByAid(aid,function(err,articles){//{{article.title}}
        if(err)next(err);
        //查询与文章相关的评论
        Comment.findCommentsByAid(aid,function(err,comments){
            if(err)next(err);
            return res.render('article',{article:articles[0],comments,user:req.session.user})
        });
    });
}

exports.showEdit = function(req,res,next){
    //获取编辑哪篇文章
    let aid = req.params.aid;
    Article.getArticlesByAid(aid,function(err,articles){
        if(err)next(err);
        return res.render('edit',{article:articles[0]});
    });
}