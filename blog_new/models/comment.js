const db = require('./db');

function Comment(comment){
    this.id = comment.id;
    this.content = comment.content; 
    this.time = comment.time; 
    this.uid = comment.uid; 
    this.aid = comment.aid; 
}

Comment.findCommentsByAid = function(aid,callback){
    db.query(`
SELECT
    t2.username,
    t2.pic,
    t1.*
FROM
    comments t1
LEFT JOIN users t2 ON t1.uid = t2.id
WHERE
    t1.aid = ?
        `,[aid],callback)
}

Comment.prototype.save = function(callback){
    db.query(`
INSERT INTO comments (content, time, uid, aid)
VALUES
    (?, CURRENT_TIMESTAMP ,?,?)
`,[this.content,this.uid,this.aid],callback);
}

module.exports = Comment;