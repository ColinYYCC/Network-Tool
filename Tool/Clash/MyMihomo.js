function main(params) {
    if (!params.proxies && !params["proxy-providers"]) return params;

    overwriteBasicOptions(params);
    overwriteDns(params);
    overwriteTunnel(params);
    overwriteProxyGroups(params);
    overwriteRuleProviders(params);
    overwriteRules(params);

    return params;
}

// 覆寫 Basic Options
function overwriteBasicOptions(params) {
    const config = {
        "mode": "rule",
        "mixed-port": 7897,
        "allow-lan": true,
        "ipv6": true,
        "log-level": "warning",
        "unified-delay": true,
        "tcp-concurrent": true,
        "find-process-mode": "always",
        "global-client-fingerprint": "chrome",
        "external-controller": "0.0.0.0:9988",
        "secret": "colinyycc",
        "profile": {
            "store-selected": true,
            "store-fake-ip": true
        },
        "sniffer": {
            "enable": true,
            "sniff": {
                "HTTP": { "ports": [80, "8080-8880"], "override-destination": true },
                "TLS": { "ports": [443, 8443] },
                "QUIC": { "ports": [443, 8443] }
            },
            "skip-domain": ["Mijia Cloud", "+.push.apple.com"]
        }
    };
    Object.assign(params, config);
}

// 覆寫 DNS
function overwriteDns(params) {
    params.dns = {
        "enable": true,
        "ipv6": true,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "default-nameserver": ["119.29.29.29", "180.184.1.1", "223.5.5.5"],
        "nameserver": [
            "https://dns.quad9.net/dns-query",
            "https://doh.pub/dns-query",
            "https://dns.alidns.com"
        ],
        "fake-ip-filter": [
            "*.127.*.*.*.nip.io", "*.127.*.*.*.sslip.io", "*.srv.nintendo.net",
            "*.stun.playstation.net", "*.stun.twilio.com", "*.turn.twilio.com",
            "*.xboxlive.com", "*-127-*-*-*.nip.io", "*-127-*-*-*.sslip.io",
            "+.bogon", "+.internal", "+.lan", "+.local", "+.localdomain", "+.m2m",
            "127-*-*-*.nip.io", "127-*-*-*.sslip.io", "127.*.*.*.nip.io",
            "127.*.*.*.sslip.io", "127.0.0.1.sslip.io", "127.atlas.skk.moe",
            "dns.msftncsi.com", "home.arpa", "injections.adguard.org",
            "local.adguard.org", "stun.*", "stun.syncthing.net", "xbox.*.microsoft.com"
        ]
    };
}

// 覆寫 Tunnel
function overwriteTunnel(params) {
    params.tun = {
        "enable": true,
        "stack": "system",
        "dns-hijack": ["any:53", "tcp://any:53"],
        "auto-route": true,
        "auto-redirect": true,
        "auto-detect-interface": true,
        "strict-route": true,
        "mtu": 1500
    };
}

