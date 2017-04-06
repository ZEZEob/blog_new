 'use strict';
 const captchapng = require('captchapng');
 const fs = require('fs');


exports.getPic = function(){
    let content = parseInt(Math.random()*9000+1000);

     var p = new captchapng(80,30,content);
        p.color(0, 0, 0, 0); 
        p.color(80, 80, 80, 255); 
        var img = p.getBase64();
        var imgbase64 = new Buffer(img,'base64');

        return {
            buf:imgbase64,
            content
        }       
}
