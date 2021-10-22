const Err = require('../../aaIndex/err');

const MdPicture = require('../../../middle/middlePicture');
const Conf = require('../../../../conf');

const Inquot = require('../../../models/firm/ord/inquot');
const Compd = require('../../../models/firm/ord/compd');

const Brand = require('../../../models/firm/brand');
const Pdthd = require('../../../models/firm/pd/pdthd');

const Buy = require('../../../models/firm/stream/buy');
const User = require('../../../models/login/user');

const _ = require('underscore');

exports.sfQutpdUpdAjax = (req, res) => {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	if(obj.thdDesp) obj.thdDesp = obj.thdDesp.replace(/(\s*$)/g, "").replace( /^\s*/, '');
	Compd.findOne({
		firm: crUser.firm,
		_id: obj._id
	})
	.populate('inquot')
	.exec((err, compd) => {
		if(err) {
			console.log(err);
			info = "sfer QutpdUpdAjax, Compd.findOne, Error!"
			Err.jsonErr(req, res, info);
		} else if(!compd) {
			info = '此商品不存在, 请刷新查看';
			Err.jsonErr(req, res, info);
		} else if(!compd.inquot) {
			info = '此商品的报价单不存在, 请刷新查看';
			Err.jsonErr(req, res, info);
		} else {
			if(obj.strmup) {
				if(obj.strmup == "null") {
					obj.strmup = null;
					obj.dutPr = null;
					sferQutpdAjaxSave(req, res, compd, obj)
				} else if(!compd.inquot.percent || isNaN(parseFloat(compd.inquot.percent))) {
					info = "请先输入出售所加点数";
					Err.jsonErr(req, res, info);
				} else {
					Buy.findOne({strmup: obj.strmup, brand: obj.brand}, (err, buy) => {
						if(err) {
							console.log(err);
							info = "mger QutpdUpdAjax, Buy.findOne, Error!"
							Err.jsonErr(req, res, info);
						} else if(!buy) {
							info = "此供应商不销售此品牌"
							Err.jsonErr(req, res, info);
						} else {
							let orgPrice = parseFloat(req.body.orgPrice)
							let discount = parseFloat(buy.discount)
							let percent = parseFloat(compd.inquot.percent);
							if(isNaN(orgPrice)) {
								info = "产品原价设置错误, 请检查"
								Err.jsonErr(req, res, info);
							} else if(isNaN(discount)) {
								info = "此产品的品牌在供应商的折扣信息错误, 请检查"
								Err.jsonErr(req, res, info);
							} else if(isNaN(percent)) {
								info = "售出加点数不是数字, 请检查"
								Err.jsonErr(req, res, info);
							} else {
								obj.dutPr = orgPrice * (1 - discount/100);
								obj.qntPr = obj.dutPr * (1 + percent/100);
								sferQutpdAjaxSave(req, res, compd, obj)
							}
						}
					})
				}
			} else {
				info = null;
				if(obj.qntPr) {
					obj.qntPr = parseFloat(obj.qntPr);
					if(isNaN(obj.qntPr)) {
						info = "请输入正确的报价"
					}
				} else if(obj.dutPr) {
					obj.dutPr = parseFloat(obj.dutPr);
					if(isNaN(obj.dutPr)) {
						info = "请输入正确的采购价"
					}
				}
				if(info) {
					Err.jsonErr(req, res, info);
				} else {
					sferQutpdAjaxSave(req, res, compd, obj)
				}
			}
		}
	})
}
let sferQutpdAjaxSave = (req, res, compd, obj) => {
	_compd = _.extend(compd, obj)
	_compd.save((err, compdSave) => {
		if(err) {
			console.log(err);
			info = "mger QutpdUpdAjax, _compd.save, Error!"
			Err.jsonErr(req, res, info);
		} else {
			res.json({ status: 1, msg: '', data: {compd: compdSave} })
		}
	})
}

exports.sfQutpdUp = (req, res) => {
	let crUser = req.session.crUser;
	let id = req.params.id;

	Compd.findOne({_id: id})
	.populate('inquot')
	.populate('brand')
	.populate('pdfir')
	.populate('pdsec')
	.populate('pdthd')
	.populate('ordin')
	.exec((err, compd) => {
		if(err) {
			console.log(err);
			info = "sfer Qutpd, Compd.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!compd) {
			info = "这个报价单已经被删除";
			Err.usError(req, res, info);
		} else if(compd.ordin) {
			info = "您现在无权修改此商品信息, 因为已经生成订单";
			Err.usError(req, res, info);
		} else if(compd.inquot.status != Conf.status.quoting.num) {
			info = "您现在无权修改此商品信息, 因为询价单状态已经被修改";
			Err.usError(req, res, info);
		} else {
			// console.log(qut)
			let roleQuoter = Conf.roleAdmin;
			roleQuoter.push(Conf.roleUser.quotation.num);
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
					info = 'sfer QutAdd, User.find, Error!';
					Err.usError(req, res, info);
				} else {
					res.render('./user/sfer/inquot/qutpd/update', {
						title: '报价单修改',
						crUser,
						compd,

						quters
					})
				}
			})
		}
	})
}

