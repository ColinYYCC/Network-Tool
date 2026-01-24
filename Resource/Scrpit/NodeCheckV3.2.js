/**
 * @Sub-Store-Page
 * CNAME 接口查询去重/重命名 2026-01-24
 * - 入口查询[国内spapi 识别到国外为ip-api] 落地查询[ip-api]
 * - 根据接口返回的真实结果，重新对节点命名。
 * - 添加入口城市、落地国家或地区、国内运营商信息，并对这些数据做持久化缓存（48小时有效期），减少API请求次数，提高运行效率。
 * - 仅兼容 Surge, Loon 客户端。
 * - Surge 需要固定带 ability 参数版本。
 * 特别说明：
 * - 符号：🅳电信 🅻联通 🆈移动 🅶广电 🅲公司 🆉直连 🎮游戏
 * - 首次运行或者在没有缓存的情况下会通知进度
 * - 无参数时的节点命名格式: "美国 01"
 * - 1. 官方默认版(目前不带 ability 参数, 不保证以后不会改动): 》https://raw.githubusercontent.com/sub-store-org/Sub-Store/master/config/Surge.sgmodule
 *
 * - 2. 固定带 ability 参数版本,可能会爆内存, 如果需要使用指定节点功能 例如 [加国旗脚本或者cname脚本] 请使用此带 ability 参数版本: https://raw.githubusercontent.com/sub-store-org/Sub-Store/master/config/Surge-ability.sgmodule
 *
 * - 3. 固定不带 ability 参数版本：https://raw.githubusercontent.com/sub-store-org/Sub-Store/master/config/Surge-Noability.sgmodule
 *
 * - 参数必须以"#"开头，多个参数使用"&"连接，例如 https://github.com/Keywos/rule/raw/main/cname.js#city&iisp&name=Name
 * - 以下是此脚本支持的参数，必须以"#"开头，多个参数使用"&"连接，需要传入参数的话用 "=" 例如 "name=一元" 参考上述地址为例使用参数。
 * - 无参数时的节点命名格式: "美国 01"，如果 [入口IP或国家]或 [落地IP或国家]一样则为 "直连 德国 01" 
 * - 首次运行或者在没有缓存的情况下会通知进度
 * 
 * 
 * 入口参数
 * - [iisp]      增加入口运营商或者直连标识；
 * - [city]      增加入口城市文字标识；
 * - [sheng]     增加入口省份文字标识；
 * - [yuan]      为境外入口添加真实的入口属地标识，当未配置此此参数时，则将境外入口统一标记为 [境外]，默认未配置此参数；
 * - [inflag]    增加入口国旗
 * 
 * 落地参数
 * - [yisp]      显示落地详细运营商名称；
 * - [yw]        落地归属地使用英文缩写标识，不建议与其他入口参数配合使用，因为其他参数API没有返回英文；
 * - [xy]        此参数关闭落地查询，仅查询入口；开启 yisp || yw || flag 参数后 xy 参数无效
 * 
 * 图标参数
 * - [game]      增加游戏节点标识；
 * - [flag]      增加国家或地区的旗帜标识，默认无此参数；
 * - [bl]        保留倍率标识；
 * - [snone]     清理某地区内只有一个节点的序号；
 * 
 * 分隔符参数
 * - [fgf=]      设置入口和落地之间的分隔符，默认为空格；
 * - [sn=]       设置国家与序号之间的分隔符，默认为空格；
 * - [name=]     为节点添加机场名称前缀；
 * 
 * 通知参数
 * - [offtz]     关闭脚本通知；
 * 
 * 解析参数
 * - [dnsjx]     将节点域名解析为IP，普通用户不建议使用；
 * 
 * 逻辑参数
 * - [bs=]       批处理节点数建议10个左右，如果经常读不到节点建议减小批处理个数；
 * 
 * 缓存参数
 * - [h=]        节点缓存有效期，单位小时，时间参数只能二选一，Loon用户不需填写要此参数，请进入Sub-Store插件的配置界面自定义缓存有效期；
 * - [min=]      节点缓存有效期，单位分钟，时间参数只能二选一，Loon用户不需填写要此参数，请进入Sub-Store插件的配置界面自定义缓存有效期；
 * 
 * 超时参数
 * - [timeout=]  当无任何节点缓存时测试节点HTTP延时允许的最大超时参数，超出允许范围则判定为无效节点，默认2000ms；
 * - [cd=]       当有缓存时，会先读取缓存，直接输出结果；默认 [cd=]的值等于0，微直接读取缓存； 
 * 当设为更高的值: 比如'460'则每次读缓存都会再次处理之前判定为超时的节点,超时为460ms
 *
 * 其他参数
 * - [debug]     调试日志，普通用户不建议使用。
 * - 异常：如遇问题，Loon可以进入[配置]→[持久化缓存]→[删除指定数据]→输入Key [sub-store-cached-script-resource]并删除缓存。累计输出节点为0个3次以上将清理所有缓存
 * - Surge需要进入[脚本编辑器]→左下角[设置]→[$persistentStore]  [sub-store-cached-script-resource]删除缓存数据。
 */

