const Err = require('../../aaIndex/err');
const Conf = require('../../../../conf');

const Ordin = require('../../../models/firm/ord/ordin');
const Ordut = require('../../../models/firm/ord/ordut');
const Tran = require('../../../models/firm/ord/tran');
const Compd = require('../../../models/firm/ord/compd');

const Bill = require('../../../models/firm/bill');

exports.usDinsAjax = (req, res) => {
	let crUser = req.session.crUser;

	let page = 1;
	if(req.query.page && !isNaN(parseInt(req.query.page))) {
		page = parseInt(req.query.page);
	}
	let pagesize = 24;
	if(req.query.pagesize && !isNaN(parseInt(req.query.pagesize))) {
		pagesize = parseInt(req.query.pagesize);
	}
	let skip = (page-1)*pagesize;

	let sellerSymb = '$ne';
	let sellerConb = '5f1dff1063781676b6a5f6ff';
	if(req.query.seller) {
		sellerSymb = '$eq';
		sellerConb = req.query.seller;
	}
	if(crUser._id == "5eea52dce61fa97e3ff44fdc") {
		sellerSymb = '$eq';
		sellerConb = "5f85925f94ac0c50a98606a2";
	}
	if(crUser.role == Conf.roleUser.seller.num) {
		sellerSymb = '$eq';
		sellerConb = crUser._id;
	}
	/* 销售公司筛选, 如果是查询订单, 则销售公司一定是本公司*/
	// dinSymb = '$eq';
	// dinCond = crUser.firm._id;

	/* 采购公司筛选, 如果是查询采购单, 则采购公司一定是本公司*/
	let dutSymb = '$ne';
	let dutCond = '5ee8cf3dfd644e4fc8b8536d';
	if(req.query.dutId) {
		dutSymb = '$eq';
		dutCond = req.query.dutId;
	}

	let keySymb = '$ne';
	let keyCond = 'rander[a`a。=]';
	if(req.query.keyword) {
		keySymb = '$in';
		keyCond = String(req.query.keyword);
		keyCond = keyCond.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keyCond = new RegExp(keyCond + '.*');
	}

	let statusSymb = '$ne';
	let statusConb = -1;
	if(req.query.status && !isNaN(parseInt(req.query.status))) {
		statusSymb = '$eq';
		statusConb = parseInt(req.query.status)
	}
	// console.log(statusConb)

	let param = {
		firm: crUser.firm,
		seller: {[sellerSymb]: sellerConb},
		status: {[statusSymb]: statusConb},

		$or:[
			{'code': {[keySymb]: keyCond}},
		]
	}

	Ordin.countDocuments(param, (err, count) => {
		if(err) {
			console.log(err);
			info = "bser OrdinsAjax, Ordin.countDocuments(), Error!";
			Err.jsonErr(req, res, info);
		} else {
			Ordin.find(param)
			.populate('seller')
			.populate('cter')
			.populate('strmup')
			.skip(skip).limit(pagesize)
			.sort({'status' : 1, 'crtAt': -1})
			.exec((err, ordins) => {
				if(err) {
					info = "cter OrdinsAjax, Ordin.find(), Error!";
					Err.jsonErr(req, res, info);
				} else {
					// console.log(ordins)
					// console.log(page)
					// console.log(count)
					let isMore = 1;
					if(page*pagesize >= count) isMore = 0;
					res.json({
						status: 1,
						msg: '',
						data: {
							ordins,
							count,
							page,
							isMore,
							statusConb,
						}
					});
				}
			})
		}
	})
}




exports.usDutsAjax = (req, res) => {
	let crUser = req.session.crUser;

	let page = 1;
	if(req.query.page && !isNaN(parseInt(req.query.page))) {
		page = parseInt(req.query.page);
	}
	let pagesize = 24;
	if(req.query.pagesize && !isNaN(parseInt(req.query.pagesize))) {
		pagesize = parseInt(req.query.pagesize);
	}
	let skip = (page-1)*pagesize;

	/* 销售公司筛选, 如果是查询订单, 则销售公司一定是本公司*/
	// dutSymb = '$eq';
	// dutCond = crUser.firm._id;

	/* 采购公司筛选, 如果是查询采购单, 则采购公司一定是本公司*/
	let dutSymb = '$ne';
	let dutCond = '5ee8cf3dfd644e4fc8b8536d';
	if(req.query.dutId) {
		dutSymb = '$eq';
		dutCond = req.query.dutId;
	}

	let orderSymb = '$ne';
	let orderConb = '5f1dff1063781676b6a5f6ff';
	if(req.query.order) {
		orderSymb = '$eq';
		orderConb = req.query.order;
	}
	if(crUser.role == Conf.roleUser.staff.num) {
		orderSymb = '$eq';
		orderConb = crUser._id;
	}

	let keySymb = '$ne';
	let keyCond = 'rander[a`a。=]';
	if(req.query.keyword) {
		keySymb = '$in';
		keyCond = String(req.query.keyword);
		keyCond = keyCond.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keyCond = new RegExp(keyCond + '.*');
	}

	let statusSymb = '$ne';
	let statusConb = -1;
	if(req.query.status && !isNaN(parseInt(req.query.status))) {
		statusSymb = '$eq';
		statusConb = parseInt(req.query.status)
	}
	// console.log(statusConb)

	let param = {
		firm: crUser.firm,
		_id: {[dutSymb]: dutCond},
		status: {[statusSymb]: statusConb},
		order: {[orderSymb]: orderConb},

		$or:[
			{'code': {[keySymb]: keyCond}},
		]
	}
	Ordut.countDocuments(param, (err, count) => {
		if(err) {
			console.log(err);
			info = "bser OrdutsAjax, Ordut.countDocuments(), Error!";
			Err.jsonErr(req, res, info);
		} else {
			Ordut.find(param)
			.populate('firm')
			.populate('order')
			.populate('strmup')
			.skip(skip).limit(pagesize)
			.sort({'status': 1, 'weight': -1, 'updAt': -1})
			.exec((err, orduts) => {
				if(err) {
					info = "cter OrdutsAjax, Ordut.find(), Error!";
					Err.jsonErr(req, res, info);
				} else {
					// console.log(orduts)
					// console.log(page)
					// console.log(count)
					let isMore = 1;
					if(page*pagesize >= count) isMore = 0;
					res.json({
						status: 1,
						msg: '',
						data: {
							orduts,
							count,
							page,
							isMore,
							statusConb,
						}
					});
				}
			})
		}
	})
}



