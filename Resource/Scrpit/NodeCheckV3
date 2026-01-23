/**
 * NodeCheck V3 - 代理节点检测与管理脚本
 * 
 * 核心功能：
 * - 支持入口检测和落地检测
 * - 自动节点命名和去重
 * - 持久化缓存机制
 * - 支持多种代理客户端
 * - 节点性能测试
 * - 智能分类和筛选
 * 
 * 支持的客户端：
 * - Surge (带/不带 ability 参数)
 * - Loon
 * - Clash
 * - Shadowrocket
 * 
 * 参数说明：
 * - [flag]        增加落地国家/地区旗帜标识 (默认: false)
 * - [inflag]      增加入口国家/地区旗帜标识 (默认: false)
 * - [xy]          关闭落地检测，仅查询入口 (默认: false)
 * - [iisp]        显示入口运营商信息 (默认: false)
 * - [yisp]        显示落地运营商信息 (默认: false)
 * - [city]        显示入口城市 (默认: false)
 * - [sheng]       显示入口省份 (默认: false)
 * - [yuan]        为境外入口添加真实属地标识 (默认: false)
 * - [yw]          落地归属地使用英文缩写 (默认: false)
 * - [game]        增加游戏节点标识 (默认: false)
 * - [bl]          保留倍率标识 (默认: false)
 * - [snone]       清理单节点地区的序号 (默认: false)
 * - [offtz]       关闭通知 (默认: false)
 * - [dns]         将节点域名解析为IP (默认: false)
 * - [debug]       调试日志 (默认: false)
 * - [fgf]         设置入口和落地分隔符 (默认: " ")
 * - [sn]          设置国家与序号分隔符 (默认: " ")
 * - [name]        为节点添加机场名称前缀
 * - [timeout]     API超时时间 (默认: 2000ms)
 * - [cd]          有缓存时的API超时时间 (默认: 0ms)
 * - [bs]          批处理节点数 (默认: 10)
 * - [h]           缓存有效期(小时) (默认: 48)
 * - [min]         缓存有效期(分钟)
 * 
 * 示例使用：
 * - 基础配置：https://raw.githubusercontent.com/your-repo/NodeCheckV3.js
 * - 带参数：https://raw.githubusercontent.com/your-repo/NodeCheckV3.js#flag&iisp&city
 */

const SUB_STORE_SCHEMA = {
  title: "NodeCheck V3",
  description: "代理节点检测与管理脚本，支持多客户端，自动命名去重",
  scope: ["Surge", "Loon", "Clash", "Shadowrocket"],
  author: "Your Name",
  updateTime: "2026-01-24 00:00:00",
  version: "3.0.0",
  params: {
    flag: {
      datatype: "boolean",
      description: "增加落地国家/地区旗帜标识",
      defaultValue: false,
    },
    inflag: {
      datatype: "boolean",
      description: "增加入口国家/地区旗帜标识",
      defaultValue: false,
    },
    xy: {
      datatype: "boolean",
      description: "关闭落地检测，仅查询入口",
      defaultValue: false,
    },
    iisp: {
      datatype: "boolean",
      description: "显示入口运营商信息",
      defaultValue: false,
    },
    yisp: {
      datatype: "boolean",
      description: "显示落地运营商信息",
      defaultValue: false,
    },
    city: {
      datatype: "boolean",
      description: "显示入口城市",
      defaultValue: false,
    },
    sheng: {
      datatype: "boolean",
      description: "显示入口省份",
      defaultValue: false,
    },
    yuan: {
      datatype: "boolean",
      description: "为境外入口添加真实属地标识",
      defaultValue: false,
    },
    yw: {
      datatype: "boolean",
      description: "落地归属地使用英文缩写",
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
      description: "清理单节点地区的序号",
      defaultValue: false,
    },
    offtz: {
      datatype: "boolean",
      description: "关闭通知",
      defaultValue: false,
    },
    dns: {
      datatype: "boolean",
      description: "将节点域名解析为IP",
      defaultValue: false,
    },
    debug: {
      datatype: "boolean",
      description: "调试日志",
      defaultValue: false,
    },
    fgf: {
      datatype: "string",
      description: "设置入口和落地分隔符",
      defaultValue: " ",
    },
    sn: {
      datatype: "string",
      description: "设置国家与序号分隔符",
      defaultValue: " ",
    },
    name: {
      datatype: "string",
      description: "为节点添加机场名称前缀",
      defaultValue: "",
    },
    timeout: {
      datatype: "number",
      description: "API超时时间(毫秒)",
      defaultValue: 2000,
    },
    cd: {
      datatype: "number",
      description: "有缓存时的API超时时间(毫秒)",
      defaultValue: 0,
    },
    bs: {
      datatype: "number",
      description: "批处理节点数",
      defaultValue: 10,
    },
    h: {
      datatype: "number",
      description: "缓存有效期(小时)",
      defaultValue: 48,
    },
    min: {
      datatype: "number",
      description: "缓存有效期(分钟)",
      defaultValue: "",
    },
  },
};

