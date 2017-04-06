 const captchapng = require('captchapng');
 const fs = require('fs');
     var p = new captchapng(80,30,parseInt(Math.random()*9000+1000));
        p.color(0, 0, 0, 0); 
        p.color(80, 80, 80, 255); 
        var img = p.getBase64();
        console.log(img);
        var imgbase64 = new Buffer(img,'base64');
        // response.writeHead(200, {
        //     'Content-Type': 'image/png'
        // });
        // response.end(imgbase64);
        // 
        console.log(imgbase64);
        fs.writeFile('./temp.png',imgbase64,(err)=>{
            if(err) throw err;
            console.log('写入完毕');
        })
