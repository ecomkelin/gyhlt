const Err = require('../../aaIndex/err');

const MdPicture = require('../../../middle/middlePicture');
const Conf = require('../../../../conf');

const Inquot = require('../../../models/firm/ord/inquot');
const Compd = require('../../../models/firm/ord/compd');

const User = require('../../../models/login/user');

const _ = require('underscore');

const moment = require('moment');
const xl = require('excel4node');

// 报价单
exports.qtQuts = (req, res) => {
	let crUser = req.session.crUser;

	res.render('./user/qter/inquot/qut/list', {
		title: '报价单',
		crUser,
	})
}

exports.qtQut = (req, res) => {
	let crUser = req.session.crUser;
	let id = req.params.id;

	Inquot.findOne({_id: id})
	// .populate('firm')
	.populate('quner')
	.populate('quter')
	.populate({
		path: 'compds',
		options: { sort: {'qntpdSts': 1, 'qntnum': 1 } },
		populate: [
			{path: 'brand'},
			{path: 'pdfir'},
			{path: 'pdsec'},
			{path: 'pdthd'},

			{path: 'quner'},
			{path: 'quter'},
		]
	})
	.exec((err, inquot) => {
		if(err) {
			console.log(err);
			info = "qter Qut, Inquot.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!inquot) {
			info = "这个报价单已经被删除";
			Err.usError(req, res, info);
		} else {
			// console.log(inquot);
			// return;
			let compds = inquot.compds;
			let i=0;
			for(; i<compds.length; i++) {
				if(compds[i].qntpdSts == Conf.status.quoting.num) {
					break;
				}
			}
			if(i == compds.length) {
				qterQutRender(req, res, inquot, compds);
			} else {
				// 报价状态未完成
				inquot.quterSt = Conf.status.init.num;
				inquot.save((err, objSave) => {
					if(err) {
						console.log(err);
						info = "qter Qut, inquot.save, Error!"
						Err.usError(req, res, info);
					} else {
						qterQutRender(req, res, objSave, compds);
					}
				})
			}
			
		}
	})
}
let qterQutRender = (req, res, inquot, compds) => {
	let crUser = req.session.crUser;

	let brands = new Array();
	for(let i=0; i<compds.length; i++) {
		let compd = compds[i];
		let k=0;
		for(; k<brands.length; k++) {
			if(brands[k].brandNome == compd.brandNome) break;
		}
		if(k == brands.length) {
			let brand = new Object();
			brand.num = k+1;
			brand.brandNome = compd.brandNome;
			brands.push(brand)
		}
	}
	res.render('./user/qter/inquot/qut/detail', {
		title: '报价单详情',
		crUser,
		inquot,
		compds,
		brands
	})
}
exports.qtQutDel = (req, res) => {
	let crUser = req.session.crUser;
	let id = req.params.id;

	Inquot.findOne({_id: id})
	.exec((err, inquot) => {
		if(err) {
			console.log(err);
			info = "qter QutDel, Inquot.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!inquot) {
			info = "这个报价单已经被删除";
			Err.usError(req, res, info);
		} else {
			if(inquot.compds.length > 0) {
				info = "安全起见, 请先删除此单中的报价货物!";
				Err.usError(req, res, info);
			} else {
				Inquot.deleteOne({_id: id}, (err, objRm) => {
					if(err) {
						info = "user InquotDel, Inquot.deleteOne, Error!";
						Err.usError(req, res, info);
					} else {
						res.redirect("/qtQuts");
					}
				})
			}
		}
	})
}







exports.qtQutUpdAjax = (req, res) => {
	let crUser = req.session.crUser;
	let obj = req.body.obj;

	Inquot.findOne({
		firm: crUser.firm,
		_id: obj._id
	}, (err, inquot) => {
		if(err) {
			console.log(err);
			info = "qter QunUpd, Inquot.findOne, Error!"
			Err.jsonErr(req, res, info);
		} else if(!inquot) {
			info = '此询价单已经被删除, 请刷新查看';
			Err.jsonErr(req, res, info);
		} else {
			if(obj.cterNome) obj.cterNome = obj.cterNome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
			let _inquot = _.extend(inquot, obj)
			_inquot.save((err, objSave) => {
				if(err) {
					console.log(err);
					info = "添加询价单时 数据库保存错误, 请截图后, 联系管理员";
					Err.jsonErr(req, res, info);
				} else {
					res.json({
						status: 1,
						msg: '',
						data: {}
					});
				}
			})
		}
	})
}


