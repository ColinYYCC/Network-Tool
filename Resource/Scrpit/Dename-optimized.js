/**
 * @Sub-Store-Page
 * DENAME 接口查询去重/重命名 2026-01-22 01:05:00
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
 * - 2. 固定带 ability 参数版本,可能会爆内存, 如果需要使用指定节点功能 例如 [加国旗脚本或者DENAME脚本] 请使用此带 ability 参数版本: https://raw.githubusercontent.com/sub-store-org/Sub-Store/master/config/Surge-ability.sgmodule
 *
 * - 3. 固定不带 ability 参数版本：https://raw.githubusercontent.com/sub-store-org/Sub-Store/master/config/Surge-Noability.sgmodule
 *
 * - 参数必须以"#"开头，多个参数使用"&"连接，例如 https://github.com/Keywos/rule/raw/main/Dename.js#city&iisp&name=Name
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
  title: "DENAME",
  description: "根据接口返回的真实结果，重新对节点命名/去重。 如：入口/落地详细地区信息",
  scope: ["Surge", "Loon"],
  author: "@Key @奶茶姐 @小一 @可莉 @ColinYYCC",
  updateTime: "2026-01-22 01:05:00",
  version: "1.2.3",
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
    yuan: {
      datatype: "boolean",
      description: "为境外入口添加真实的入口属地标识",
      defaultValue: false,
    },
    sheng: {
      datatype: "boolean",
      description: "增加入口省份文字标识",
      defaultValue: false,
    },
    offtz: {
      datatype: "boolean",
      description: "关闭脚本通知",
      defaultValue: false,
    },
    game: {
      datatype: "boolean",
      description: "增加游戏节点标识",
      defaultValue: false,
    },
    yisp: {
      datatype: "boolean",
      description: "显示落地详细运营商名称",
      defaultValue: false,
    },
    yw: {
      datatype: "boolean",
      description: "落地归属地使用英文缩写标识",
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
    dnsjx: {
      datatype: "boolean",
      description: "将节点域名解析为IP",
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
    h: {
      datatype: "string",
      description: "节点缓存有效期，单位小时",
      defaultValue: "",
    },
    min: {
      datatype: "string",
      description: "节点缓存有效期，单位分钟",
      defaultValue: "",
    },
    timeout: {
      datatype: "number",
      description: "节点HTTP延时允许的最大超时参数，默认2000ms",
      defaultValue: 2000,
    },
    cd: {
      datatype: "number",
      description: "当有缓存时，再次处理之前判定为超时的节点",
      defaultValue: 0,
    },
    bs: {
      datatype: "number",
      description: "批处理节点数，建议10个左右",
      defaultValue: 9,
    },
    debug: {
      datatype: "boolean",
      description: "调试日志，普通用户不建议使用",
      defaultValue: false,
    },
  },
};

// 环境变量将在operator函数中获取

// 常量定义
const CONSTANTS = {
  EXPIRATION_KEY: "#sub-store-csr-expiration-time",
  DEFAULT_CACHE_TIME: 1728e5, // 48小时
  MAX_RETRY: 2,
  RANDOM_DELAY_MIN: 50,
  RANDOM_DELAY_MAX: 500,
  keyp: "3.s",
  keypr: "peed"
};

// API缓存计数
let apiRead = 0;
let apiWrite = 0;
let apiCount = 0;

// 日志记录函数
function log(logType, message) {
  console.log(`[DENAME] [${logType}] ${message}`);
}

// 生成随机延迟时间
function getRandomDelay() {
  return Math.floor(Math.random() * (CONSTANTS.RANDOM_DELAY_MAX - CONSTANTS.RANDOM_DELAY_MIN + 1) + CONSTANTS.RANDOM_DELAY_MIN);
}

// 睡眠函数
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 获取国旗emoji
function getFlag(countryCode) {
  const flagMap = {
    CN: "🇨🇳",
    US: "🇺🇸",
    JP: "🇯🇵",
    KR: "🇰🇷",
    SG: "🇸🇬",
    GB: "🇬🇧",
    DE: "🇩🇪",
    FR: "🇫🇷",
    AU: "🇦🇺",
    CA: "🇨🇦",
    IN: "🇮🇳",
    RU: "🇷🇺",
    BR: "🇧🇷",
    ID: "🇮🇩",
    TH: "🇹🇭",
    MY: "🇲🇾",
    VN: "🇻🇳",
    HK: "🇭🇰",
    TW: "🇹🇼"
  };
  return flagMap[countryCode] || "";
}

// 格式化时间
function formatTime(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60 * 1000) {
    return `${Math.round(ms / 1000)}秒`;
  } else if (ms < 60 * 60 * 1000) {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.round((ms % (60 * 1000)) / 1000);
    return `${minutes}分${seconds}秒`;
  } else {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}小时${minutes}分`;
  }
}

// 生成缓存键
function getCacheKey(prefix, value) {
  return `${prefix}-${MD5(value)}`;
}

// 带缓存的API请求
async function fetchApiWithCache(cacheKey, url, options = {}, cacheMap) {
  // 检查缓存
  if (cacheMap.has(cacheKey)) {
    apiRead++;
    return cacheMap.get(cacheKey);
  }

  try {
    // 发送请求
    const response = await $.http.get(url, options);
    let result = response.body;
    
    // 解析JSON
    if (typeof result === "string") {
      result = JSON.parse(result);
    }
    
    // 缓存结果
    cacheMap.set(cacheKey, result);
    apiWrite++;
    
    return result;
  } catch (error) {
    apiCount++;
    console.log(`[DENAME] [ERROR] API请求失败: ${url}, 错误: ${error.message}`);
    throw error;
  }
}

// 获取节点ID
function getNodeId(node) {
  return MD5(`${node.server}-${node.port}`);
}

// 获取落地IP信息
async function getOutboundIP(node, target, oaMap) {
  const cacheKey = getNodeId(node);
  const url = `http://ip-api.com/json?lang=zh-CN&fields=status,message,country,countryCode,city,query,isp`;
  const proxyConfig = typeof ProxyUtils !== 'undefined' ? ProxyUtils.produce([node], target) : node;
  
  return fetchApiWithCache(cacheKey, url, {
    node: proxyConfig,
    "policy-descriptor": proxyConfig
  }, oaMap);
}

// 域名解析
async function resolveDomain(domain, alMap) {
  // 检查是否已经是IP地址
  const isIP = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(domain);
  if (isIP) {
    return domain;
  }

  const cacheKey = getCacheKey("al", domain);
  const aliyunDNS = Math.random() < 0.5 ? '223.5.5.5' : '223.6.6.6';
  const url = `https://${aliyunDNS}/resolve?name=${domain}&type=A&short=1`;
  
  try {
    const result = await fetchApiWithCache(cacheKey, url, {}, alMap);
    return result.length > 0 ? result[0] : "keyn";
  } catch (error) {
    return "keyn";
  }
}

// 获取详细IP信息
async function getIPDetails(ip, config, spMap) {
  const cacheKey = getCacheKey("sc", ip);
  const url = `https://api-v${config.keyp}${config.keypr}.cn/ip?ip=${ip}`;
  
  const result = await fetchApiWithCache(cacheKey, url, {}, spMap);
  if (result.data) {
    const { country, province, city, isp, ip: ipAddr, countryCode } = result.data;
    return {
      country,
      regionName: province,
      city,
      isp,
      ip: ipAddr,
      countryCode
    };
  } else {
    throw new Error(result.message || "获取IP信息失败");
  }
}

// 获取入口IP信息
async function getInboundIP(server, iaMap) {
  const cacheKey = getCacheKey("in", server);
  const url = `http://ip-api.com/json/${server}?lang=zh-CN&fields=status,message,country,city,query,regionName,countryCode`;
  
  return fetchApiWithCache(cacheKey, url, {}, iaMap);
}

// 移除重复节点
function removeDuplicateNodes(nodes) {
  const uniqueKeys = new Set();
  const result = [];
  
  for (const node of nodes) {
    if (node.qc && !uniqueKeys.has(node.qc)) {
      uniqueKeys.add(node.qc);
      result.push(node);
    }
  }
  
  return result;
}

// 移除QC字段
function removeQCField(nodes) {
  const uniqueKeys = new Set();
  const result = [];
  
  for (const node of nodes) {
    if (!uniqueKeys.has(node.qc)) {
      uniqueKeys.add(node.qc);
      const { qc, ...rest } = node;
      result.push(rest);
    }
  }
  
  return result;
}

// 为节点添加序号
function addNodeNumbers(nodes, config) {
  const groupedNodes = nodes.reduce((acc, node) => {
    const existing = acc.find(item => item.name === node.name);
    if (existing) {
      existing.count++;
      existing.items.push({
        ...node,
        name: `${node.name}${config.sn}${existing.count.toString().padStart(2, "0")}`
      });
    } else {
      acc.push({
        name: node.name,
        count: 1,
        items: [{
          ...node,
          name: `${node.name}${config.sn}01`
        }]
      });
    }
    return acc;
  }, []);
  
  const result = groupedNodes.flatMap(item => item.items);
  nodes.splice(0, nodes.length, ...result);
  return nodes;
}

// 清理单个节点的序号
function cleanupSingleNodeNumbers(nodes) {
  const groupedNodes = nodes.reduce((acc, node) => {
    const baseName = node.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, "");
    if (!acc[baseName]) {
      acc[baseName] = [];
    }
    acc[baseName].push(node);
    return acc;
  }, {});
  
  for (const key in groupedNodes) {
    if (groupedNodes[key].length === 1 && groupedNodes[key][0].name.endsWith("01")) {
      groupedNodes[key][0].name = groupedNodes[key][0].name.replace(/[^.]01/, "");
    }
  }
  
  return Object.values(groupedNodes).flat();
}

async function processNode(node, config, features, cacheMaps, target) {
  try {
    let { server } = node;
    let landingInfo = "", inQcip = "",倍率Info = "", flag = "", gameFlag = "", isp = "", ispFlag = "", province = "", city = "", directFlag = "", landingIsp = "";
    let isCN = false, isV4 = false, isV6 = false, isNoAli = false;
    
    // 域名解析
    if (features.dns && !features.xy) {
      server = await resolveDomain(server, cacheMaps.al);
    }
    
    node.server = server;
    let resolvedServer = server;
    
    // 检查解析结果
    if (resolvedServer === "keyn") {
      isNoAli = true;
      resolvedServer = server;
    } else {
      node.keyrk = resolvedServer;
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(resolvedServer)) {
        isV4 = true;
      } else if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(resolvedServer)) {
        isV6 = true;
      }
    }
    
    let isDirect = true, landingCountryCode = "", landingQuery = "";
    
    // 获取落地IP信息
    if (!features.xy || features.yisp || features.yw || features.flag) {
      try {
        const outboundIP = await getOutboundIP(node, target, cacheMaps.oa);
        const { country: outCountry, countryCode: outCode, city: outCity, query: outQuery, isp: outIsp } = outboundIP;
        
        if (features.yisp) {
          landingIsp = config.fgfs + outIsp;
        }
        
        if (config.debug) {
          console.log(`[DENAME] [DEBUG] 落地信息: ${JSON.stringify(outboundIP)}`);
        }
        
        landingCountryCode = outCode;
        landingQuery = outQuery;
        landingInfo = (outCountry === "中国") ? outCity : (features.yw ? outCode : outCountry);
        isDirect = outQuery !== resolvedServer;
      } catch (error) {
        console.log(`[DENAME] [DEBUG] 获取落地IP信息失败: ${error.message}`);
      }
    }
    
    // 获取入口IP信息
    if (isDirect || features.xy) {
      if (!isNoAli || isV4) {
        try {
          const ipDetails = await getIPDetails(resolvedServer, config, cacheMaps.sp);
          const { country: inCountry, regionName: inProvince, city: inCity, isp: inIsp, countryCode: inCode } = ipDetails;
          
          if (features.inflag) {
            flag = getFlag(inCode);
          }
          
          if (config.debug) {
            console.log(`[DENAME] [DEBUG] 国内入口信息: ${JSON.stringify(ipDetails)}`);
          }
          
          isCN = inCountry === "中国";
          inQcip = resolvedServer;
          
          const ispMap = {电信: "🅳", 联通: "🅻", 移动: "🆈", 广电: "🅶"};
          isp = inIsp;
          ispFlag = ispMap[inIsp] || "🅲";
          
          province = inProvince;
          city = inCity;
        } catch (error) {
          console.log(`[DENAME] [DEBUG] 获取入口IP信息失败: ${error.message}`);
        }
      }
    }
    
    // 处理游戏节点标识
    if (features.game && isCN) {
      gameFlag = "🎮";
    }
    
    // 处理直连标识
    if (isDirect) {
      directFlag = "🆉";
    }
    
    // 构建节点名称
    let nodeName = "";
    
    if (isCN || features.yuan) {
      nodeName += `${features.inflag ? flag : ""}${features.iisp ? ispFlag : ""}${features.sheng ? province : ""}${features.city ? city : ""}${features.yisp ? landingIsp : ""}${features.fgf ? config.fgf : ""}`;
    } else {
      nodeName += `${features.inflag ? flag : ""}[境外]${features.fgf ? config.fgf : ""}`;
    }
    
    nodeName += `${features.flag ? getFlag(landingCountryCode) : ""}${landingInfo}${features.bl ? 倍率Info : ""}${gameFlag}`;
    
    // 添加机场名称前缀
    if (config.firstN) {
      nodeName = `${config.firstN}${nodeName}`;
    }
    
    // 更新节点名称
    node.name = nodeName;
    
    return node;
  } catch (error) {
    console.log(`[DENAME] [ERROR] 处理节点失败: ${node.server}, 错误: ${error.message}`);
    return node; // 返回原始节点，避免整个批处理失败
  }
}

/**
 * 处理节点列表
 * @param {Array<Object>} nodes - 节点列表
 * @param {string} tzname - 订阅名称
 * @param {string} subcoll - 订阅类型
 * @param {number} totalNodes - 总节点数
 * @param {number} batchSize - 批处理大小
 * @param {boolean} useCache - 是否使用缓存
 * @param {Object} config - 配置参数
 * @param {Object} features - 功能开关
 * @param {Object} cacheMaps - 缓存映射
 * @param {string} target - 目标平台
 * @returns {Promise<Array<Object>>} 处理后的节点列表
 */