exports.usTransAjax = (req, res) => {
	let crUser = req.session.crUser;

	let page = 1;
	if(req.query.page && !isNaN(parseInt(req.query.page))) {
		page = parseInt(req.query.page);
	}
	let pagesize = 24;
	if(req.query.pagesize && !isNaN(parseInt(req.query.pagesize))) {
		pagesize = parseInt(req.query.pagesize);
	}
	let skip = (page-1)*pagesize;

	/* 销售公司筛选, 如果是查询订单, 则销售公司一定是本公司*/
	// dutSymb = '$eq';
	// dutCond = crUser.firm._id;

	/* 采购公司筛选, 如果是查询采购单, 则采购公司一定是本公司*/
	let tranSymb = '$ne';
	let tranCond = '5ee8cf3dfd644e4fc8b8536d';
	if(req.query.tranId) {
		tranSymb = '$eq';
		tranCond = req.query.tranId;
	}

	let keySymb = '$ne';
	let keyCond = 'rander[a`a。=]';
	if(req.query.keyword) {
		keySymb = '$in';
		keyCond = String(req.query.keyword);
		keyCond = keyCond.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keyCond = new RegExp(keyCond + '.*');
	}

	let statusSymb = '$ne';
	let statusConb = -1;
	if(req.query.status && !isNaN(parseInt(req.query.status))) {
		statusSymb = '$eq';
		statusConb = parseInt(req.query.status)
	}
	// console.log(statusConb)

	let param = {
		firm: crUser.firm,
		_id: {[tranSymb]: tranCond},
		status: {[statusSymb]: statusConb},

		$or:[
			{'code': {[keySymb]: keyCond}},
			{'nome': {[keySymb]: keyCond}},
		]
	}
	Tran.countDocuments(param, (err, count) => {
		if(err) {
			console.log(err);
			info = "bser TransAjax, Tran.countDocuments(), Error!";
			Err.jsonErr(req, res, info);
		} else {
			Tran.find(param)
			.populate('firm')
			.populate('lger')
			.populate('strmlg')
			.skip(skip).limit(pagesize)
			.sort({'status': 1, 'weight': -1, 'updAt': -1})
			.exec((err, trans) => {
				if(err) {
					console.log(err);
					info = "cter TransAjax, Tran.find(), Error!";
					Err.jsonErr(req, res, info);
				} else {
					// console.log(trans)
					// console.log(page)
					// console.log(count)
					let isMore = 1;
					if(page*pagesize >= count) isMore = 0;
					res.json({
						status: 1,
						msg: '',
						data: {
							trans,
							count,
							page,
							isMore,
							statusConb,
						}
					});
				}
			})
		}
	})
}





exports.usBillsAjax = (req, res) => {
	let crUser = req.session.crUser;

	let page = 1;
	if(req.query.page && !isNaN(parseInt(req.query.page))) {
		page = parseInt(req.query.page);
	}
	let pagesize = 24;
	if(req.query.pagesize && !isNaN(parseInt(req.query.pagesize))) {
		pagesize = parseInt(req.query.pagesize);
	}
	let skip = (page-1)*pagesize;

	/* 采购公司筛选, 如果是查询采购单, 则采购公司一定是本公司*/
	let billSymb = '$ne';
	let billCond = '5ee8cf3dfd644e4fc8b8536d';
	if(req.query.billId) {
		billSymb = '$eq';
		billCond = req.query.billId;
	}

	let genreSymb = '$ne';
	let genreConb = -100;
	if(req.query.genre && !isNaN(parseInt(req.query.genre))) {
		genreSymb = '$eq';
		genreConb = parseInt(req.query.genre)
	}
	// console.log(genreConb)

	let param = {
		firm: crUser.firm,
		_id: {[billSymb]: billCond},
		genre: {[genreSymb]: genreConb},
	}
	Bill.countDocuments(param, (err, count) => {
		if(err) {
			console.log(err);
			info = "bser BillsAjax, Bill.countDocuments(), Error!";
			Err.jsonErr(req, res, info);
		} else {
			Bill.find(param)
			.populate('ordin')
			.populate('ordut')
			.skip(skip).limit(pagesize)
			.sort({'crtAt': 1})
			.exec((err, bills) => {
				if(err) {
					info = "cter BillsAjax, Bill.find(), Error!";
					Err.jsonErr(req, res, info);
				} else {
					// console.log(bills)
					// console.log(page)
					// console.log(count)
					let isMore = 1;
					if(page*pagesize >= count) isMore = 0;
					res.json({
						status: 1,
						msg: '',
						data: {
							bills,
							count,
							page,
							isMore,
							genreConb,
						}
					});
				}
			})
		}
	})
}