const SUB_STORE_SCHEMA = {
  title: "CNAME",
  description: "根据接口返回的真实结果，重新对节点命名/去重。 如：入口/落地详细地区信息",
  scope: ["Surge", "Loon"],
  author: "@Key @奶茶姐 @小一 @可莉",
  updateTime: "2026-01-24 18:00:00",
  version: "3.0.0",
  params: {
    flag: {
      datatype: "boolean",
      description: "增加落地国家或地区的旗帜标识，默认无此参数",
      defaultValue: false,
    },
    inflag: {
      datatype: "boolean",
      description: "增加入口国家或地区的旗帜标识，默认无此参数",
      defaultValue: false,
    },
    xy: {
      datatype: "boolean",
      description: "关闭落地查询，仅查询入口；开启 yisp || yw || flag 参数后 xy 参数无效",
      defaultValue: false,
    },
    iisp: {
      datatype: "boolean",
      description: "增加入口运营商或者直连标识",
      defaultValue: false,
    },
    city: {
      datatype: "boolean",
      description: "增加入口城市文字标识",
      defaultValue: false,
    },
    sheng: {
      datatype: "boolean",
      description: "增加入口省份文字标识",
      defaultValue: false,
    },
    yuan: {
      datatype: "boolean",
      description:
        "为境外入口添加真实的入口属地标识，当未配置此此参数时，则将境外入口统一标记为[境外]，默认未配置此参数",
      defaultValue: false,
    },
    yisp: {
      datatype: "boolean",
      description: "显示落地详细运营商名称",
      defaultValue: false,
    },
    yw: {
      datatype: "boolean",
      description:
        "落地归属地使用英文缩写标识，不建议与其他入口参数配合使用，因为其他参数API没有返回英文",
      defaultValue: false,
    },
    game: {
      datatype: "boolean",
      description: "增加游戏节点标识",
      defaultValue: false,
    },
    bl: {
      datatype: "boolean",
      description: "保留倍率标识",
      defaultValue: false,
    },
    snone: {
      datatype: "boolean",
      description: "清理某地区内只有一个节点的序号",
      defaultValue: false,
    },
    offtz: {
      datatype: "boolean",
      description: "关闭脚本通知",
      defaultValue: false,
    },
    dnsjx: {
      datatype: "boolean",
      description: "将节点域名解析为IP, 普通用户不建议使用",
      defaultValue: false,
    },
    debug: {
      datatype: "boolean",
      description: "调试日志，普通用户不建议使用",
      defaultValue: false,
    },
    fgf: {
      datatype: "string",
      description: "设置入口和落地之间的分隔符，默认为空格",
      defaultValue: " ",
    },
    sn: {
      datatype: "string",
      description: "设置国家与序号之间的分隔符，默认为空格",
      defaultValue: " ",
    },
    name: {
      datatype: "string",
      description: "为节点添加机场名称前缀",
      defaultValue: "",
    },
    timeout: {
      datatype: "number",
      description:
        "当无任何节点缓存时测试节点HTTP延时允许的最大超时参数，超出允许范围则判定为无效节点，默认2000ms",
      defaultValue: 2000,
    },
    cd: {
      datatype: "number",
      description:
        "当有缓存时，会先读取缓存，直接输出结果；默认[cd=]的值等于0，微直接读取缓存； 当设为更高的值: 比如'460'则每次读缓存都会再次处理之前判定为超时的节点,超时为460ms",
      defaultValue: 0,
    },
    bs: {
      datatype: "number",
      description:
        "批处理节点数建议10个左右，如果经常读不到节点建议减小批处理个数",
      defaultValue: 10,
    },
    h: {
      datatype: "number",
      description:
        "节点缓存有效期，单位小时，时间参数只能二选一，Loon用户不需填写要此参数，请进入Sub-Store插件的配置界面自定义缓存有效期",
      defaultValue: "",
    },
    min: {
      datatype: "number",
      description:
        "节点缓存有效期，单位分钟，时间参数只能二选一，Loon用户不需填写要此参数，请进入Sub-Store插件的配置界面自定义缓存有效期",
      defaultValue: "",
    },
  },
};

