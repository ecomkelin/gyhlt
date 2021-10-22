let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Compd';
let dbSchema = new Schema({
	/* ==================================== 默认继承 询价单 ==================================== */
	firm: {type: ObjectId, ref: 'Firm'},		// 所属公司

	qntnum: Number,								// 报价编号
	pdnum: String,								// 产品编号
	area: String,								// 所属区域

	brand: {type: ObjectId, ref: 'Brand'},		// 品牌
	brandNome: String, 

	pdfir: {type: ObjectId, ref: 'Pdfir'},		// 系列
	firphoto: String,							// 从数据库中选的照片
	firNome: String,							// 系列名
	pdNome: String,								// 品类
	photo: String,								// 照片

	pdsec: {type: ObjectId, ref: 'Pdsec'},		// 产品
	secNome: String,							// 产品编号
	specf: String,								// 产品规格
	sketch: String,								// 草图

	pdthd: {type: ObjectId, ref: 'Pdthd'},		// 子产品
	thdNome: String,
	mater: String,
	craft: String,
	thdDesp: String,
	images: [{type: String}],					// 材质图片

	note: String,

	quant: Number,
	/* ============================= 询价单 ============================= */
	inquot: {type: ObjectId, ref: 'Inquot'},	// 所属询报价单
	quner : {type: ObjectId, ref: 'User'},		// 询价员

	estimate: String,							// 预估价格
	qntPr: Float,								// 报价价格

	quter: {type: ObjectId, ref: 'User'},		// 报价报价负责人

	qntpdSts: Number,							// 商品询报价状态
	delNote: String, 							// 为什么是无效产品

	/* ============================= 订单 ============================= */
	ordin: {type: ObjectId, ref: 'Ordin'},		// 所属订单
	cter: {type: ObjectId, ref: 'User'}, 		// 客户
	cterNome: String,							// 销售价格
	dinPr: Float,								// 销售价格
	dinAt: Date,								// 交货日期

	/* ============================= 采购单 ============================= */
	ordut: {type: ObjectId, ref: 'Ordut'},
	strmup: {type: ObjectId, ref: 'Strmup'}, 	// 供应商
	dutPr: Float,								// 采购价格
	dutAt: Date,								// 提货日期

	/* ============================= 物流运输 ============================= */
	tran: {type: ObjectId, ref: 'Tran'},
	trpAt:Date,

	compdSts: Number,							// 商品状态 

	crtAt: Date,								// 创建时间
	updAt: Date,								// 更新更新
});

dbSchema.pre('save', function(next) {
	if(this.isNew) {
		if(!this.crtAt) this.crtAt = Date.now();
		if(!this.updAt) this.updAt = Date.now();
		if(!this.qntPr) this.qntPr = 0;
		if(!this.dinPr) this.dinPr = 0;
		if(!this.dutAt) this.dutAt = 0;
	} else {

	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);