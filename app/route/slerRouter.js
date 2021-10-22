const Index = require('../controllers/aaIndex/index');

const Qun = require('../controllers/user/sler/qun');
const Qunpd = require('../controllers/user/sler/qunpd');

const Din = require('../controllers/user/sler/din');

const MdBcrypt = require('../middle/middleBcrypt');
const MdRole = require('../middle/middleRole');
const MdPicture = require('../middle/middlePicture');
const MdFile = require('../middle/middleFile');
const MdExcel = require('../middle/middleExcel');

const multipart = require('connect-multiparty');
const postForm = multipart();

module.exports = function(app){

	app.get('/sler', MdRole.slerIsLogin, (req, res) => {
		let crUser = req.session.crUser;
		res.render('./user/sler/index/index', {
			title: '公司管理',
			crUser : crUser,
		})
	});

	/* =================================== compd 询价商品 =================================== */
	app.get('/slQunpdUp/:id', MdRole.slerIsLogin, Qunpd.slQunpdUp)
	app.get('/slQunpdDel/:id', MdRole.slerIsLogin, Qunpd.slQunpdDel)

	app.post('/slQunpdNew', MdRole.slerIsLogin, postForm, MdPicture.photoNew,MdPicture.sketchNew,MdPicture.imgsNew, Qunpd.slQunpdNew)
	app.post('/slQunpdUpd', MdRole.slerIsLogin, postForm, MdPicture.photoNew,MdPicture.sketchNew,MdPicture.imgsNew, Qunpd.slQunpdUpd)
	app.post('/slQunpdUpdAjax', MdRole.slerIsLogin, postForm, Qunpd.slQunpdUpdAjax)
	/* =================================== Inquot 询价 =================================== */
	app.get('/slQuns', MdRole.slerIsLogin, Qun.slQuns)
	app.get('/slQun/:id', MdRole.slerIsLogin, Qun.slQun)
	app.get('/slQunDel/:id', MdRole.slerIsLogin, Qun.slQunDel)

	app.post('/slQunNew', MdRole.slerIsLogin, postForm, Qun.slQunNew)
	app.post('/slQunUpdAjax', MdRole.slerIsLogin, postForm, Qun.slQunUpdAjax)

	app.get('/slInquotExcel/:id', MdRole.slerIsLogin, Qun.slInquotExcel)

	/* =================================== Din =================================== */
	app.get('/slDins', MdRole.slerIsLogin, Din.slDins)
	app.get('/slDin/:id', MdRole.slerIsLogin, Din.slDin)

	app.get('/slDinExcel/:id', MdRole.slerIsLogin, Din.slDinExcel)
};