const $ = $substore;
const iar = $arguments;
let debug = iar.debug;
const { yw, bl, iisp, xy, yisp, city, flag, inflag, game, yuan, sheng, offtz, snone: numone } = iar;
const h = iar.h ? decodeURI(iar.h) : "", min = iar.min ? decodeURI(iar.min) : "", firstN = iar.name ? decodeURI(iar.name) : "";
const { isLoon, isSurge } = $substore.env;
const dns = iar.dnsjx;
const target = isLoon ? "Loon" : isSurge ? "Surge" : undefined;
const keypr = "peedtest";
let cd = iar.cd ? iar.cd : 0, timeout = iar.timeout ? iar.timeout : 2000;
let innum = 1728e5, loontrue = false, onen = false, Sue = false, rawtime = 1500;
const keyp = "3.s", EXPIRATION_KEY = "#sub-store-csr-expiration-time";

if (min !== "") {
  Sue = true;
  innum = parseInt(min, 10) * 6e4;
  $.write(JSON.stringify(innum), EXPIRATION_KEY);
} else if (h !== "") {
  Sue = true;
  innum = parseInt(h, 10) * 36e5;
  $.write(JSON.stringify(innum), EXPIRATION_KEY);
} else {
  $.write(JSON.stringify(innum), EXPIRATION_KEY);
}

let TIMEDKEY = $.read(EXPIRATION_KEY), inapi = 0;

// 配置常量
const CONFIG = {
  BATCH_SIZE: iar.bs || 10,
  TIMEOUT: timeout,
  CACHE_TIMEOUT: cd,
  RETRY_MAX: 2,
  CACHE_KEY_PREFIX: {
    ALI: "al",
    SP: "sc",
    IN: "in",
    OUT: "out"
  }
};

// 缓存映射表
const CACHE_MAPS = {
  alMap: new Map(),
  spMap: new Map(),
  iaMap: new Map(),
  oaMap: new Map()
};

// API统计
let apiStats = {
  read: 0,
  write: 0
};

/**
 * 主函数入口
 */
