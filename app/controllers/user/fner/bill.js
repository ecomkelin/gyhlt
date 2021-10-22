// 财务账单
const Err = require('../../aaIndex/err');
const Conf = require('../../../../conf');

const Bill = require('../../../models/firm/bill');

const Ordin = require('../../../models/firm/ord/ordin');
const Ordut = require('../../../models/firm/ord/ordut');

// 财务账单
exports.fnBills = (req, res) => {
	let crUser = req.session.crUser;
	res.render('./user/fner/bill/list', {
		title: '财务账单',
		crUser,
	})
}

exports.fnBillNew = (req, res) => {
	let crUser = req.session.crUser;
	let obj = req.body.obj;
	obj.firm = crUser.firm;
	obj.fner = crUser._id;

	info = null;
	if(!obj.billPr) {
		info = "请填写收款金额"
	} else if(isNaN(obj.billPr)) {
		info = "金额只能是数字";
	}
	if(info && info.length > 0) {
		Err.usError(req, res, info);
	} else {
		if(obj.ordin && obj.genre == 1) {
			Ordin.findOne({
				_id: obj.ordin,
				firm: obj.firm
			})
			.exec((err, ordin) => {
				if(err) {
					info = "fner BillNew, Ordin.findOne, Error!";
					Err.usError(req, res, info);
				} else if(!ordin) {
					info = "fner BillNew, 采购单已不存在, 请联系管理员";
					Err.usError(req, res, info);
				} else {
					obj.cter = ordin.cter;

					ordin.billPr += parseFloat(obj.billPr);
					let billAt;
					billAt = obj.crtAt = Date.now();

					let _bill = new Bill(obj)
					_bill.save((err, objSave) => {
						if(err) {
							console.log(err);
							info = "fner BillNew, _bill.save, Error!";
							Err.usError(req, res, info);
						} else {
							if(ordin.bills.length == 0) {
								ordin.billAt = billAt;
							}
							ordin.bills.unshift(objSave._id);
							ordin.save((err, ordinSave) => {
								if(err) {
									console.log(err);
									info = "fner BillNew, ordin.save, Error!";
									Err.usError(req, res, info);
								} else {
									res.redirect('/fnDin/'+ordin._id)
								}
							})
						}
					})
				}
			})
		} else if(obj.ordut && obj.genre == -1) {
			Ordut.findOne({
				_id: obj.ordut,
				firm: obj.firm
			})
			.exec((err, ordut) => {
				if(err) {
					info = "fner BillNew, Ordut.findOne, Error!";
					Err.usError(req, res, info);
				} else if(!ordut) {
					info = "fner BillNew, 采购单已不存在, 请联系管理员";
					Err.usError(req, res, info);
				} else {
					obj.cter = ordut.cter;

					ordut.billPr += parseFloat(obj.billPr);
					let billAt;
					billAt = obj.crtAt = Date.now();

					let _bill = new Bill(obj)
					_bill.save((err, objSave) => {
						if(err) {
							console.log(err);
							info = "fner BillNew, _bill.save, Error!";
							Err.usError(req, res, info);
						} else {
							if(ordut.bills.length == 0) {
								ordut.billAt = billAt;
							}
							ordut.bills.unshift(objSave._id);
							ordut.save((err, ordutSave) => {
								if(err) {
									console.log(err);
									info = "fner BillNew, ordut.save, Error!";
									Err.usError(req, res, info);
								} else {
									res.redirect('/fnDut/'+ordut._id)
								}
							})
						}
					})
				}
			})
		} else {
			info = "fner BillNew 您的操作错误, 请联系管理员";
			Err.usError(req, res, info);
		}
	}
}

exports.fnBillDel = (req, res) => {
	let crUser = req.session.crUser;
	let id = req.params.id;

	Bill.findOne({_id: id, firm: crUser.firm})
	.populate('ordin')
	.populate('ordut')
	.exec((err, bill) => {
		if(err) {
			console.log(err);
			info = "fner BillDel, Bill.findOne, Error!";
			Err.usError(req, res, info);
		} else if(!bill) {
			info = "fner BillDel, 此账单不存在!";
			Err.usError(req, res, info);
		} else {
			if(bill.ordin) {
				let ordin = bill.ordin;
				ordin.bills.remove(bill._id);
				ordin.billPr -= parseFloat(bill.billPr)
				if(ordin.bills.length == 0) {
					ordin.billPr = 0;
					ordin.billAt = null;
				}
				Bill.deleteOne({_id: id}, (err, billDel) => {
					if(err) {
						info = "fner BillDel, Bill.deleteOne, Error!";
						Err.usError(req, res, info);
					} else {
						ordin.save((err, ordinSave) => {
							if(err) {
								info = "fner BillDel, ordin.save, Error!";
								Err.usError(req, res, info);
							} else {
								res.redirect("/fnDin/"+ordinSave._id)
							}
						})
					}
				})
			} else if(bill.ordut) {
				let ordut = bill.ordut;
				ordut.bills.remove(bill._id);
				ordut.billPr -= parseFloat(bill.billPr)
				if(ordut.bills.length == 0) {
					ordut.billPr = 0;
					ordut.billAt = null;
				}
				Bill.deleteOne({_id: id}, (err, billDel) => {
					if(err) {
						info = "fner BillDel, Bill.deleteOne, Error!";
						Err.usError(req, res, info);
					} else {
						ordut.save((err, ordutSave) => {
							if(err) {
								info = "fner BillDel, ordut.save, Error!";
								Err.usError(req, res, info);
							} else {
								res.redirect("/fnDut/"+ordutSave._id)
							}
						})
					}
				})
			} else {
				info = "fner BillDel, 没有找到采购单, 也没有找到订单";
				Err.usError(req, res, info);
			}
		}
	})
}