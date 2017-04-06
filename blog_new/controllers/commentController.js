const Comment = require('../models/comment');

/**
 * [saveComment 提交评论信息]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.saveComment = function(req,res,next){
   //获取数据
   let aid = req.body.articleId;
   let uid = req.body.uid;
   let content = req.body.content;
   //创建评论对象
   let comment = new Comment({
    aid,uid,content
   });
   comment.save(function(err,result){
       if(err)next(err);
       return res.redirect('/getArticleByAid?aid='+ aid);
   });
}