async function operator(e = [], env) {
  const startTime = new Date();
  const support = isLoon || isSurge;
  
  // 初始化变量
  let tzname = "", subcoll = "", x = false, xys = false;
  if (env?.source?.[e?.[0]?.subName]) x = true;
  if (env?.source?._collection?.name) xys = true;
  
  // 确定订阅信息
  if (x && xys) {
    tzname = env.source._collection.name + ": [" + env.source._collection.subscriptions + "]";
    subcoll = "组合订阅内单条订阅加了脚本, 输出组合订阅";
  } else if (x) {
    tzname = env.source[e[0].subName].name;
    subcoll = "单条订阅脚本";
  } else {
    tzname = env.source._collection.name;
    subcoll = "组合订阅脚本";
  }
  
  // 日志函数
  function klog(...arg) {
    console.log('[CNAME] ' + subcoll + tzname + " : " + arg);
  }
  
  // 检查节点数量
  if (e.length < 1) {
    $.notify(subcoll + tzname, "订阅无节点", "");
    return e;
  }
  
  // 检查缓存是否可用
  if (typeof scriptResourceCache === "undefined") return e;
  
  const ein = e.length;
  const eins = ein / 2;
  
  klog(`开始处理节点: ${ein} 个`);
  klog(`批处理节点数: ${CONFIG.BATCH_SIZE} 个`);
  klog(`设定api超时: ${zhTime(timeout)}`);
  klog(`有缓api超时: ${zhTime(cd)}`);
  
  // 检查缓存数量
  let cachen = 0;
  for (const pk of e) {
    const id = getid(pk);
    if (scriptResourceCache.get(id)) {
      cachen++;
      if (cachen > eins && !onen) {
        klog(`检查缓存数量: ${cachen}/${ein} 个`);
        rawtime = timeout;
        timeout = cd;
        onen = true;
        break;
      }
    }
  }
  
  // 显示通知
  if (!onen && !offtz) {
    $.notify(subcoll + tzname, `开始处理节点: ${ein} 个 批处理数量: ${CONFIG.BATCH_SIZE} 个`, "请等待处理完毕后再次点击预览");
  }
  
  // 重试逻辑
  let retryi = 0, breaki = false;
  do {
    const processedNodes = await processNodesBatch(e, CONFIG.BATCH_SIZE, klog, subcoll, tzname);
    
    // 检查是否所有节点落地IP相同
    if (processedNodes.length > 3 && isSurge) {
      const allsame = processedNodes.every((value, index, arr) => value._outips === arr[0]._outips);
      if (allsame) {
        klog(`未使用带指定节点功能的 SubStore, 或所有节点落地IP相同`);
        $.notify('CNAME：点击以安装对应版本', '未使用带指定节点功能的 SubStore，或所有节点落地IP相同', '', {
          url: "https://raw.githubusercontent.com/sub-store-org/Sub-Store/master/config/Surge-ability.sgmodule",
        });
        return processedNodes;
      }
    }
    
    // 移除重复节点（基于qc属性）
    !xy && (e = removels(e));
    
    // 处理重试
    if (inapi >= 1) {
      retryi++;
      timeout = rawtime;
      onen = false;
      // 清空缓存映射
      Object.values(CACHE_MAPS).forEach(map => map.clear());
      klog(`重试中...`);
    } else {
      retryi = 2;
    }
  } while (retryi < 2);
  
  // 最终处理
  !xy && (e = removeqc(e));
  e = jxh(e);
  numone && (e = onee(e));
  
  const endTime = new Date();
  const timeDiff = endTime.getTime() - startTime.getTime();
  const eout = e.length;
  
  // 输出日志
  if (dns) klog(`dns解析后共: ${eout} 个`);
  apiStats.read > 0 && klog(`读取api缓存: ${apiStats.read} 个`);
  apiStats.write > 0 && klog(`写入api缓存: ${apiStats.write} 个`);
  klog(`处理完后剩余: ${eout} 个`);
  
  // 缓存过期时间
  let Pushtd = "";
  if (isLoon) {
    const intimed = $.read("#节点缓存有效期");
    const loonkkk = {"1分钟":6e4,"5分钟":3e5,"10分钟":6e5,"30分钟":18e5,"1小时":36e5,"2小时":72e5,"3小时":108e5,"6小时":216e5,"12小时":432e5,"24小时":864e5,"48小时":1728e5,"72小时":2592e5,"参数传入":"innums"};
    const loontd = loonkkk[intimed] || 1728e5;
    const readt = scriptResourceCache.gettime(e[0]?.keyrk || getid(e[0]));
    const nt = new Date().getTime();
    Pushtd = `, ${zhTime(parseInt(readt, 10) - nt + parseInt(loontd, 10))}后过期 \n`;
    klog("缓存过期时间: " + intimed + ", 还剩" + Pushtd.replace(/,|\n/g, ""));
  } else {
    const readt = scriptResourceCache.gettime(e[0]?.keyrk || getid(e[0]));
    const nt = new Date().getTime();
    Pushtd = `, ${zhTime(parseInt(readt, 10) - nt + parseInt(TIMEDKEY, 10))}后过期 \n`;
    klog("缓存过期时间: " + zhTime(TIMEDKEY) + ", 还剩" + Pushtd.replace(/,|\n/g, ""));
  }
  
  klog(`此方法总用时: ${zhTime(timeDiff)}\n----For New CNAME----\n\n\n\n`);
  
  // 显示通知
  const readklog = apiStats.read ? `读取缓存:${apiStats.read} ` : "";
  const writeklog = apiStats.write ? `写入缓存:${apiStats.write}, ` : "";
  const Push = (eout === ein && eout === 0) ? "" : (eout === ein ? "全部通过测试, " : "去除无效节点后有" + eout + "个, ");
  
  if (!offtz) {
    $.notify(
      `${subcoll}${tzname} 共${ein}个节点`,
      "",
      `${writeklog}${readklog}${Pushtd}${Push}用时:${zhTime(timeDiff)}`
    );
  }
  
  return e;
}

/**
 * 批量处理节点
 */
async function processNodesBatch(nodes, batchSize, klog, subcoll, tzname) {
  const results = [];
  const nodeCount = nodes.length;
  
  for (let i = 0; i < nodeCount; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);
    
    // 使用Promise.all替代Promise.allSettled，确保严格过滤无效节点
    try {
      const batchResults = await Promise.all(
        batch.map(async (pk) => {
          return await processSingleNode(pk);
        })
      );
      
      // 收集成功结果
      batchResults.forEach(result => {
        if (result) {
          results.push(result);
        }
      });
    } catch (err) {
      debug && klog(`批处理失败: ${err.message}`);
      // 继续处理下一批，不中断整个流程
    }
    
    // 显示进度
    const processed = Math.min(i + batchSize, nodeCount);
    klog(`处理进度${processed}/${nodeCount}`);
    
    // 进度通知
    if (!onen && !offtz && (nodeCount > processed * 2)) {
      if (processed >= (nodeCount / 3) && processed < (nodeCount * 2 / 3)) {
        $.notify(subcoll + tzname, `处理进度${processed}/${nodeCount}`, "耐心等待, 请勿重复点击预览...");
      }
    }
    
    // 非缓存模式下添加随机延迟
    if (!onen) {
      await sleep(GRa());
    }
  }
  
  // 更新原始节点数组
  nodes.splice(0, nodes.length, ...results);
  return nodes;
}

/**
 * 处理单个节点
 */
