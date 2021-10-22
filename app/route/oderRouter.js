const Index = require('../controllers/aaIndex/index');

const Qutpd = require('../controllers/user/oder/qutpd');
const Qut = require('../controllers/user/oder/qut');

const Din = require('../controllers/user/oder/din');
const Dinpd = require('../controllers/user/oder/dinpd');

const Dut = require('../controllers/user/oder/dut');
const Dutpd = require('../controllers/user/oder/dutpd');

const MdBcrypt = require('../middle/middleBcrypt');
const MdRole = require('../middle/middleRole');
const MdPicture = require('../middle/middlePicture');
const MdFile = require('../middle/middleFile');
const MdExcel = require('../middle/middleExcel');

const multipart = require('connect-multiparty');
const postForm = multipart();

module.exports = function(app){

	app.get('/oder', MdRole.oderIsLogin, (req, res) => {
		let crUser = req.session.crUser;
		res.render('./user/oder/index/index', {
			title: '公司管理',
			crUser : crUser,
		})
	});
	/* =================================== qutpd 报价商品 =================================== */
	app.get('/odQutpdDel/:id', MdRole.oderIsLogin, Qutpd.odQutpdDel)

	app.post('/odQutpdUpdAjax', MdRole.oderIsLogin, postForm, Qutpd.odQutpdUpdAjax)
	/* =================================== Inquot 报价 =================================== */
	app.get('/odQuts', MdRole.oderIsLogin, Qut.odQuts)
	app.get('/odQut/:id', MdRole.oderIsLogin, Qut.odQut)
	app.get('/odQutDel/:id', MdRole.oderIsLogin, Qut.odQutDel)

	app.post('/odQutUpd', MdRole.oderIsLogin, postForm, Qut.odQutUpd)

	/* =================================== Din =================================== */
	app.get('/odDinGen/:inquotId', MdRole.oderIsLogin, Din.odDinGen)
	app.get('/odDins', MdRole.oderIsLogin, Din.odDins)
	app.get('/odDin/:id', MdRole.oderIsLogin, Din.odDin)
	app.get('/odDinDel/:id', MdRole.oderIsLogin, Din.odDinDel)

	app.post('/odDinUpd', MdRole.oderIsLogin, postForm, Din.odDinUpd)
	app.post('/odDinUpdAjax', MdRole.oderIsLogin, postForm, Din.odDinUpdAjax)

	/* =================================== Dinpd 销售商品 =================================== */
	app.post('/odDinpdUpdAjax', MdRole.oderIsLogin, postForm, Dinpd.odDinpdUpdAjax)

	/* =================================== Dut =================================== */
	app.get('/odDuts', MdRole.oderIsLogin, Dut.odDuts)
	app.post('/odDutNew', MdRole.oderIsLogin, postForm, Dut.odDutNew)
	app.get('/odDut/:id', MdRole.oderIsLogin, Dut.odDut)
	app.get('/odDutDel/:id', MdRole.oderIsLogin, Dut.odDutDel)

	app.post('/odDutUpd', MdRole.oderIsLogin, postForm, Dut.odDutUpd)

	app.post('/odDutPlusPd', MdRole.oderIsLogin, postForm, Dut.odDutPlusPd)

	app.get('/odDutExcel/:id', MdRole.slerIsLogin, Dut.odDutExcel)
	/* =================================== Dutpd 采购商品 =================================== */
	app.post('/odDutpdUpdAjax', MdRole.oderIsLogin, postForm, Dutpd.odDutpdUpdAjax)
	app.get('/odDutpdCel/:id', MdRole.oderIsLogin, Dutpd.odDutpdCel)
};