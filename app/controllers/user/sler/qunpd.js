const Err = require('../../aaIndex/err');

const MdPicture = require('../../../middle/middlePicture');
const Conf = require('../../../../conf');

const Inquot = require('../../../models/firm/ord/inquot');
const Compd = require('../../../models/firm/ord/compd');

const Strmup = require('../../../models/firm/stream/strmup');
const Strmdw = require('../../../models/firm/stream/strmdw');
const User = require('../../../models/login/user');

const _ = require('underscore');

exports.slQunpdUp = (req, res) => {
	let crUser = req.session.crUser;
	let id = req.params.id;

	Compd.findOne({_id: id})
	.populate('inquot')
	.populate('ordin')
	.populate('brand')
	.populate('pdfir')
	.populate('pdsec')
	.populate('pdthd')
	.exec((err, compd) => {
		if(err) {
			console.log(err);
			info = "sler Qunpd, Compd.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!compd) {
			info = "这个询价单已经被删除";
			Err.usError(req, res, info);
		} else if(compd.ordin) {
			info = "您现在无权修改此商品信息, 因为已经生成订单";
			Err.usError(req, res, info);
		} else if(compd.inquot.status != Conf.status.init.num && compd.inquot.status != Conf.status.quoting.num) {
			info = "您现在无权修改此商品信息, 因为询价单状态已经被修改";
			Err.usError(req, res, info);
		} else {
			res.render('./user/sler/inquot/qunpd/update', {
				title: '询价单修改',
				crUser,
				compd,
			})
		}
	})
}

exports.slQunpdDel = (req, res) => {
	let crUser = req.session.crUser;
	let id = req.params.id;

	Compd.findOne({_id: id})
	.populate('inquot')
	.populate('ordin')
	.exec((err, compd) => {
		if(err) {
			console.log(err);
			info = "sler QunpdDel, Compd.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!compd) {
			info = "这个询价单已经被删除";
			Err.usError(req, res, info);
		} else if(compd.ordin) {
			info = "您现在无权修改此商品信息, 因为已经生成订单";
			Err.usError(req, res, info);
		} else if(compd.inquot.status != Conf.status.init.num && compd.inquot.status != Conf.status.quoting.num) {
			info = "您现在无权修改此商品信息, 因为询价单状态已经被修改";
			Err.usError(req, res, info);
		} else if(compd.inquot.status == Conf.status.quoting.num && compd.qntpdSts != Conf.status.del.num) {
			info = "请先让报价员把询价商品改变为删除状态";
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
					let picDels = compd.images;
					picDels.push(compd.photo)
					picDels.push(compd.sketch)
					let qunId = inquot._id;
					Compd.deleteOne({_id: id}, (err, objRm) => {
						if(err) {
							info = "user CompdDel, Compd.deleteOne, Error!";
							Err.usError(req, res, info);
						} else {
							for(let i = 0; i<picDels.length; i++) {
								let picDel = picDels[i];
								if(picDel) {
									MdPicture.deletePicture(picDel, Conf.picPath.compd);
								}
							}
							res.redirect("/slQun/"+qunId);
						}
					})
				}
			})
		}
	})
}





exports.slQunpdUpd = (req, res) => {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	obj.updAt = Date.now();
	obj.qntpdSts = Conf.status.quoting.num;
	Compd.findOne({
		firm: crUser.firm,
		_id: obj._id
	})
	.populate('inquot')
	.populate('ordin')
	.exec((err, compd) => {
		if(err) {
			console.log(err);
			info = "sler QunpdUpd, Strmup.findOne, Error!"
			Err.usError(req, res, info);
		} else if(!compd) {
			info = '此询价单已经被删除, 请刷新查看';
			Err.usError(req, res, info);
		} else if(compd.ordin) {
			info = "您现在无权修改此商品信息, 因为已经生成订单";
			Err.usError(req, res, info);
		} else if(compd.inquot.status != Conf.status.init.num && compd.inquot.status != Conf.status.quoting.num) {
			info = "您现在无权修改此商品信息, 因为询价单状态已经被修改";
			Err.usError(req, res, info);
		} else {
			if(!obj.brand || obj.brand.length < 20) obj.brand = null;
			if(!obj.pdfir || obj.pdfir.length < 20) obj.pdfir = null;
			if(!obj.pdsec || obj.pdsec.length < 20) obj.pdsec = null;
			if(!obj.pdthd || obj.pdthd.length < 20) obj.pdthd = null;
			// if(obj.pdthd) obj.qntpdSts = Conf.status.done.num;
			if(obj.images && compd.images) {
				for(let i=0; i<obj.images.length; i++) {
					if(compd.images.length>=i && !obj.images[i]) {
						obj.images[i] = compd.images[i];
					}
				}
			}
			let _compd = _.extend(compd, obj);
			_compd.save((err, objSave) => {
				if(err) {
					console.log(err)
					info = "添加询价单时 sler QunpdUpd, 请截图后, 联系管理员";
					Err.usError(req, res, info);
				} else {
					res.redirect('/slQun/'+objSave.inquot._id+'/#tr-compdid-'+objSave._id)
				}
			})
		}
	})
}


