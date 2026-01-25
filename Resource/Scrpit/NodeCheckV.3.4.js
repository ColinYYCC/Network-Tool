/**
 * @Sub-Store-Page
 * CNAME 接口查询去重/重命名 2026-01-25
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
  updateTime: "2026-01-25 18:00:00",
  version: "4.0.0",
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
let innum = 1728e5, onen = false, Sue = false, rawtime = 1500;
const keyp = "3.s", EXPIRATION_KEY = "#sub-store-csr-expiration-time";

// 只有当用户明确指定了h或min参数时，才更新缓存有效期
if (min !== "") {
  Sue = true;
  innum = parseInt(min, 10) * 6e4;
  $.write(JSON.stringify(innum), EXPIRATION_KEY);
} else if (h !== "") {
  Sue = true;
  innum = parseInt(h, 10) * 36e5;
  $.write(JSON.stringify(innum), EXPIRATION_KEY);
}

// 读取缓存有效期，不覆盖用户之前的设置
let TIMEDKEY = $.read(EXPIRATION_KEY);
// 如果缓存有效期不存在，设置默认值
if (!TIMEDKEY) {
  TIMEDKEY = JSON.stringify(innum);
  $.write(TIMEDKEY, EXPIRATION_KEY);
}
let inapi = 0;

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

// V2版本缓存机制
let apiRead = 0, apiw = 0;
const oaMap = new Map();
const alMap = new Map();
const spMap = new Map();
const iaMap = new Map();

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
  
  // V2版本重试逻辑
  let retryi = 0;
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
    
    // V2版本去重逻辑
    !xy && (e = removels(e));
    
    // 处理重试
      if (inapi >= 1 && retryi < CONFIG.RETRY_MAX) {
        retryi++;
        timeout = rawtime;
        onen = false;
        // V2版本重试时清空所有Map缓存
        spMap.clear();
        alMap.clear();
        iaMap.clear();
        oaMap.clear();
        klog(`重试中... 第 ${retryi} 次`);
      } else {
        retryi = CONFIG.RETRY_MAX;
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
  apiRead > 0 && klog(`读取api缓存: ${apiRead} 个`);
  apiw > 0 && klog(`写入api缓存: ${apiw} 个`);
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
  const readklog = apiRead ? `读取缓存:${apiRead} ` : "";
  const writeklog = apiw ? `写入缓存:${apiw}, ` : "";
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
    // 更宽松的IPv4和IPv6正则表达式
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(inServer)) {
      v4 = true;
    } else if (/^([0-9a-fA-F]{0,4}:){0,7}[0-9a-fA-F]{0,4}$/.test(inServer)) {
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
  
  // V2版本节点验证 - 宽松验证
  pk.qc = inQcip + outips;
  
  return pk;
}

// 工具函数
function getid(e) { return FNV1a(`${e.server}-${e.port}-${e.type}`); }
function getaliid(e) { return FNV1a(`${CONFIG.CACHE_KEY_PREFIX.ALI}-${e}`); }
function getspcn(e) { return FNV1a(`${CONFIG.CACHE_KEY_PREFIX.SP}-${e}`); }
function getinid(e) { return FNV1a(`${CONFIG.CACHE_KEY_PREFIX.IN}-${e}`); }
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

// V2版本 - 落地IP查询
async function OUTIA(e) {
  const t = getid(e);
  if (oaMap.has(t)) return oaMap.get(t);
  const cached = scriptResourceCache.get(t);
  if (cached) {
    apiRead++;
    return cached;
  } else {
    inapi++;
  }
  const maxRE = 2;
  const url = `http://ip-api.com/json?lang=zh-CN&fields=status,message,country,countryCode,city,query,isp`;
  const getHttp = async (reTry) => {
    try {
      let r = ProxyUtils.produce([e], target);
      const response = await Promise.race([
        $.http.get({ url: url, node: r, "policy-descriptor": r }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout-OUTIA")), timeout) ),
      ]);
      const data = JSON.parse(response.body);
      if (data.status === "success") {
        scriptResourceCache.set(t, data);
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      if (reTry < maxRE) {
        await sleep(GRa());
        delog(e.name + "-> [outipApi超时查询次数] " + reTry);
        return getHttp(reTry + 1);
      } else {
        throw error;
      }
    }
  };
  const resGet = new Promise((resolve, reject) => {
    if (cd < 1 && onen) {
      // 当有缓存且不需要重新测试时，直接resolve
      resolve(scriptResourceCache.get(t));
      return;
    }
    getHttp(1)
      .then((data) => {
        apiw++;
        resolve(data);
      })
      .catch(reject);
  });
  oaMap.set(t, resGet);
  return resGet;
}

// V2版本 - 域名解析
async function AliD(e) {
  const ti = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(
    e
  );
  if (ti) return e;
  const t = getaliid(e);
  if (alMap.has(t)) return alMap.get(t);
  const cached = scriptResourceCache.get(t);
  if (cached) {
    apiRead++;
    return cached;
  } else {
    inapi++;
  }
  const maxRE = 2;
  let alip = Math.random() < 0.5 ? '223.5.5.5' : '223.6.6.6';
  const url = `https://${alip}/resolve?name=${e}&type=A&short=1`;
  const getHttp = async (reTry) => {
    try {
      const response = await Promise.race([
        $.http.get({ url: url }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout-AliD")), timeout) ),
      ]);
      const resdata = JSON.parse(response.body);
      if (resdata.length > 0) {
        scriptResourceCache.set(t, resdata[0]);
        return resdata[0];
      } else {
        return "keyn";
      }
    } catch (error) {
      if (reTry < maxRE) {
        await sleep(GRa());
        delog(e + " [->Ali超时查询次数] " + reTry);
        return getHttp(reTry + 1);
      } else {
        throw error;
      }
    }
  };
  const resGet = new Promise((resolve, reject) => {
    if (cd < 1 && onen) {
      // 当有缓存且不需要重新测试时，直接resolve
      resolve(scriptResourceCache.get(t));
      return;
    }
    getHttp(1)
      .then((data) => {
        resolve(data);
      })
      .catch(reject);
  });
  alMap.set(t, resGet);
  return resGet;
}

// V2版本 - 国内入口IP查询
async function SPEC(e) {
  const n = getspcn(e);
  if (spMap.has(n)) return spMap.get(n);
  const cached = scriptResourceCache.get(n);
  if (cached) {
    apiRead++;
    return cached;
  } else {
    inapi++;
  }
  const maxRE = 2;
  const url = `https://api-v${keyp}${keypr}.cn/ip?ip=${e}`;
  const getHttp = async (reTry) => {
    try {
      const response = await Promise.race([
        $.http.get({ url: url }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout-SPEC")), timeout) ),
      ]);
      const resdata = JSON.parse(response.body);
      delog(resdata);
      if (resdata.data) {
        const { country: e, province: o, city: r, isp: i, ip: c, countryCode: k, } = resdata.data;
        const a = { country: e, regionName: o, city: r, isp: i, ip: c, countryCode: k, };
        delog("写入");
        scriptResourceCache.set(n, a);
        return a;
      } else {
        throw new Error(resdata.message);
      }
    } catch (error) {
      if (reTry < maxRE) {
        await sleep(GRa());
        delog(e + "-> [SP超时查询次数] " + reTry);
        return getHttp(reTry + 1);
      } else {
        throw error;
      }
    }
  };
  const resGet = new Promise((resolve, reject) => {
    if (cd < 1 && onen) return resGet;
    getHttp(1)
      .then((data) => {
        resolve(data);
      })
      .catch(reject);
  });
  spMap.set(n, resGet);
  return resGet;
}

// V2版本 - 国外入口IP查询
async function INIA(e) {
  const t = getinid(e);
  if (iaMap.has(t)) return iaMap.get(t);
  const cached = scriptResourceCache.get(t);
  if (cached) {
    apiRead++;
    return cached;
  } else {
    inapi++;
  }
  const maxRE = 2;
  const url = `http://ip-api.com/json/${e}?lang=zh-CN&fields=status,message,country,city,query,regionName,countryCode`;
  const getHttp = async (reTry) => {
    try {
      delog(url);
      const response = await Promise.race([
        $.http.get({ url: url }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout-INIA")), timeout) ),
      ]);
      const data = JSON.parse(response.body);
      if (data.status === "success") {
        scriptResourceCache.set(t, data);
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      if (reTry < maxRE) {
        await sleep(GRa());
        delog(e + "-> [inipApi超时查询次数] " + reTry);
        return getHttp(reTry + 1);
      } else {
        throw error;
      }
    }
  };
  const resGet = new Promise((resolve, reject) => {
    if (cd < 1 && onen) return resGet;
    getHttp(1)
      .then((data) => {
        resolve(data);
      })
      .catch(reject);
  });
  iaMap.set(t, resGet);
  return resGet;
}

// V2版本 - 节点去重函数
function removels(e) {
  const t = new Set();
  const n = [];
  for (const s of e) {
    // 确保qc存在且不为空字符串，或者使用节点自身作为去重依据
    const qcValue = s.qc || `${s.server}-${s.port}-${s.type}`;
    if (!t.has(qcValue)) {
      t.add(qcValue);
      n.push(s);
    }
  }
  return n;
}

function removeqc(e) {
  const t = new Set();
  const n = [];
  for (const s of e) {
    // 确保qc存在且不为空字符串，或者使用节点自身作为去重依据
    const qcValue = s.qc || `${s.server}-${s.port}-${s.type}`;
    if (!t.has(qcValue)) {
      t.add(qcValue);
      const clone = { ...s };
      delete clone.qc;
      n.push(clone);
    }
  }
  return n;
}

// 节点重新编号
function jxh(e) {
  const t = e.reduce((acc, curr) => {
    // 移除名称末尾的数字编号，保留其他内容
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
    // 移除名称末尾的数字编号，保留其他内容
    const key = curr.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, "");
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, {});
  
  for (const key in t) {
    if (t[key].length === 1 && t[key][0].name.endsWith("01")) {
      // 清理末尾的 "01" 序号
      t[key][0].name = t[key][0].name.replace(/01$/, "");
    }
  }
  
  // 确保返回的是扁平数组
  return Object.values(t).flat();
}

// FNV-1a 函数 - 替代 MD5，性能提升约4倍
function FNV1a(str) {
    let hash = 0x811c9dc5;
    const prime = 0x01000193;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, prime);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}
