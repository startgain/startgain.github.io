const spiderJuejin = require("./mvp/juejin/indext");
const getBzUpDetail = require("./mvp/theseus/index");
const getDetail = require("./mvp/theseus/getDetail");
const fs = require("fs");
const path = require("path");

let readFsync = function (path_way, context = "") {
  //检查文件是否存在于当前目录中
  return new Promise((resolve, reject) => {
    fs.access(path_way, (err) => {
      if (err) {
        console.log("不存在于当前目录中，准备新建");
        fs.appendFileSync(path_way, context, "utf-8", (err) => {
          if (err) {
            console.log("该文件不存在，重新创建失败！");
            reject(err);
          }
          console.log("已新创建");
          resolve(context);
        });
        return;
      }
      //读取文件
      fs.readFile(path_way, "utf8", (err, res) => {
        if (err) {
          console.log("读取失败");
          throw err;
        }
        resolve(res);
        // 默认buffer数据格式，二进制数据流
      });
      console.log("存在于当前目录中");
    });
  });
};

let writeFile = function (path_way, content = "") {
  fs.writeFileSync(path_way, content, (err) => {
    if (err) {
      console.log(err);
    }
    console.log("写入成功");
  });
};
let getJueJinInfo = async (url) => {
  var jjData = {
    digg_count: 0,
    view_count: 0,
  };
  var { digg_count, view_count } = await spiderJuejin(url);
  jjData.digg_count += digg_count * 1;
  jjData.view_count = +view_count * 1;
  return jjData;
};
let getBzInfo = async (homePage) => {
  var bzData = {
    view: 0,
    like: 0,
    coin: 0,
    collect: 0,
  };
  var bzHomePageInfo = await getBzUpDetail(homePage);
  if (bzHomePageInfo && bzHomePageInfo.list) {
    var promises = [];
    bzHomePageInfo.list.forEach(async (item) => {
      promises.push(getDetail(item.video));
    });
    var allDetail = await Promise.all(promises);
    allDetail.forEach(({ view, like, coin, collect }) => {
      bzData.view += view * 1;
      bzData.like += like * 1;
      bzData.coin += coin * 1;
      bzData.collect += collect * 1;
    });
  }
  return bzData;
};
async function start(path_way) {
  //   const data = await readFsync(path_way);
  var allData = {
    digg_count: 0,
    view_count: 0,
    view: 0,
    like: 0,
    coin: 0,
    collect: 0,
  };
  var jjData = await getJueJinInfo(
    "https://juejin.cn/post/7036369407521587213"
  );
  var bzData = await getBzInfo("https://space.bilibili.com/1334519689");
  var content = fileContentWrite({ ...jjData, ...bzData });
  writeFile(path_way, content);
}

let fileContentWrite = (data) => {
  //"# 最小Mvp\n\n|        | 掘金 | b站  |\n| ------ | ---- | ---- |\n| 点赞   | 1    | 2    |\n| 浏览   | 3    | 4    |\n| 文章数 | 5    | 6    |\n\n"  baseContent
  const content = `# 最小Mvp\n\n|        | 掘金 | b站  |\n| ------ | ---- | ---- |\n| 点赞   | ${data.digg_count}    |  ${data.like}   |\n| 浏览   | ${data.view_count}    |  ${data.view}    |\n| 文章数 |     |     |\n\n`;
  return content;
};

const filePath = path.join(__dirname, "./README.md");

start(filePath);