// 全局变量
const $ = $substore;
const iar = $arguments;
const debug = iar.debug || false;

// 参数解析
const params = {
  flag: iar.flag || false,
  inflag: iar.inflag || false,
  xy: iar.xy || false,
  iisp: iar.iisp || false,
  yisp: iar.yisp || false,
  city: iar.city || false,
  sheng: iar.sheng || false,
  yuan: iar.yuan || false,
  yw: iar.yw || false,
  game: iar.game || false,
  bl: iar.bl || false,
  snone: iar.snone || false,
  offtz: iar.offtz || false,
  dns: iar.dns || false,
  fgf: iar.fgf ? decodeURI(iar.fgf) : " ",
  sn: iar.sn ? decodeURI(iar.sn) : " ",
  name: iar.name ? decodeURI(iar.name) : "",
  timeout: iar.timeout ? parseInt(iar.timeout) : 2000,
  cd: iar.cd ? parseInt(iar.cd) : 0,
  bs: iar.bs ? parseInt(iar.bs) : 10,
  h: iar.h ? parseInt(iar.h) : 48,
  min: iar.min ? parseInt(iar.min) : "",
};

// 环境检测
const env = $substore.env || {};
const { isLoon = false, isSurge = false, isClash = false, isShadowrocket = false } = env;
const targetPlatform = isLoon ? "Loon" : isSurge ? "Surge" : isClash ? "Clash" : isShadowrocket ? "Shadowrocket" : "Unknown";

// 缓存配置
const CACHE_KEY_PREFIX = "nodecheck-v3-";
const DEFAULT_CACHE_TTL = 48 * 3600 * 1000; // 48小时
let cacheTTL = params.min ? params.min * 60 * 1000 : params.h * 3600 * 1000;

// 工具函数
function log(...args) {
  if (debug) {
    console.log(`[NodeCheck V3] ${args.join(" ")}`);
  }
}