// 覆寫代理組
function overwriteProxyGroups(params) {
    const allProxies = params.proxies ? params.proxies.map(p => p.name) : [];
    
    // 正則定義
    const filterAL = /^(?!.*(?:(?:群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持)|(?i:\b(?:USE|USED|TOTAL|EXPIRE|EMAIL|Panel)\b)|[\p{Han}]\.com)).*$/u;
    const filterHK = /^(?=.*(香港|HK|Hong|🇭🇰))^(?!.*(网站|地址|剩余|过期|时间|有效|网址|禁止|邮箱|发布|客服|订阅|节点)).*$/;
    const filterJP = /^(?=.*(日本|JP|Japan|🇯🇵))^(?!.*(网站|地址|剩余|过期|时间|有效|网址|禁止|邮箱|发布|客服|订阅|节点)).*$/;
    const filterKR = /^(?=.*(韩国|韓|KR|Korea|🇰🇷))^(?!.*(网站|地址|剩余|过期|时间|有效|网址|禁止|邮箱|发布|客服|订阅|节点)).*$/;
    const filterSG = /^(?=.*(新加坡|狮城|SG|Singapore|🇸🇬))^(?!.*(网站|地址|剩余|过期|时间|有效|网址|禁止|邮箱|发布|客服|订阅|节点)).*$/;
    const filterUS = /^(?=.*(美国|US|United States|America|🇺🇸))^(?!.*(网站|地址|剩余|过期|时间|有效|网址|禁止|邮箱|发布|客服|订阅|节点)).*$/;
    const filterUK = /^(?=.*(英国|UK|United Kingdom|🇬🇧))^(?!.*(网站|地址|剩余|过期|时间|有效|网址|禁止|邮箱|发布|客服|订阅|节点)).*$/;
    const filterFR = /^(?=.*(法国|FR|France|🇫🇷))^(?!.*(网站|地址|剩余|过期|时间|有效|网址|禁止|邮箱|发布|客服|订阅|节点)).*$/;
    const filterDE = /^(?=.*(德国|DE|Germany|🇩🇪))^(?!.*(网站|地址|剩余|过期|时间|有效|网址|禁止|邮箱|发布|客服|订阅|节点)).*$/;
    const filterTW = /^(?=.*(台湾|TW|Taiwan|Wan|🇹🇼|🇨🇳))^(?!.*(网站|地址|剩余|过期|时间|有效|网址|禁止|邮箱|发布|客服|订阅|节点)).*$/;

    const getMatch = (re) => {
        const matched = allProxies.filter(name => re.test(name));
        return matched.length > 0 ? matched : ["DIRECT"];
    };

    const commonSelect = ["🔯 故障转移", "🛰️ 自动選擇", "🔮 负载均衡", "香港节点", "台湾节点", "日本节点", "韩国节点", "狮城节点", "美国节点", "DIRECT"];

    params["proxy-groups"] = [
        { name: "🛰️ 自动選擇", type: "url-test", proxies: getMatch(filterAL), url: "https://networkcheck.kde.org", interval: 300, icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/quanqiu(3).png" },
        { name: "🔯 故障转移", type: "fallback", proxies: getMatch(filterAL), url: "https://networkcheck.kde.org", interval: 300, icon: "https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/apps/select.png" },
        { name: "🔮 负载均衡", type: "load-balance", proxies: getMatch(filterAL), strategy: "consistent-hashing", url: "https://networkcheck.kde.org", interval: 300, icon: "https://github.com/shindgewongxj/WHATSINStash/raw/main/icon/loadbalance.png" },
        { name: "手动切换", type: "select", proxies: ["🛰️ 自动選擇", "🔮 负载均衡", "🔯 故障转移", "香港节点", "台湾节点", "日本节点", "韩国节点", "狮城节点", "美国节点", "DIRECT"], icon: "https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/apps/Loon_27.png" },
        { name: "漏网之鱼", type: "select", proxies: commonSelect, icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Social_Media/Snapfish.png" },
        { name: "国外网站", type: "select", proxies: ["🛰️ 自动選擇", "🔮 负载均衡", "🔯 故障转移", "香港节点", "台湾节点", "日本节点", "韩国节点", "狮城节点", "美国节点", "DIRECT"], icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Social_Media/Twitter.png" },
        { name: "Telegram", type: "select", proxies: ["🛰️ 自动選擇", "🔮 负载均衡", "🔯 故障转移", "香港节点", "台湾节点", "日本节点", "韩国节点", "狮城节点", "美国节点", "DIRECT"], icon: "https://raw.githubusercontent.com/ColinYYCC/Network-Tool/refs/heads/main/Resource/Logo/SVG/telegram.svg" },
        { name: "Apple Service", type: "select", proxies: ["DIRECT", "🛰️ 自动選擇", "🔯 故障转移", "🔮 负载均衡", "香港节点", "美国节点", "狮城节点", "日本节点", "韩国节点", "台湾节点"], icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Social_Media/Apple.png" },
        { name: "AI", type: "select", proxies: ["🛰️ 自动選擇", "🔮 负载均衡", "🔯 故障转移", "香港节点", "台湾节点", "日本节点", "韩国节点", "狮城节点", "美国节点", "DIRECT"], icon: "https://raw.githubusercontent.com/ColinYYCC/Network-Tool/refs/heads/main/Resource/Logo/SVG/qwen-color.svg" },
        { name: "Netflix", type: "select", proxies: ["狮城节点", "香港节点", "日本节点", "美国节点", "韩国节点", "台湾节点", "🛰️ 自动選擇", "🔯 故障转移", "🔮 负载均衡"], icon: "https://github.com/ColinYYCC/Network-Tool/raw/main/Resource/Logo/SVG/netflix.svg" },
        { name: "YouTube", type: "select", proxies: ["香港节点", "美国节点", "狮城节点", "日本节点", "韩国节点", "台湾节点", "🛰️ 自动選擇", "🔯 故障转移", "🔮 负载均衡"], icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Social_Media/YouTube.png" },
        { name: "Disney+", type: "select", proxies: ["狮城节点", "香港节点", "日本节点", "美国节点", "韩国节点", "台湾节点", "🛰️ 自动選擇", "🔯 故障转移", "🔮 负载均衡"], icon: "https://github.com/ColinYYCC/Network-Tool/raw/main/Resource/Logo/SVG/disney-plus.svg" },
        { name: "Spotify", type: "select", proxies: ["香港节点", "美国节点", "狮城节点", "日本节点", "韩国节点", "台湾节点", "🛰️ 自动選擇", "🔯 故障转移", "🔮 负载均衡"], icon: "https://github.com/tugepaopao/Image-Storage/raw/master/cartoon/Cute/spotify.png" },
        { name: "Emby", type: "select", proxies: ["香港节点", "美国节点", "狮城节点", "日本节点", "韩国节点", "台湾节点", "🛰️ 自动選擇", "🔯 故障转移", "🔮 负载均衡"], icon: "https://raw.githubusercontent.com/ColinYYCC/Network-Tool/refs/heads/main/Resource/Logo/SVG/emby.svg" },
        { name: "游戏", type: "select", proxies: ["DIRECT", "🛰️ 自动選擇", "🔯 故障转移"], icon: "https://github.com/ColinYYCC/Network-Tool/raw/main/Resource/Logo/SVG/steam.svg" },
        // 自動選擇組 (Hidden)
        { name: "香港节点", type: "url-test", proxies: getMatch(filterHK), url: "https://networkcheck.kde.org", interval: 300, hidden: true, icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Rounded_Rectangle/Hong_Kong.png" },
        { name: "日本节点", type: "url-test", proxies: getMatch(filterJP), url: "https://networkcheck.kde.org", interval: 300, hidden: true, icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Rounded_Rectangle/Japan.png" },
        { name: "韩国节点", type: "url-test", proxies: getMatch(filterKR), url: "https://networkcheck.kde.org", interval: 300, hidden: true, icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Rounded_Rectangle/South_Korea.png" },
        { name: "狮城节点", type: "url-test", proxies: getMatch(filterSG), url: "https://networkcheck.kde.org", interval: 300, hidden: true, icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Rounded_Rectangle/Singapore.png" },
        { name: "美国节点", type: "url-test", proxies: getMatch(filterUS), url: "https://networkcheck.kde.org", interval: 300, hidden: true, icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Rounded_Rectangle/United_States.png" },
        { name: "英国节点", type: "url-test", proxies: getMatch(filterUK), url: "https://networkcheck.kde.org", interval: 300, hidden: true, icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Rounded_Rectangle/United_Kingdom.png" },
        { name: "法国节点", type: "url-test", proxies: getMatch(filterFR), url: "https://networkcheck.kde.org", interval: 300, hidden: true, icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Rounded_Rectangle/France.png" },
        { name: "德国节点", type: "url-test", proxies: getMatch(filterDE), url: "https://networkcheck.kde.org", interval: 300, hidden: true, icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Rounded_Rectangle/Germany.png" },
        { name: "台湾节点", type: "url-test", proxies: getMatch(filterTW), url: "https://networkcheck.kde.org", interval: 300, hidden: true, icon: "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Rounded_Rectangle/Taiwan.png" }
    ];
}

// 覆寫 Rule Providers
function overwriteRuleProviders(params) {
    const common = { type: "http", interval: 43200 };
    params["rule-providers"] = {
        // 攔截類
        "sogouinput": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/sogouinput.txt", path: "./Rules/sukkaw_ruleset/sogouinput.txt" },
        "AWAvenue-Ads-Rule": { ...common, behavior: "domain", format: "yaml", url: "https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/main/Filters/AWAvenue-Ads-Rule-Clash.yaml", path: "./Rules/AWAvenue-Ads-Rule/AWAvenue-Ads-Rule-Clash.yaml" },
        "Adobe跟踪&SDK打点": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/reject-drop.txt", path: "./Rules/sukkaw_ruleset/reject_non_ip_drop.txt" },
        "视频QUIC&PCDN": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/reject-no-drop.txt", path: "./Rules/sukkaw_ruleset/reject_non_ip_no_drop.txt" },
        
        // 靜態 CDN
        "常见静态CDN域名集": { ...common, behavior: "domain", format: "text", url: "https://ruleset.skk.moe/Clash/domainset/cdn.txt", path: "./Rules/sukkaw_ruleset/cdn_domainset.txt" },
        "常见静态CDN": { ...common, behavior: "domain", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/cdn.txt", path: "./Rules/sukkaw_ruleset/cdn_non_ip.txt" },
        
        // 流媒體
        "Netflix": { ...common, behavior: "classical", format: "yaml", url: "https://raw.githubusercontent.com/dler-io/Rules/main/Clash/Provider/Media/Netflix.yaml", path: "./Rules/Netflix.yaml" },
        "流媒体": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/stream.txt", path: "./Rules/sukkaw_ruleset/stream_non_ip.txt" },
        "流媒体IP": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/ip/stream.txt", path: "./Rules/sukkaw_ruleset/stream_ip.txt" },
        
        // 即時通訊 & AI
        "Telegram": { ...common, behavior: "classical", format: "text", url: "https://github.com/LucaLin233/Luca_Conf/raw/main/Surge/Rule/Telegram.list", path: "./Rules/Telegram.txt" },
        "人工智能": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/ai.txt", path: "./Rules/sukkaw_ruleset/ai_non_ip.txt" },
        
        // 蘋果 & 微軟
        "苹果CDN域名集": { ...common, behavior: "domain", format: "text", url: "https://ruleset.skk.moe/Clash/domainset/apple_cdn.txt", path: "./Rules/sukkaw_ruleset/apple_cdn.txt" },
        "苹果服务": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/apple_services.txt", path: "./Rules/sukkaw_ruleset/apple_services.txt" },
        "苹果中国": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/apple_cn.txt", path: "./Rules/sukkaw_ruleset/apple_cn_non_ip.txt" },
        "微软CDN": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/microsoft_cdn.txt", path: "./Rules/sukkaw_ruleset/microsoft_cdn_non_ip.txt" },
        "微软服务": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/microsoft.txt", path: "./Rules/sukkaw_ruleset/microsoft_non_ip.txt" },
        
        // 下載 & 區域
        "下载域名集": { ...common, behavior: "domain", format: "text", url: "https://ruleset.skk.moe/Clash/domainset/download.txt", path: "./Rules/sukkaw_ruleset/download_domainset.txt" },
        "下载": { ...common, behavior: "domain", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/download.txt", path: "./Rules/sukkaw_ruleset/download_non_ip.txt" },
        "内网": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/lan.txt", path: "./Rules/sukkaw_ruleset/lan_non_ip.txt" },
        "内网IP": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/ip/lan.txt", path: "./Rules/sukkaw_ruleset/lan_ip.txt" },
        "国内域名": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/domestic.txt", path: "./Rules/sukkaw_ruleset/domestic_non_ip.txt" },
        "国内IP": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/ip/domestic.txt", path: "./Rules/sukkaw_ruleset/domestic_ip.txt" },
        "直连": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/direct.txt", path: "./Rules/sukkaw_ruleset/direct_non_ip.txt" },
        "全球": { ...common, behavior: "classical", format: "text", url: "https://ruleset.skk.moe/Clash/non_ip/global.txt", path: "./Rules/sukkaw_ruleset/global_non_ip.txt" },
        "中国IP段": { ...common, behavior: "ipcidr", format: "text", url: "https://ruleset.skk.moe/Clash/ip/china_ip.txt", path: "./Rules/sukkaw_ruleset/china_ip.txt" }
    };
}

// 覆寫 Rules
function overwriteRules(params) {
    params.rules = [
        "DOMAIN-SUFFIX,zoom.us,国外网站",
        "DOMAIN-KEYWORD,todesk,DIRECT",
        "DOMAIN-KEYWORD,AnyViewer,DIRECT",
        "DOMAIN-KEYWORD,DeepL,DIRECT",
        "AND,((DST-PORT,443),(NETWORK,UDP)),REJECT",
        "RULE-SET,sogouinput,REJECT",
        "RULE-SET,AWAvenue-Ads-Rule,REJECT",
        "RULE-SET,Adobe跟踪&SDK打点,REJECT-DROP",
        "RULE-SET,视频QUIC&PCDN,REJECT",
        "RULE-SET,内网,DIRECT",
        "RULE-SET,国内域名,DIRECT",
        "RULE-SET,直连,DIRECT",
        "RULE-SET,苹果CDN域名集,DIRECT",
        "RULE-SET,苹果中国,DIRECT",
        "RULE-SET,微软CDN,DIRECT",
        "RULE-SET,微软服务,DIRECT",
        "RULE-SET,苹果服务,Apple Service",
        "RULE-SET,常见静态CDN域名集,手动切换",
        "RULE-SET,常见静态CDN,手动切换",
        "RULE-SET,Netflix,Netflix",
        "RULE-SET,流媒体,美国节点",
        "RULE-SET,Telegram,Telegram",
        "RULE-SET,下载域名集,手动切换",
        "RULE-SET,下载,手动切换",
        "RULE-SET,人工智能,AI",
        "RULE-SET,全球,国外网站",
        "RULE-SET,内网IP,DIRECT",
        "RULE-SET,国内IP,DIRECT",
        "RULE-SET,中国IP段,DIRECT",
        "RULE-SET,流媒体IP,美国节点",
        "GEOIP,CN,DIRECT",
        "MATCH,漏网之鱼"
    ];
}
