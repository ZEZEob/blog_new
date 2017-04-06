const db = require('./db');
function Article(article){
    this.id = article.id;
    this.title = article.title;
    this.content = article.content;
    this.answerCount = article.answerCount;
    this.uid = article.uid;
}
/**
 * [save 保存文章数据]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Article.prototype.save = function(callback){
    db.query(`insert into articles (title,content,time,uid,answerCount) values (?,?,now(),?,0);`,[this.title,this.content,this.uid],callback);
}

Article.countArticles = function(callback){
    db.query(`select count(*) as total from articles`,[],callback);
}

Article.findArticles = function(offset,count,callback){
    db.query(`
SELECT
    t1.id 'aid',
    t1.title,
    t1.content,
    t1.time,
    t1.uid,
    t1.answerCount,
    t2.username,
    t2.pic
FROM
    articles t1
LEFT JOIN users t2 ON t1.uid = t2.id
LIMIT ?,?`,[offset,count],callback);
}

/**
 * [countArticlesByCondition 根据条件查找记录数]
 * @param  {[type]}   q  [description]
 * @return {[type]}        [description]
 */
Article.countArticlesByCondition = function(q,callback){
     db.query(`select count(*) as total from articles where title like ?`,['%'+q+'%'],callback);
}
/**
 * [findArticlesByCondition 根据条件查找记录]
 * @param  {[type]}   q  [description]
 * @param  {[type]}   offset  [description]
 * @param  {Function} count [description]
 * @return {[type]}        [description]
 */
Article.findArticlesByCondition = function(q,offset,count,callback){
    db.query(`
SELECT
    t1.id 'aid',
    t1.title,
    t1.content,
    t1.time,
    t1.uid,
    t1.answerCount,
    t2.username,
    t2.pic
FROM
    articles t1
LEFT JOIN users t2 ON t1.uid = t2.id
WHERE t1.title like ? LIMIT ?,?`
,['%'+q+'%',offset,count],callback);
}

Article.getArticlesByAid = function(aid,callback){
     db.query(`
SELECT
    t1.id 'aid',
    t1.title,
    t1.content,
    t1.time,
    t1.uid,
    t1.answerCount,
    t2.username,
    t2.pic
FROM
    articles t1
LEFT JOIN users t2 ON t1.uid = t2.id
WHERE t1.id = ?`
,[aid],callback);   
}

//导出对象
module.exports = Article;