async function processNodes(nodes, tzname, subcoll, totalNodes, batchSize, useCache, config, features, cacheMaps, target) {
  const processedNodes = [];
  const landingIps = [];
  
  // 日志记录函数
  const log = (logType, message) => {
    if (config.debug) {
      console.log(`[DENAME] [${logType}] ${message}`);
    }
  };
  
  // 生成随机延迟时间
  const getRandomDelay = () => {
    return Math.floor(Math.random() * (config.RANDOM_DELAY_MAX - config.RANDOM_DELAY_MIN + 1) + config.RANDOM_DELAY_MIN);
  };
  
  // 睡眠函数
  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(async (node) => {
        try {
          const processedNode = await processNode(node, config, features, cacheMaps, target);
          // 添加qc属性以便去重
          if (!processedNode.qc) {
            processedNode.qc = `${processedNode.server}-${processedNode.port}`;
          }
          if (processedNode.qc) {
            landingIps.push(processedNode.qc.charAt(processedNode.qc.length - 1));
          }
          return processedNode;
        } catch (error) {
          log("ERROR", `处理节点失败: ${node.server}, 错误: ${error.message}`);
          return null;
        }
      })
    );
    
    const validNodes = batchResults.filter(node => node !== null);
    processedNodes.push(...validNodes);
    
    // 随机延迟，避免API请求过快
    await sleep(getRandomDelay());
  }
  
  return {
    processedNodes,
    landingIps
  };
}