exports.sfQutpdUpd = (req, res) => {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	obj.updAt = Date.now();
	Compd.findOne({
		firm: crUser.firm,
		_id: obj._id
	})
	.populate('inquot')
	.populate('ordin')
	.exec((err, compd) => {
		if(err) {
			console.log(err);
			info = "sfer QutpdUpd, Compd.findOne, Error!"
			Err.usError(req, res, info);
		} else if(!compd) {
			info = '此报价单已经被删除, 请刷新查看';
			Err.usError(req, res, info);
		} else if(compd.ordin) {
			info = "您现在无权修改此商品信息, 因为已经生成订单";
			Err.usError(req, res, info);
		} else if(compd.inquot.status != Conf.status.quoting.num) {
			info = "您现在无权修改此商品信息, 因为询价单状态已经被修改";
			Err.usError(req, res, info);
		} else {
			if(!obj.brand || obj.brand.length < 20) obj.brand = null;
			if(!obj.pdfir || obj.pdfir.length < 20) obj.pdfir = null;
			if(!obj.pdsec || obj.pdsec.length < 20) obj.pdsec = null;
			if(!obj.pdthd || obj.pdthd.length < 20) obj.pdthd = null;

			if(obj.images && compd.images) {
				for(let i=0; i<obj.images.length; i++) {
					if(compd.images.length>=i && !obj.images[i]) {
						obj.images[i] = compd.images[i];
					}
				}
			}
			if(obj.brand && obj.pdthd && obj.qntpdSts == Conf.status.done.num) {
				Brand.findOne({_id: obj.brand}, (err, brand) => {
					if(err) {
						console.log(err);
						info = "sfer QutpdUpd, Brand.findOne, Error! 请截图后, 联系管理员";
						Err.usError(req, res, info);
					} else if(!brand) {
						info = "sfer QutpdUpd, !brand, Error! 请截图后, 联系管理员";
						Err.usError(req, res, info);
					} else {
						Pdthd.findOne({_id: obj.pdthd}, (err, pdthd) => {
							if(err) {
								console.log(err);
								info = "sfer QutpdUpd, Brand.findOne, Error! 请截图后, 联系管理员";
								Err.usError(req, res, info);
							} else if(!brand) {
								info = "sfer QutpdUpd, !brand, Error! 请截图后, 联系管理员";
								Err.usError(req, res, info);
							} else {
								let discount = parseInt(brand.discount)
								let price = parseFloat(pdthd.price)
								let percent = parseInt(compd.inquot.percent)
								let estimate = price * (1 - discount/100) * (1 + percent/100);
								if(isNaN(estimate)) {
									obj.estimate = "";
								} else {
									obj.estimate = String(estimate.toFixed(2))
								}
								sferQutpdSave(req, res, compd, obj);
							}
						})
					}
				})
			} else {
				obj.estimate = '';
				sferQutpdSave(req, res, compd, obj);
			}
		}
	})
}
let sferQutpdSave = (req, res, compd, obj) => {
	let _compd = _.extend(compd, obj);
	_compd.save((err, objSave) => {
		if(err) {
			console.log(err)
			info = "sfer QutpdUpd, _compd.save, Error! 请截图后, 联系管理员";
			Err.usError(req, res, info);
		} else {
			res.redirect('/sfQut/'+objSave.inquot._id+'/#tr-compdid-'+objSave._id)
		}
	})

}

exports.sfQutpdDel = (req, res) => {
	let crUser = req.session.crUser;
	let id = req.params.id;

	Compd.findOne({_id: id})
	.populate('inquot')
	.populate('ordin')
	.exec((err, compd) => {
		if(err) {
			console.log(err);
			info = "sfer QutpdDel, Compd.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!compd) {
			info = "这个报价单已经被删除";
			Err.usError(req, res, info);
		} else if(compd.ordin) {
			info = "已经生成订单, 不可删除!";
			Err.usError(req, res, info);
		} else {
			let inquot = compd.inquot;
			inquot.compds.remove(id);
			inquot.save((err, inquotSave) => {
				if(err) {
					console.log(err);
					info = "user CompdDel, inquot.save, Error!";
					Err.usError(req, res, info);
				} else {
					let photoDel = compd.photo;
					let sketchDel = compd.sketch;
					let qutId = inquot._id;
					Compd.deleteOne({_id: id}, (err, objRm) => {
						if(err) {
							info = "user CompdDel, Compd.deleteOne, Error!";
							Err.usError(req, res, info);
						} else {
							MdPicture.deletePicture(photoDel, Conf.picPath.compd);
							MdPicture.deletePicture(sketchDel, Conf.picPath.compd);
							res.redirect("/sfQut/"+qutId);
						}
					})
				}
			})
		}
	})
}

exports.sfQutpdDelPic = (req, res) => {
	let crUser = req.session.crUser;
	let compdId = req.body.compdId;
	let picField = req.body.picField;
	let subsp = req.body.subsp;
	Compd.findOne({
		_id: compdId,
		firm: crUser.firm
	})
	.exec((err, compd) => {
		if(err) {
			console.log(err);
			info = "sfer QutpdDelPic, Compd.findOne, Error!"
			Err.usError(req, res, info);
		} else if(!compd) {
			info = '此询价单已经被删除, 请刷新查看';
			Err.usError(req, res, info);
		} else if(!picField) {
			info = '操作错误, 请截图 联系管理员 sfer QutpdDelPic';
			Err.usError(req, res, info);
		} else {
			let picDel = compd[picField];
			if(subsp) {
				picDel = compd[picField][subsp];
				// compd[picField][subsp] = '';
				compd.images.remove(picDel)
			} else {
				picDel = compd[picField];
				compd[picField] = '';
			}
			// return;
			compd.save((err, compdSave) => {
				if(err) {
					console.log(err);
					info = "sfer QutpdDelPic, Compd.save, Error!"
					Err.usError(req, res, info);
				} else {
					MdPicture.deletePicture(picDel, Conf.picPath.compd);
					res.redirect('/sfQut/'+compdSave.inquot)
				}
			})
		}
	})
}