exports.qtQutExcel = (req, res) => {
	let crUser = req.session.crUser;
	let id = req.params.id;

	Inquot.findOne({_id: id})
	.populate('firm')
	.populate('quner')
	.populate('quter')
	.exec((err, inquot) => {
		if(err) {
			console.log(err);
			info = "qter Qut, Inquot.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!inquot) {
			info = "这个报价单已经被删除";
			Err.usError(req, res, info);
		} else {
			// console.log(inquot)
			Compd.find({inquot: id})
			.populate('brand').populate('pdfir').populate('pdsec').populate('pdthd')
			.sort({'status': 1, 'crtAt': -1})
			.exec((err, compds) => {
				if(err) {
					info = "cter CompdsAjax, Compd.find(), Error!";
					Err.jsonErr(req, res, info);
				} else {
					let wb = new xl.Workbook({
						defaultFont: {
							size: 12,
							color: '333333'
						},
						dateFormat: 'yyyy-mm-dd hh:mm:ss'
					});

					let ws = wb.addWorksheet('Sheet 1');
					ws.column(1).setWidth(5);
					ws.column(2).setWidth(15);
					ws.column(3).setWidth(20);
					ws.column(4).setWidth(20);
					ws.column(5).setWidth(20);
					ws.column(6).setWidth(15);
					ws.column(7).setWidth(10);
					ws.column(8).setWidth(20);

					// header
					ws.cell(1,1).string('NB.');
					ws.cell(1,2).string('Brand');
					ws.cell(1,3).string('Product');
					ws.cell(1,4).string('Code');
					ws.cell(1,5).string('Specif');
					ws.cell(1,6).string('Price Unit');
					ws.cell(1,7).string('Qunant');
					ws.cell(1,8).string('Total');

					for(let i=0; i<compds.length; i++){
						ws.cell((i+2), 1).string(String(i+1));
						let compd = compds[i];
						if(compd.brand) {
							ws.cell((i+2), 2).string(String(compd.brand.nome));
						} else if(compd.brandNome) {
							ws.cell((i+2), 2).string(String(compd.brandNome));
						}
						if(compd.pdfir) {
							// ws.addImage({
							// 	path: compd.pdfir.photo,
							// 	type: 'picture',
							// 	position: {
							// 		type: 'oneCellAnchor',
							// 		from: {
							// 			col: i+2,
							// 			colOff: '0.5in',
							// 			row: 3,
							// 			rowOff: 0,
							// 		},
							// 	},
							// });
							ws.cell((i+2), 3).string(String(compd.pdfir.code));
						} else if(compd.firNome) {
							ws.cell((i+2), 3).string(String(compd.firNome));
						}
						if(compd.pdsec) {
							ws.cell((i+2), 4).string(String(compd.pdsec.code));
						} else if(compd.firNome) {
							ws.cell((i+2), 4).string(String(compd.firNome));
						}
						if(compd.pdthd) {
							let maters = '';
							for(let j=0; j<compd.pdthd.maters.length; j++){
								maters += compd.pdthd.maters[j] + ' ';
							}
							ws.cell((i+2), 5).string(maters);
						} else if(compd.thdNome) {
							ws.cell((i+2), 5).string(String(compd.thdNome));
						}

						if(compd.price && compd.quant) {
							let price = parseFloat(compd.price);
							let quant = parseInt(compd.quant);
							ws.cell((i+2), 6).string(String(price + ' €'));
							ws.cell((i+2), 7).string(String(quant));
							if(!isNaN(price) && !isNaN(quant)) {
								let tot = price * quant;
								ws.cell((i+2), 8).string(String(tot + ' €'));
							}
						}
					}

					wb.write('Quote_'+ moment(new Date()).format('YYYYMMDD-HHmmss') + '.xlsx', res);
				}
			})
		}
	})
}