async function processSingleNode(pk) {
  let Yserver = pk.server, luodi = "", inQcip = "", nxx = "", adflag = "", OGame = "", Oisp = "", Oispflag = "", Osh = "", Oct = "", zhi = "", yuanisp = "", isCN = false, v4 = false, v6 = false, isNoAli = false;
  
  // 域名解析
  let inServer = await AliD(Yserver);
  debug && delog(inServer);
  
  if (inServer === "keyn") {
    isNoAli = true;
    inServer = Yserver;
  } else {
    pk.keyrk = inServer;
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(inServer)) {
      v4 = true;
    } else if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(inServer)) {
      v6 = true;
    }
  }
  
  // 落地查询
  let btip = true, outu = "", outips = "";
  if (!xy || yisp || yw || flag) {
    const outip = await OUTIA(pk);
    let { country: outUsq, countryCode: outUs, city: outCity, query: outQuery, isp: outisp } = outip;
    
    if (yisp) {
      yuanisp = FGFS + outisp;
    }
    
    debug && (pk.keyoutld = outip);
    debug && delog("落地信息 " + JSON.stringify(outip));
    
    outu = outUs;
    outips = outQuery;
    luodi = (outUsq === "中国") ? outCity : (yw ? outUs : outUsq);
    btip = outQuery !== inServer;
    pk._outips = outQuery;
  }
  
  // 入口查询
  if (btip || xy) {
    if (!isNoAli || v4) {
      const spkey = await SPEC(inServer);
      let { country: inSpCn, regionName: inSpSheng, city: inSpCity, isp: inSpIsp, ip: inSpIp, countryCode: inCode } = spkey;
      
      inflag && (pk._iflag = getflag(inCode));
      debug && (pk.keyinsp = spkey);
      
      isCN = inSpCn === "中国";
      inQcip = inServer;
      
      const keycm = {电信:"🅳", 联通:"🅻", 移动: "🆈",广电:"🅶"};
      if (isCN) {
        debug && delog("国内入口 " + JSON.stringify(spkey));
        
        if (iisp && flag) {
          inSpIsp = inSpIsp.replace(/中国/g, "");
          flag && (Oispflag = keycm.hasOwnProperty(inSpIsp) ? keycm[inSpIsp] : "🅲");
        } else if (iisp) {
          Oisp = /电信|联通|移动|广电/.test(inSpIsp) ? inSpIsp.replace(/中国/g, "") : "企业";
        }
        
        (inSpSheng === inSpCity) && (inSpCity = "");
        
        if (sheng && city) {
          Osh = inSpSheng; Oct = inSpCity;
        } else if (sheng) {
          Osh = inSpSheng;
        } else if (city) {
          Oct = inSpCity ? inSpCity : inSpSheng;
        }
      }
    }
    
    if (isNoAli || v6 || !isCN) {
      const inip = await INIA(Yserver);
      let { country: inUsq, city: inCity, query: inQuery, regionName: inIpSh, countryCode: inaCode } = inip;
      
      inflag && (pk._iflag = getflag(inaCode));
      debug && (pk.keyinipapi = inip);
      debug && delog("ipapi入口 " + JSON.stringify(inip));
      
      inQcip = inQuery;
      
      if (inUsq === "中国") {
        (/[a-zA-Z]/.test(inCity)) && (inCity = inIpSh);
        (inCity === inIpSh) && (inIpSh = "");
        
        if (sheng && city) {
          Osh = inIpSh; Oct = inCity;
        } else if (sheng) {
          Osh = inIpSh;
        } else if (city) {
          Oct = inCity ? inCity : inIpSh;
        }
        
        flag && (Oispflag = "🅲");
      } else {
        if (inQuery === outips) {
          flag && (Oispflag = "🆉");
          (sheng || city || iisp) && (zhi = "直连");
        } else if (yuan) {
          flag && (Oispflag = "🅲");
          (sheng || city || iisp) && (zhi = inUsq);
        } else {
          flag && (Oispflag = "🆇");
          (sheng || city || iisp) && (zhi = "境外");
        }
      }
    }
  } else {
    flag && (Oispflag = "🆉");
    (sheng || city || iisp) && (zhi = "直连");
  }
  
  // 处理国旗
  flag && (adflag = getflag(outu));
  
  // 处理游戏标识
  game && (OGame = /game|游戏/i.test(pk.name) ? (flag ? "🎮" : FGF + "Game") : OGame);
  
  // 处理倍率
  if (bl) {
    const match = pk.name.match(/((倍率|X|x|×)\D?((\d\.)?\d+)\D?)|((\d\.)?\d+)(倍|X|x|×)/);
    if (match) {
      const matchVa = match[0].match(/(\d[\d.]*)\D*/)[0].trim();
      if (matchVa !== "1") {
        nxx = XHFGF + matchVa + "X";
      }
    }
  }
  
  // 生成节点名称
  const FGF = iar.fgf == undefined ? " " : decodeURI(iar.fgf);
  const FGFS = FGF;
  const XHFGF = iar.sn == undefined ? " " : decodeURI(iar.sn);
  
  (!iisp && !city && !sheng && !xy && !inflag) && (Oispflag = "", FGF = "");
  
  let keyover = [
    firstN, 
    pk._iflag || "", 
    Oispflag, 
    Osh, 
    Oct, 
    Oisp, 
    zhi, 
    FGF, 
    adflag, 
    luodi, 
    OGame, 
    nxx, 
    yuanisp
  ].filter(ki => ki !== "");
  
  let overName = keyover.join("");
  xy && (overName = (pk._iflag || "") + overName + FGF + pk.name);
  
  // 应用DNS解析
  dns && (pk.server = inQcip);
  
  // 设置节点名称
  pk.name = overName;
  inflag && !pk._iflag && (pk.name = getflag(outu) + overName);
  
  // 设置去重标识
  pk.qc = inQcip + outips;
  
  return pk;
}