/**
 * 主函数
 * @param {Array<Object>} nodes - 节点列表
 * @param {string} targetPlatform - 目标平台
 * @param {Object} env - 环境变量
 * @returns {Array<Object>} 处理后的节点列表
 */
async function operator(nodes = [], targetPlatform, env) {
  // 获取全局变量
  const $ = typeof $substore !== 'undefined' ? $substore : {
    http: { get: async () => ({ body: '{}' }) },
    write: () => {},
    read: () => null,
    notify: () => {}
  };
  
  // 环境变量
  const isLoon = env ? env.isLoon : false;
  const isSurge = env ? env.isSurge : false;
  const target = isLoon ? "Loon" : isSurge ? "Surge" : undefined;
  
  // 获取参数
  const scriptArgs = typeof $arguments !== 'undefined' ? $arguments : {};
  const args = scriptArgs;
  
  // 配置参数
  const config = {
    debug: args.debug || false,
    fgf: args.fgf ? decodeURI(args.fgf) : " ",
    fgfs: args.fgf ? decodeURI(args.fgf) : " ",
    h: args.h ? decodeURI(args.h) : "",
    min: args.min ? decodeURI(args.min) : "",
    firstN: args.name ? decodeURI(args.name) : "",
    sn: args.sn ? decodeURI(args.sn) : " ",
    cd: args.cd || 0,
    timeout: args.timeout || 2000,
    bs: args.bs || 9,
    keyp: CONSTANTS.keyp,
    keypr: CONSTANTS.keypr,
    EXPIRATION_KEY: CONSTANTS.EXPIRATION_KEY,
    DEFAULT_CACHE_TIME: CONSTANTS.DEFAULT_CACHE_TIME,
    MAX_RETRY: CONSTANTS.MAX_RETRY,
    MAX_TIMEOUT: 460,
    RANDOM_DELAY_MIN: CONSTANTS.RANDOM_DELAY_MIN,
    RANDOM_DELAY_MAX: CONSTANTS.RANDOM_DELAY_MAX
  };
  
  // 功能开关
  const features = {
    yw: args.yw,
    bl: args.bl,
    iisp: args.iisp,
    xy: args.xy,
    yisp: args.yisp,
    yuan: args.yuan,
    city: args.city,
    flag: args.flag,
    inflag: args.inflag,
    game: args.game,
    sheng: args.sheng,
    offtz: args.offtz,
    numone: args.snone,
    dns: args.dnsjx
  };
  
  // 初始化缓存
  let useCache = true;
  let cacheTime = config.DEFAULT_CACHE_TIME;
  let TIMEDKEY = cacheTime;
  let cacheExpireTime = "";
  
  // API缓存映射
  const spMap = new Map();
  const alMap = new Map();
  const iaMap = new Map();
  const oaMap = new Map();
  
  // 检查是否需要自定义缓存时间
  const useCustomCacheTime = config.h !== "" || config.min !== "";
  if (useCustomCacheTime) {
    cacheTime = config.h ? parseInt(config.h, 10) * 36e5 : parseInt(config.min, 10) * 6e4;
    TIMEDKEY = cacheTime;
    
    // 写入缓存时间
    $.write(JSON.stringify(cacheTime), config.EXPIRATION_KEY);
  } else {
    // 读取缓存时间
    const cacheTimeStr = $.read(config.EXPIRATION_KEY);
    if (cacheTimeStr) {
      TIMEDKEY = parseInt(cacheTimeStr, 10);
    }
  }
  
  const startTime = new Date();
  const currentTime = startTime.getTime();
  
  // 读取缓存
  const cacheMap = {
    sp: spMap,
    al: alMap,
    ia: iaMap,
    oa: oaMap
  };
  
  let subcoll = args.name ? decodeURI(args.name) : "", tzname = "";
  
  // 处理订阅信息
  if (env && env.subInfo && env.subInfo.title) {
    tzname = env.subInfo.title;
  }
  
  // 检查缓存过期时间
  const cacheExpirationTime = $.read(config.EXPIRATION_KEY);
  if (cacheExpirationTime) {
    const expireTime = parseInt(cacheExpirationTime, 10);
    const remainingTime = expireTime - currentTime;
    if (remainingTime > 0) {
      cacheExpireTime = formatTime(remainingTime);
    }
  }
  
  // 检查是否需要重新生成缓存
  if (useCustomCacheTime) {
    cacheExpireTime = formatTime(cacheTime);
  } else if (target === "Loon") {
    const loonCacheMap = {
      "1分钟": 6e4, "5分钟": 3e5, "10分钟": 6e5, "30分钟": 18e5,
      "1小时": 36e5, "2小时": 72e5, "3小时": 108e5, "6小时": 216e5,
      "12小时": 432e5, "24小时": 864e5, "48小时": 1728e5, "72小时": 2592e5,
      "参数传入": "innums"
    };
    
    const loonCacheSetting = $.read("#节点缓存有效期");
    let loonCacheTime = loonCacheMap[loonCacheSetting] || 1728e5;
    
    if (loonCacheTime === "innums") {
      loonCacheTime = cacheTime;
    }
    
    cacheExpireTime = formatTime(parseInt(cacheExpirationTime, 10) - currentTime + parseInt(loonCacheTime, 10));
  } else if (target === "Surge" && useCustomCacheTime) {
    cacheExpireTime = formatTime(parseInt(cacheExpirationTime, 10) - currentTime + parseInt(cacheTime, 10));
  } else {
    cacheExpireTime = formatTime(parseInt(cacheExpirationTime, 10) - currentTime + parseInt(TIMEDKEY, 10));
  }
  
  // 发送开始处理通知
  if (!useCache && !features.offtz) {
    $.notify(subcoll + tzname, `开始处理节点: ${nodes.length} 个 批处理数量: ${config.bs} 个`, "请等待处理完毕后再次点击预览");
  }
  
  // 处理节点
  let retryCount = 0;
  let breakFlag = false;
  let processedNodes = [];
  let landingIps = [];
  
  // 缓存映射
  const cacheMaps = {
    sp: spMap,
    al: alMap,
    ia: iaMap,
    oa: oaMap
  };
  
  do {
    try {
      const result = await processNodes(nodes, tzname, subcoll, nodes.length, config.bs, useCache, config, features, cacheMaps, target);
      processedNodes = result.processedNodes;
      landingIps = result.landingIps;
      break;
    } catch (error) {
      console.log(`[DENAME] [ERROR] 处理节点失败: ${error.message}`);
      if (apiCount >= 1) {
        retryCount++;
        breakFlag = true;
      }
    }
  } while (retryCount < 2);
  
  // 去重处理
  if (!features.xy) {
    processedNodes = removeDuplicateNodes(processedNodes);
  }
  
  const finalNodeCount = processedNodes.length;
  
  // 检查Surge平台落地IP是否相同
  if (finalNodeCount > 3 && isSurge) {
    const allSame = landingIps.every((value, index, arr) => value === arr[0]);
    if (allSame) {
      if (config.debug) {
        console.log(`[DENAME] [DEBUG] 未使用带指定节点功能的 SubStore, 或所有节点落地IP相同`);
      }
      $.notify('DENAME：点击以安装对应版本', '未使用带指定节点功能的 SubStore，或所有节点落地IP相同', '', {
        url: "https://raw.githubusercontent.com/sub-store-org/Sub-Store/master/config/Surge-ability.sgmodule"
      });
    }
  }
  
  // 重试逻辑
  if (apiCount >= 1) {
    retryCount++;
    config.timeout = config.DEFAULT_CACHE_TIME;
    useCache = false;
    
    // 清空缓存映射
    spMap.clear();
    alMap.clear();
    iaMap.clear();
    oaMap.clear();
    
    if (config.debug) {
      console.log(`[DENAME] [DEBUG] 重试中...`);
    }
  } else {
    retryCount = 2;
  }
  
  // 移除QC字段
  if (!features.xy) {
    processedNodes = removeQCField(processedNodes);
  }
  
  // 为节点添加序号
  processedNodes = addNodeNumbers(processedNodes, config);
  
  // 清理单个节点的序号
  if (features.numone) {
    processedNodes = cleanupSingleNodeNumbers(processedNodes);
  }
  
  const endTime = new Date();
  const totalTime = endTime.getTime() - startTime.getTime();
  
  // 输出处理结果
  if (features.dns) {
    if (config.debug) {
      console.log(`[DENAME] [DEBUG] dns解析后共: ${finalNodeCount} 个`);
    }
  }
  
  if (apiRead > 0) {
    if (config.debug) {
      console.log(`[DENAME] [DEBUG] 读取api缓存: ${apiRead} 个`);
    }
  }
  
  if (apiWrite > 0) {
    if (config.debug) {
      console.log(`[DENAME] [DEBUG] 写入api缓存: ${apiWrite} 个`);
    }
  }
  
  if (config.debug) {
    console.log(`[DENAME] [DEBUG] 处理完后剩余: ${finalNodeCount} 个`);
  }
  
  // 输出缓存过期时间
  if (isLoon) {
    const loonCacheSetting = $.read("#节点缓存有效期");
    if (config.debug) {
      console.log(`[DENAME] [DEBUG] 缓存过期时间: ${loonCacheSetting}, 还剩 ${cacheExpireTime.replace(/,|\n/g, "")}`);
    }
  } else {
    if (config.debug) {
      console.log(`[DENAME] [DEBUG] 缓存过期时间: ${formatTime(TIMEDKEY)}, 还剩 ${cacheExpireTime.replace(/,|\n/g, "")}`);
    }
  }
  
  if (config.debug) {
    console.log(`[DENAME] [DEBUG] 此方法总用时: ${formatTime(totalTime)}\n----For New DENAME----\n\n\n\n\n`);
  }
  
  // 发送完成通知
  const readLog = apiRead ? `读取缓存:${apiRead} ` : "";
  const writeLog = apiWrite ? `写入缓存:${apiWrite}, ` : "";
  const resultMsg = (finalNodeCount === nodes.length && finalNodeCount === 0) ? "" : 
                    (finalNodeCount === nodes.length ? "全部通过测试, " : `去除无效节点后有${finalNodeCount}个, `);
  
  if (!features.offtz) {
    $.notify(
      `${subcoll}${tzname} 共${nodes.length}个节点`,
      "",
      `${writeLog}${readLog}${cacheExpireTime ? `, ${cacheExpireTime}后过期 ` : ""}${resultMsg}用时:${formatTime(totalTime)}`
    );
  }
  
  return processedNodes;
}

// MD5加密函数 (简化版，仅用于生成缓存键)
function MD5(str) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(str).digest('hex');
}

// 导出主函数
module.exports = {
  operator: operator
};