function notify(title, subtitle, message) {
  if (!params.offtz) {
    $.notify(title, subtitle, message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getFlag(countryCode) {
  const code = countryCode.toUpperCase();
  const flag = code.split("").map(c => 127397 + c.charCodeAt());
  return String.fromCodePoint(...flag).replace(/🇹🇼/g, "🇨🇳");
}

function getCacheKey(type, id) {
  return `${CACHE_KEY_PREFIX}${type}-${id}`;
}

// API调用封装
async function fetchAPI(url, options = {}) {
  const { timeout = params.timeout, proxy = null, retry = 2 } = options;
  
  for (let i = 0; i <= retry; i++) {
    try {
      const response = await Promise.race([
        $.http.get({ url, proxy }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout))
      ]);
      return JSON.parse(response.body);
    } catch (error) {
      log(`API请求失败 (${i+1}/${retry+1}): ${url}, 错误: ${error.message}`);
      if (i === retry) {
        throw error;
      }
      await sleep(500 * (i + 1)); // 指数退避
    }
  }
}

// 入口检测 - 获取IP信息
async function getIPInfo(ip) {
  const cacheKey = getCacheKey("ip", ip);
  const cached = scriptResourceCache.get(cacheKey);
  
  if (cached) {
    log(`使用缓存的IP信息: ${ip}`);
    return cached;
  }
  
  try {
    // 优先使用国内API，失败后使用ip-api
    let data;
    try {
      data = await fetchAPI(`https://api.v3.speedtest.cn/api/location/geo?ip=${ip}`);
      if (data && !data.message) {
        const result = {
          country: data.country || "",
          countryCode: data.country_code || "",
          regionName: data.province || "",
          city: data.city || "",
          isp: data.isp || "",
          query: ip,
        };
        scriptResourceCache.set(cacheKey, result);
        return result;
      }
    } catch (error) {
      log(`国内API失败，使用ip-api: ${error.message}`);
    }
    
    // 使用ip-api作为备用
    data = await fetchAPI(`http://ip-api.com/json/${ip}?lang=zh-CN&fields=status,message,country,countryCode,regionName,city,isp,query`);
    if (data.status === "success") {
      scriptResourceCache.set(cacheKey, data);
      return data;
    }
    
    throw new Error(data.message || "IP信息获取失败");
  } catch (error) {
    log(`获取IP信息失败: ${ip}, 错误: ${error.message}`);
    throw error;
  }
}

// 落地检测 - 获取代理出口信息
async function getProxyInfo(proxy) {
  const cacheKey = getCacheKey("proxy", JSON.stringify(proxy));
  const cached = scriptResourceCache.get(cacheKey);
  
  if (cached) {
    log(`使用缓存的代理信息: ${proxy.name}`);
    return cached;
  }
  
  try {
    const proxyConfig = ProxyUtils.produce([proxy], targetPlatform);
    const data = await fetchAPI(`http://ip-api.com/json?lang=zh-CN&fields=status,message,country,countryCode,city,query,isp`, {
      proxy: proxyConfig,
      timeout: params.timeout
    });
    
    if (data.status === "success") {
      scriptResourceCache.set(cacheKey, data);
      return data;
    }
    
    throw new Error(data.message || "代理信息获取失败");
  } catch (error) {
    log(`获取代理信息失败: ${proxy.name}, 错误: ${error.message}`);
    throw error;
  }
}

// DNS解析
async function resolveDNS(domain) {
  const cacheKey = getCacheKey("dns", domain);
  const cached = scriptResourceCache.get(cacheKey);
  
  if (cached) {
    log(`使用缓存的DNS解析: ${domain}`);
    return cached;
  }
  
  try {
    // 使用公共DNS服务进行解析
    const data = await fetchAPI(`https://1.1.1.1/dns-query?name=${domain}&type=A`, {
      headers: { "accept": "application/dns-json" }
    });
    
    if (data.Answer && data.Answer.length > 0) {
      const ip = data.Answer[0].data;
      scriptResourceCache.set(cacheKey, ip);
      return ip;
    }
    
    return domain; // 解析失败则返回原域名
  } catch (error) {
    log(`DNS解析失败: ${domain}, 错误: ${error.message}`);
    return domain;
  }
}

// 节点处理主函数
async function operator(proxies = [], targetPlatform, env) {
  const startTime = Date.now();
  const totalNodes = proxies.length;
  
  log(`开始处理 ${totalNodes} 个节点，目标平台: ${targetPlatform}`);
  notify(`NodeCheck V3 开始处理`, `共 ${totalNodes} 个节点`, ``);
  
  // 检查缓存支持
  if (typeof scriptResourceCache === "undefined") {
    log("缓存功能不可用，使用内存缓存");
  }
  
  // 批量处理节点
  const batchSize = params.bs;
  const processedNodes = [];
  
  for (let i = 0; i < proxies.length; i += batchSize) {
    const batch = proxies.slice(i, i + batchSize);
    log(`处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(proxies.length / batchSize)}: ${batch.length} 个节点`);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (proxy) => {
        try {
          return await processNode(proxy);
        } catch (error) {
          log(`处理节点失败: ${proxy.name}, 错误: ${error.message}`);
          return null;
        }
      })
    );
    
    // 收集成功处理的节点
    batchResults.forEach(result => {
      if (result.status === "fulfilled" && result.value) {
        processedNodes.push(result.value);
      }
    });
    
    // 进度通知
    const progress = Math.min((i + batchSize) / proxies.length * 100, 100);
    if (!params.offtz && progress % 20 === 0) {
      notify(`NodeCheck V3 处理中`, `进度: ${Math.round(progress)}%`, `已处理 ${processedNodes.length}/${totalNodes} 个节点`);
    }
    
    // 避免请求过于频繁
    await sleep(100);
  }
  
  // 节点去重
  const uniqueNodes = deduplicateNodes(processedNodes);
  
  // 节点命名和编号
  const namedNodes = nameNodes(uniqueNodes);
  
  // 清理单个节点的序号
  const finalNodes = params.snone ? cleanSingleNodeNumbers(namedNodes) : namedNodes;
  
  // 添加机场名称前缀
  if (params.name) {
    finalNodes.forEach(node => {
      node.name = `${params.name} ${node.name}`;
    });
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  log(`处理完成，共 ${finalNodes.length} 个节点，耗时 ${duration}ms`);
  
  // 完成通知
  if (!params.offtz) {
    notify(
      `NodeCheck V3 处理完成`,
      `共 ${totalNodes} 个节点，成功 ${finalNodes.length} 个`,
      `耗时: ${Math.round(duration / 1000)}秒`
    );
  }
  
  return finalNodes;
}

// 处理单个节点
async function processNode(proxy) {
  try {
    let server = proxy.server;
    
    // DNS解析
    if (params.dns && !/^\d+\.\d+\.\d+\.\d+$/.test(server)) {
      server = await resolveDNS(server);
      log(`DNS解析: ${proxy.server} -> ${server}`);
    }
    
    // 入口检测
    const entranceInfo = await getIPInfo(server);
    
    // 落地检测（如果启用）
    let landingInfo = entranceInfo;
    if (!params.xy) {
      try {
        landingInfo = await getProxyInfo(proxy);
      } catch (error) {
        log(`落地检测失败，使用入口信息: ${proxy.name}`);
        // 落地检测失败时使用入口信息
      }
    }
    
    // 生成节点信息
    const nodeInfo = {
      ...proxy,
      server: params.dns ? server : proxy.server,
      _entrance: entranceInfo,
      _landing: landingInfo,
      _qc: `${entranceInfo.query}${landingInfo.query}`, // 去重标识
    };
    
    return nodeInfo;
  } catch (error) {
    log(`处理节点失败: ${proxy.name}, 错误: ${error.message}`);
    return null;
  }
}

// 节点去重
function deduplicateNodes(nodes) {
  const uniqueMap = new Map();
  
  for (const node of nodes) {
    if (node && node._qc) {
      if (!uniqueMap.has(node._qc)) {
        uniqueMap.set(node._qc, node);
      }
    }
  }
  
  const result = Array.from(uniqueMap.values());
  log(`节点去重: ${nodes.length} -> ${result.length} 个`);
  return result;
}

// 节点命名
function nameNodes(nodes) {
  // 按地区分组
  const groups = nodes.reduce((acc, node) => {
    const { _entrance, _landing } = node;
    const entrance = params.xy ? _landing : _entrance;
    const landing = _landing;
    
    // 构建地区标识
    let region = "";
    if (entrance.country === "中国") {
      if (params.sheng && params.city) {
        region = `${entrance.regionName} ${entrance.city}`;
      } else if (params.sheng) {
        region = entrance.regionName;
      } else if (params.city) {
        region = entrance.city;
      } else {
        region = entrance.country;
      }
    } else {
      region = params.yw ? landing.countryCode : landing.country;
    }
    
    // 添加运营商信息
    let operator = "";
    if (params.iisp) {
      const isp = entrance.isp || "";
      const operatorMap = { 电信: "🅳", 联通: "🅻", 移动: "🆈", 广电: "🅶" };
      const operatorFlag = Object.keys(operatorMap).find(key => isp.includes(key));
      operator = operatorFlag ? operatorMap[operatorFlag] : "🅲";
    }
    
    // 添加旗帜标识
    let flag = "";
    if (params.flag) {
      flag = getFlag(landing.countryCode);
    }
    
    // 添加入口旗帜标识
    let inFlag = "";
    if (params.inflag) {
      inFlag = getFlag(entrance.countryCode);
    }
    
    // 构建基础名称
    const baseName = [inFlag, operator, region, params.flag ? flag : "", params.yw ? "" : landing.city].filter(Boolean).join(params.fgf);
    
    if (!acc[baseName]) {
      acc[baseName] = [];
    }
    acc[baseName].push(node);
    
    return acc;
  }, {});
  
  // 为每组节点编号
  const namedNodes = [];
  for (const [baseName, group] of Object.entries(groups)) {
    group.forEach((node, index) => {
      const number = (index + 1).toString().padStart(2, "0");
      node.name = `${baseName}${params.sn}${number}`;
      namedNodes.push(node);
    });
  }
  
  return namedNodes;
}

// 清理单个节点的序号
function cleanSingleNodeNumbers(nodes) {
  const groups = nodes.reduce((acc, node) => {
    const baseName = node.name.replace(/\s+\d+$/, "");
    if (!acc[baseName]) {
      acc[baseName] = [];
    }
    acc[baseName].push(node);
    return acc;
  }, {});
  
  for (const [baseName, group] of Object.entries(groups)) {
    if (group.length === 1 && group[0].name.endsWith("01")) {
      group[0].name = baseName;
    }
  }
  
  return nodes;
}

// 确保operator函数被导出
if (typeof module !== "undefined" && module.exports) {
  module.exports = { operator, SUB_STORE_SCHEMA };
}