// 工具函数
function getid(e) { return MD5(`${e.server}-${e.port}-${e.type}`); }
function getaliid(e) { return MD5(`${CONFIG.CACHE_KEY_PREFIX.ALI}-${e}`); }
function getspcn(e) { return MD5(`${CONFIG.CACHE_KEY_PREFIX.SP}-${e}`); }
function getinid(e) { return MD5(`${CONFIG.CACHE_KEY_PREFIX.IN}-${e}`); }
function getoutid(e) { return getid(e); }

function delog(...arg) { if (debug) { console.log('[CNAME] :' + arg); } }
function sleep(e) { return new Promise((t) => setTimeout(t, e)); }
function GRa() { return Math.floor(Math.random() * (500 - 50 + 1) + 50); }

// 国旗生成函数
function getflag(e) {
  const t = e.toUpperCase().split("").map((e) => 127397 + e.charCodeAt());
  return String.fromCodePoint(...t).replace(/🇹🇼/g, "🇨🇳");
}

// 时间格式化函数
function zhTime(e) {
  e = e.toString().replace(/-/g, "");
  if (e < 1e3) {
    return `${Math.round(e)}毫秒`;
  } else if (e < 6e4) {
    return `${Math.round(e / 1e3)}秒`;
  } else if (e < 36e5) {
    return `${Math.round(e / 6e4)}分钟`;
  } else {
    return `${Math.round(e / 36e5)}小时`;
  }
}

