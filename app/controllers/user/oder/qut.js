const Err = require('../../aaIndex/err');

const MdPicture = require('../../../middle/middlePicture');
const Conf = require('../../../../conf');

const Inquot = require('../../../models/firm/ord/inquot');
const Compd = require('../../../models/firm/ord/compd');

const Strmup = require('../../../models/firm/stream/strmup');
const User = require('../../../models/login/user');

const _ = require('underscore');

const moment = require('moment');
const xl = require('excel4node');

// 报价单
exports.odQuts = (req, res) => {
	let crUser = req.session.crUser;

	res.render('./user/oder/inquot/qut/list', {
		title: '报价单',
		crUser,
	})
}

exports.odQut = (req, res) => {
	let crUser = req.session.crUser;
	let id = req.params.id;

	Inquot.findOne({_id: id})
	// .populate('firm')
	.populate('cter')
	.populate('quner')
	.populate('quter')
	.populate('strmup')
	.populate({
		path: 'compds',
		options: { sort: {'qntpdSts': 1, 'qntnum': 1}},
		populate: [
			{path: 'brand', populate: {path: 'buys', populate: {path: 'strmup'}}},
			{path: 'pdfir'},
			{path: 'pdsec'},
			{path: 'pdthd'},

			{path: 'strmup'},
			{path: 'quner'},
			{path: 'quter'},
		]
	})
	.exec((err, inquot) => {
		if(err) {
			console.log(err);
			info = "oder Qut, Inquot.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!inquot) {
			info = "这个报价单已经被删除";
			Err.usError(req, res, info);
		} else {
			// console.log(inquot)
			let compds = inquot.compds;
			User.find({
				firm: crUser.firm,
				$or:[
					{'role': {"$in": Conf.roleAdmin}},
					{'role': {"$eq": Conf.roleUser.quotation.num}},
				]
			})
			.sort({'role': -1})
			.exec((err, quters) => {
				if(err) {
					console.log(err);
					info = 'oder QutAdd, User.find, Error!';
					Err.usError(req, res, info);
				} else {
					User.find({
						firm: crUser.firm,
						role: Conf.roleUser.customer.num
					})
					.exec((err, cters) => {
						if(err) {
							console.log(err);
							info = 'oder QutAdd, Strmup.find, Error!';
							Err.usError(req, res, info);
						} else {
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
							res.render('./user/oder/inquot/qut/detail', {
								title: '报价单详情',
								crUser,

								inquot,
								compds,
								quters,
								cters,
								brands
							})
						}
					})
				}
			})
		}
	})
}

exports.odQutDel = (req, res) => {
	let crUser = req.session.crUser;
	let id = req.params.id;

	Inquot.findOne({_id: id})
	.exec((err, inquot) => {
		if(err) {
			console.log(err);
			info = "oder QutDel, Inquot.findOne, Error!";
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
						res.redirect("/odQuts");
					}
				})
			}
		}
	})
}



exports.odQutUpd = (req, res) => {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	Inquot.findOne({
		firm: crUser.firm,
		_id: obj._id
	}, (err, inquot) => {
		if(err) {
			console.log(err);
			info = "oder QutUpd, Inquot.findOne, Error!"
			Err.usError(req, res, info);
		} else if(!inquot) {
			info = '此报价单已经被删除, 请刷新查看';
			Err.usError(req, res, info);
		} else {
			oderQuterSel(req, res, obj, inquot);
		}
	})
}
let oderQuterSel = (req, res, obj, inquot) => {
	if(String(inquot.quter) == String(obj.quter)) {
		// 如果是更新， 则判断如果 quter 没有变化, 则跳过此步骤
		odercterSel(req, res, obj, inquot);
	} else if(!obj.quter) {
		obj.quter = inquot.quter;
		odercterSel(req, res, obj, inquot);
	} else {
		if(obj.quter == "null") obj.quter = null;
		Compd.updateMany({
			_id: inquot.compds,
			quter: inquot.quter
		}, {
			quter: obj.quter
		},(err, compds) => {
			if(err) {
				console.log(err);
				info = "oder QuterSel, Compd.find(), Error!";
				Err.usError(req, res, info);
			} else {
				odercterSel(req, res, obj, inquot);
			}
		})
	}
}
let odercterSel = (req, res, obj, inquot) => {
	if(String(inquot.cter) == String(obj.cter)) {
		// 如果是更新， 则判断如果 cter 没有变化, 则跳过此步骤
		oderqutSave(req, res, obj, inquot);
	} else if(!obj.cter) {
		obj.cter = inquot.cter;
		oderqutSave(req, res, obj, inquot);
	} else {
		if(obj.cter == "null") obj.cter = null;
		Compd.updateMany({
			_id: inquot.compds,
			cter: inquot.cter
		}, {
			cter: obj.cter
		},(err, compds) => {
			if(err) {
				console.log(err);
				info = "oder cterSel, Compd.find(), Error!";
				Err.usError(req, res, info);
			} else {
				oderqutSave(req, res, obj, inquot);
			}
		})
	}
}
let oderqutSave = (req, res, obj, inquot) => {
	let _inquot = Object();
	if(inquot) {
		_inquot = _.extend(inquot, obj)
	} else {
		_inquot = new Inquot(obj)
	}
	_inquot.save((err, objSave) => {
		if(err) {
			console.log(err);
			info = "添加报价单时 数据库保存错误, 请截图后, 联系管理员";
			Err.usError(req, res, info);
		} else {
			res.redirect('/odQut/'+objSave._id)
		}
	})
}