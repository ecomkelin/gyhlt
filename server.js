const express = require('express');
const app = express();
const serverHttp = require('http').createServer(app);

const fs = require('fs');
const https = require('https');
const privkey = fs.readFileSync('../https/private.pem', 'utf8');
const certifig = fs.readFileSync('../https/file.crt', 'utf8');
const objcred = {key: privkey, cert: certifig};
const serverHttps = require('https').createServer(objcred, app);

// 加载本系统的配置项
const Ready = require('./ready');

const mongoose = require('mongoose');
// 要是用 Node.js 自带的 Promise 替换 mongoose 中的 Promise，否则有时候会报警告
mongoose.Promise = global.Promise;
// 需要链接的数据库地址
// mongoose.connect(Ready.dbUrl);
mongoose.connect(Ready.dbUrl,  {useNewUrlParser: true, useCreateIndex: true});
// useCreateIndex: true		// mongoose > 5.2.10
// useNewUrlParser: true		// mongodb > 3.1.0
//
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
app.use(session({
	secret: Ready.dbName,
	resave: false,
	saveUninitialized: true,
	store: new mongoStore({
		url: Ready.dbUrl,
		collection: 'sessions'
	})
}));

// cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// If extended is false, you can not post "nested object"
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded( { extended: true } ) );
app.use(bodyParser.json());

// 设置系统html编辑模板
app.set('views', './app/views');
app.set('view engine', 'pug');

// 设置系统的静态资源
const path = require('path');
const serveStatic = require('serve-static');
app.use(serveStatic(path.join(__dirname, "public")));
app.use(serveStatic(path.join(__dirname, "./app/html")));
app.use(serveStatic(path.join(__dirname, "./app/static")));

// 前端读取配置数据
app.locals.moment = require('moment');// 时间格式化
app.locals.Conf = require('./conf');// 
app.locals.dns = Ready.dns;// 
app.locals.cdn = Ready.cdn;// 

// 网页生成pdf用的
app.use(require('express-pdf'));

// 前端代码压缩
// app.use(require('compression')());

// 调用路由
require('./app/route/aaaConfRouter')(app);

// 如果没有路由，则跳转到404页面	
app.use(function(req, res, next) {
	res.render("404");
});

// 服务器监听
serverHttp.listen(Ready.portHttp, function(){
	console.log('Server start on port : ' + Ready.httpUrl);
});
serverHttps.listen(Ready.portHttps, function(){
	console.log('Server start on port : ' + Ready.httpsUrl);
});