exports.slQunpdUpdAjax = (req, res) => {
	let crUser = req.session.crUser;
	let obj = req.body.obj;

	info = null;
	if(obj.qntnum) {
		obj.qntnum = parseInt(obj.qntnum);
		if(isNaN(obj.qntnum)) {
			info = '序号只能是整数';
		}
	} else if(obj.quant) {
		obj.quant = parseInt(obj.quant);
		if(isNaN(obj.quant)) {
			info = '数量只能是整数';
		}
	} else if(obj.dinPr) {
		obj.dinPr = parseFloat(obj.dinPr);
		if(isNaN(obj.dinPr)) {
			info = '售价只能是数字';
		} else if(obj.dinPr < 0) {
			info = '售价不能是负数';
		}
	} else if(obj.thdDesp || obj.thdDesp == "") {

	} else {
		info = "您传入的参数有错误";
	}

	if(info) {
		Err.jsonErr(req, res, info);
	} else {
		Compd.findOne({
			firm: crUser.firm,
			_id: obj._id
		})
		.populate('inquot')
		.populate('ordin')
		.exec((err, compd) => {
			if(err) {
				console.log(err);
				info = "sler QunpdUpd, Compd.findOne, Error!"
				Err.jsonErr(req, res, info);
			} else if(!compd) {
				info = '此询价单已经被删除, 请刷新查看';
				Err.jsonErr(req, res, info);
			} else if(compd.ordin) {
				info = "您现在无权修改此商品信息, 因为已经生成订单";
				Err.jsonErr(req, res, info);
			} else if(compd.inquot.status > Conf.status.confirm.num) {
				info = "您现在无权修改此商品信息, 因为状态已经改变";
				Err.jsonErr(req, res, info);
			} else if(compd.inquot.status == Conf.status.ord.num) {
				info = "您现在无权修改此商品信息, 因为询价单已经生成订单";
				Err.jsonErr(req, res, info);
			} else {
				let inquot = compd.inquot;
				if(obj.qntnum) {
					compd.qntnum = obj.qntnum;
				} else if(obj.quant) {
					compd.quant = obj.quant;
				} else if(obj.dinPr) {
					compd.dinPr = obj.dinPr;
				} else if(obj.thdDesp || obj.thdDesp == "") {
					compd.thdDesp = obj.thdDesp.replace(/(\s*$)/g, "").replace( /^\s*/, '');
				}

				compd.save((err, compdSave) => {
					if(err) {
						console.log(err);
						info = "sler QunpdUpd, compd.save, Error!"
						Err.jsonErr(req, res, info);
					} else {
						res.json({
							status: 1,
							msg: '',
							data: {
								qntPrTot: compdSave.quant * compdSave.qntPr,
								dinPrTot: compdSave.quant * compdSave.dinPr
							}
						});
					}
				})
			}
		})
	}
}


exports.slQunpdNew = (req, res) => {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	obj.qntpdSts = Conf.status.quoting.num;
	obj.quant = parseInt(obj.quant);
	if(isNaN(obj.quant)) obj.quant = 1;
	Inquot.findOne({
		firm: crUser.firm,
		_id: obj.inquot
	})
	.populate({
		path: 'compds',
		options: { sort: {'qntnum': -1} },
	})
	.exec((err, inquot) => {
		if(err) {
			console.log(err);
			info = "sler QunpdNew, Strmup.findOne, Error!"
			Err.usError(req, res, info);
		} else if(!inquot) {
			info = "询价单不存在, 请刷新查看!"
			Err.usError(req, res, info);
		} else if(inquot.status != Conf.status.init.num && inquot.status != Conf.status.quoting.num) {
			info = "状态已经改变, 不可操作!"
			Err.usError(req, res, info);
		} else {
			let compds = inquot.compds;
			// 系统自动给询价商品添加询价编号
			obj.qntnum = 1;
			if(compds && compds.length > 0 && !isNaN(parseInt(compds[0].qntnum))) {
				obj.qntnum = compds[0].qntnum + 1
			}
			// 询价商品自动添加信息
			obj.firm = inquot.firm
			obj.quner = inquot.quner
			obj.quter = inquot.quter

			if(!obj.brand || obj.brand.length < 20) obj.brand = null;
			if(!obj.pdfir || obj.pdfir.length < 20) obj.pdfir = null;
			if(!obj.pdsec || obj.pdsec.length < 20) obj.pdsec = null;
			if(!obj.pdthd || obj.pdthd.length < 20) obj.pdthd = null;
			let _compd = new Compd(obj)

			i=0
			for(; i<compds.length; i++) {
				if(compds[i]._id == _compd._id) break;
			}
			if(i==compds.length) {
				compds.unshift(_compd)
			}
			inquot.save((err, inquotSave) => {
				if(err) {
					console.log(err);
					info = "添加询价单商品时 数据库保存错误 inquot.save, 请截图后, 联系管理员!";
					Err.usError(req, res, info);
				} else {
					_compd.save((err, objSave) => {
						if(err) {
							console.log(err);
							info = "添加询价单商品时 数据库保存错误 _compd.save, 请截图后, 联系管理员!";
							Err.usError(req, res, info);
						} else {
							res.redirect('/slQun/'+obj.inquot+'/#tr-compdid-'+objSave._id)
						}
					})
				}
			})
		}
	})
}