// HTTP请求封装
async function httpGetWithTimeout(url, options = {}, timeoutMs) {
  return Promise.race([
    $.http.get({ url, ...options }),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout-${url}`)), timeoutMs))
  ]);
}

// API请求通用函数
async function apiRequest(cacheMap, cacheKey, url, maxRetries, timeoutMs, processor) {
  // 检查内存缓存
  if (cacheMap.has(cacheKey)) {
    return cacheMap.get(cacheKey);
  }
  
  // 检查持久化缓存
  const cached = scriptResourceCache.get(cacheKey);
  if (cached) {
    apiStats.read++;
    cacheMap.set(cacheKey, cached);
    return cached;
  }
  
  inapi++;
  
  // 发送请求
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const response = await httpGetWithTimeout(url, {}, timeoutMs);
      
      // 严格检查响应
      if (!response || !response.body) {
        throw new Error(`无效响应: ${url}`);
      }
      
      const data = JSON.parse(response.body);
      
      // 检查数据有效性
      if (!data || typeof data !== 'object') {
        throw new Error(`无效数据格式: ${url}`);
      }
      
      // 调用处理器处理数据
      const result = processor(data);
      
      // 检查处理结果有效性
      if (!result || typeof result !== 'object') {
        throw new Error(`无效处理结果: ${url}`);
      }
      
      // 缓存结果
      scriptResourceCache.set(cacheKey, result);
      cacheMap.set(cacheKey, result);
      apiStats.write++;
      
      return result;
    } catch (error) {
      retryCount++;
      if (retryCount < maxRetries) {
        await sleep(GRa());
        delog(`${url} -> [超时查询次数] ${retryCount}`);
      } else {
        throw error;
      }
    }
  }
}

// 落地IP查询
async function OUTIA(e) {
  const t = getoutid(e);
  const url = `http://ip-api.com/json?lang=zh-CN&fields=status,message,country,countryCode,city,query,isp`;
  
  return apiRequest(CACHE_MAPS.oaMap, t, url, CONFIG.RETRY_MAX, timeout, (data) => {
    if (data.status === "success") {
      return data;
    } else {
      throw new Error(data.message);
    }
  });
}

// 域名解析
async function AliD(e) {
  const ti = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(e);
  if (ti) return e;
  
  const t = getaliid(e);
  const alip = Math.random() < 0.5 ? '223.5.5.5' : '223.6.6.6';
  const url = `https://${alip}/resolve?name=${e}&type=A&short=1`;
  
  return apiRequest(CACHE_MAPS.alMap, t, url, CONFIG.RETRY_MAX, timeout, (resdata) => {
    if (resdata.length > 0) {
      return resdata[0];
    } else {
      return "keyn";
    }
  });
}

// 国内入口IP查询
async function SPEC(e) {
  const n = getspcn(e);
  const url = `https://api-v${keyp}${keypr}.cn/ip?ip=${e}`;
  
  return apiRequest(CACHE_MAPS.spMap, n, url, CONFIG.RETRY_MAX, timeout, (resdata) => {
    if (resdata.data) {
      const { country: e, province: o, city: r, isp: i, ip: c, countryCode: k } = resdata.data;
      return { country: e, regionName: o, city: r, isp: i, ip: c, countryCode: k };
    } else {
      throw new Error(resdata.message);
    }
  });
}

// 国外入口IP查询
async function INIA(e) {
  const t = getinid(e);
  const url = `http://ip-api.com/json/${e}?lang=zh-CN&fields=status,message,country,city,query,regionName,countryCode`;
  
  return apiRequest(CACHE_MAPS.iaMap, t, url, CONFIG.RETRY_MAX, timeout, (data) => {
    if (data.status === "success") {
      return data;
    } else {
      throw new Error(data.message);
    }
  });
}

// 节点去重函数 - 严格模式
function removels(e) {
  const t = new Set();
  const n = [];
  
  for (const s of e) {
    // 严格检查qc属性，确保有效
    if (s.qc && typeof s.qc === 'string' && s.qc.length > 0) {
      // 使用更严格的去重逻辑，确保每个qc只对应一个节点
      if (!t.has(s.qc)) {
        t.add(s.qc);
        n.push(s);
      }
    }
    // 没有qc属性的节点视为无效节点，直接过滤
  }
  
  return n;
}

function removeqc(e) {
  const t = new Set();
  const n = [];
  for (const s of e) {
    if (!t.has(s.qc)) {
      t.add(s.qc);
      const cleaned = { ...s };
      delete cleaned.qc;
      delete cleaned._iflag;
      delete cleaned._outips;
      n.push(cleaned);
    }
  }
  return n;
}

// 节点重新编号
function jxh(e) {
  const t = e.reduce((acc, curr) => {
    const key = curr.name.replace(/\s*\d+$/, "");
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, {});
  
  const result = [];
  for (const key in t) {
    const nodes = t[key];
    nodes.forEach((node, index) => {
      const newName = `${key}${XHFGF}${(index + 1).toString().padStart(2, "0")}`;
      result.push({ ...node, name: newName });
    });
  }
  
  return result;
}

// 清理单节点序号
function onee(e) {
  const t = e.reduce((acc, curr) => {
    const key = curr.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, "");
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, {});
  
  for (const key in t) {
    if (t[key].length === 1 && t[key][0].name.endsWith("01")) {
      t[key][0].name = t[key][0].name.replace(/[^.]01$/, "");
    }
  }
  
  return Object.values(t).flat();
}

// MD5函数
var MD5=function(e){var t=M(V(Y(X(e),8*e.length)));return t.toLowerCase()};function M(e){for(var t,n="0123456789ABCDEF",s="",o=0;o<e.length;o++)t=e.charCodeAt(o),s+=n.charAt(t>>>4&15)+n.charAt(15&t);return s}function X(e){for(var t=Array(e.length>>2),n=0;n<t.length;n++)t[n]=0;for(n=0;n<8*e.length;n+=8)t[n>>5]|=(255&e.charCodeAt(n/8))<<n%32;return t}function V(e){for(var t="",n=0;n<32*e.length;n+=8)t+=String.fromCharCode(e[n>>5]>>>n%32&255);return t}function Y(e,t){e[t>>5]|=128<<t%32,e[14+(t+64>>>9<<4)]=t;for(var n=1732584193,s=-271733879,o=-1732584194,r=271733878,i=0;i<e.length;i+=16){var c=n,a=s,u=o,m=r;s=md5_ii(s=md5_ii(s=md5_ii(s=md5_ii(s=md5_hh(s=md5_hh(s=md5_hh(s=md5_hh(s=md5_gg(s=md5_gg(s=md5_gg(s=md5_gg(s=md5_ff(s=md5_ff(s=md5_ff(s=md5_ff(s,o=md5_ff(o,r=md5_ff(r,n=md5_ff(n,s,o,r,e[i+0],7,-680876936),s,o,e[i+1],12,-389564586),n,s,e[i+2],17,606105819),r,n,e[i+3],22,-1044525330),o=md5_ff(o,r=md5_ff(r,n=md5_ff(n,s,o,r,e[i+4],7,-176418897),s,o,e[i+5],12,1200080426),n,s,e[i+6],17,-1473231341),r,n,e[i+7],22,-45705983),o=md5_ff(o,r=md5_ff(r,n=md5_ff(n,s,o,r,e[i+8],7,1770035416),s,o,e[i+9],12,-1958414417),n,s,e[i+10],17,-42063),r,n,e[i+11],22,-1990404162),o=md5_ff(o,r=md5_ff(r,n=md5_ff(n,s,o,r,e[i+12],7,1804603682),s,o,e[i+13],12,-40341101),n,s,e[i+14],17,-1502002290),r,n,e[i+15],22,1236535329),o=md5_gg(o,r=md5_gg(r,n=md5_gg(n,s,o,r,e[i+1],5,-165796510),s,o,e[i+6],9,-1069501632),n,s,e[i+11],14,643717713),r,n,e[i+0],20,-373897302),o=md5_gg(o,r=md5_gg(r,n=md5_gg(n,s,o,r,e[i+5],5,-701558691),s,o,e[i+10],9,38016083),n,s,e[i+15],14,-660478335),r,n,e[i+4],20,-405537848),o=md5_gg(o,r=md5_gg(r,n=md5_gg(n,s,o,r,e[i+9],5,568446438),s,o,e[i+14],9,-1019803690),n,s,e[i+3],14,-187363961),r,n,e[i+8],20,1163531501),o=md5_gg(o,r=md5_gg(r,n=md5_gg(n,s,o,r,e[i+13],5,-1444681467),s,o,e[i+2],9,-51403784),n,s,e[i+7],14,1735328473),r,n,e[i+12],20,-1926607734),o=md5_hh(o,r=md5_hh(r,n=md5_hh(n,s,o,r,e[i+5],4,-378558),s,o,e[i+8],11,-2022574463),n,s,e[i+11],16,1839030562),r,n,e[i+14],23,-353095),o=md5_hh(o,r=md5_hh(r,n=md5_hh(n,s,o,r,e[i+4],4,-722521979),s,o,e[i+7],11,76029189),n,s,e[i+10],16,-640364487),r,n,e[i+13],23,-421815835),o=md5_hh(o,r=md5_hh(r,n=md5_hh(n,s,o,r,e[i+2],4,530742520),s,o,e[i+5],11,-995338651),n,s,e[i+8],16,604817799),r,n,e[i+11],23,-198630844),o=md5_hh(o,r=md5_hh(r,n=md5_hh(n,s,o,r,e[i+0],4,-57434055),s,o,e[i+3],11,1873313359),n,s,e[i+6],16,-30611744),r,n,e[i+9],23,-1560198380),o=md5_ii(o,r=md5_ii(r,n=md5_ii(n,s,o,r,e[i+15],6,1309151649),s,o,e[i+14],10,-145523070),n,s,e[i+13],15,-716787086),r,n,e[i+12],21,380534534),o=md5_ii(o,r=md5_ii(r,n=md5_ii(n,s,o,r,e[i+11],6,-1364034841),s,o,e[i+10],10,-1069501632),n,s,e[i+9],15,606105819),r,n,e[i+8],21,-1735328473),o=md5_ii(o,r=md5_ii(r,n=md5_ii(n,s,o,r,e[i+7],6,1236535329),s,o,e[i+6],10,-1272893353),n,s,e[i+5],15,-165796510),r,n,e[i+4],21,-1001043312),o=md5_ii(o,r=md5_ii(r,n=md5_ii(n,s,o,r,e[i+3],6,1979021679),s,o,e[i+2],10,-1894986606),n,s,e[i+1],15,1163531501),r,n,e[i+0],21,-306404559),n^=c,s^=a,o^=u,r^=m};return r}function md5_cmn(e,t,n,s,o,r){return md5_rol((t&n)|(~t&s)+e+o,r)}function md5_ff(e,t,n,s,o,r,i){return md5_cmn(t&n|~t&s,e,t,o,r,i)}function md5_gg(e,t,n,s,o,r,i){return md5_cmn(t&s|n&~s,e,t,o,r,i)}function md5_hh(e,t,n,s,o,r,i){return md5_cmn(t^n^s,e,t,o,r,i)}function md5_ii(e,t,n,s,o,r,i){return md5_cmn(n^(t|~s),e,t,o,r,i)}function md5_rol(e,t){return e<<t|e>>>32-t}
