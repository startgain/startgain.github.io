const spiderJuejin = require("../indext");
var fn = async () => {
	const { view_count, digg_count } = await spiderJuejin(
		"https://juejin.cn/post/7005958508617138207"
	);
	console.log("观看数：", view_count);
	console.log("点赞数：", digg_count);
}
fn()