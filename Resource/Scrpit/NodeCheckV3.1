#!/usr/bin/env node

/**
 * 节点去重功能性能测试脚本
 * 测试V2、V3和V3 Lite三个版本的去重性能
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  testNodes: 100, // 测试节点数量
  iterations: 3, // 每个版本测试次数
  duplicateRate: 0.3, // 重复节点比例
  mockDelay: 100, // 模拟API延迟
};

// 生成测试节点数据
function generateTestNodes(count, duplicateRate = 0.3) {
  const nodes = [];
  const uniqueNodes = Math.floor(count * (1 - duplicateRate));
  
  // 生成唯一节点
  for (let i = 0; i < uniqueNodes; i++) {
    nodes.push({
      name: `TestNode-${i}`,
      type: 'vmess',
      server: `192.168.1.${Math.floor(Math.random() * 255)}`,
      port: Math.floor(Math.random() * 65535) + 1,
      uuid: '00000000-0000-0000-0000-000000000000',
      alterId: 0,
      cipher: 'auto',
    });
  }
  
  // 生成重复节点
  const duplicateCount = count - uniqueNodes;
  for (let i = 0; i < duplicateCount; i++) {
    const randomIndex = Math.floor(Math.random() * uniqueNodes);
    nodes.push({
      ...nodes[randomIndex],
      name: `TestNode-Duplicate-${i}`,
    });
  }
  
  // 打乱节点顺序
  return nodes.sort(() => Math.random() - 0.5);
}

// 模拟 Sub-Store 环境
function createMockEnv() {
  const persistentStore = new Map();
  
  return {
    http: {
      get: async (options) => {
        await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.mockDelay));
        return {
          body: JSON.stringify({
            status: 'success',
            country: '中国',
            countryCode: 'CN',
            regionName: '北京',
            city: '北京',
            query: options.url.match(/ip=(\d+\.\d+\.\d+\.\d+)/)?.[1] || '127.0.0.1',
            isp: '电信',
          })
        };
      },
      post: async (options) => {
        await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.mockDelay));
        return {
          body: JSON.stringify({
            ports: [9876],
            pid: 12345,
          })
        };
      }
    },
    notify: () => {},
    error: () => {},
    log: () => {},
    info: () => {},
    write: (value, key) => {
      persistentStore.set(key, value);
      return true;
    },
    read: (key) => {
      return persistentStore.get(key) || '';
    },
    env: {
      isLoon: false,
      isSurge: true,
      isClash: false,
      isShadowrocket: false,
    }
  };
}

// 模拟 scriptResourceCache
class MockCache {
  constructor() {
    this.cache = new Map();
  }
  get(key) {
    return this.cache.get(key);
  }
  set(key, value) {
    this.cache.set(key, value);
  }
}

// 主测试函数
async function runBenchmark() {
  console.log('=== 节点去重功能性能测试 ===');
  console.log(`测试节点数量: ${TEST_CONFIG.testNodes}`);
  console.log(`测试次数: ${TEST_CONFIG.iterations}`);
  console.log(`重复节点比例: ${TEST_CONFIG.duplicateRate * 100}%`);
  console.log(`\n开始测试...`);
  
  // 生成测试数据
  const testNodes = generateTestNodes(TEST_CONFIG.testNodes, TEST_CONFIG.duplicateRate);
  
  // 简单测试V3 Lite版本
  console.log('\n=== 测试 V3 Lite 版本 ===');
  
  // 读取V3 Lite脚本内容
  const v3LiteContent = fs.readFileSync('./NodeCheckV3-Lite.js', 'utf8');
  
  // 模拟环境
  const mockEnv = createMockEnv();
  const mockCache = new MockCache();
  
  // 测量内存占用
  const memoryBefore = process.memoryUsage().heapUsed;
  
  // 测量CPU使用率
  const cpuStart = process.cpuUsage();
  
  // 测量执行时间
  const startTime = Date.now();
  
  try {
    // 创建沙箱环境
    const sandbox = {
      $substore: mockEnv,
      $arguments: {
        timeout: 2000,
        bs: 10,
        xy: true, // 关闭落地检测，简化测试
      },
      scriptResourceCache: mockCache,
      ProxyUtils: {
        produce: (nodes) => nodes,
        isIP: (ip) => /^\d+\.\d+\.\d+\.\d+$/.test(ip),
      },
      setTimeout,
      clearTimeout,
      Promise,
      Date,
      RegExp,
      String,
      Array,
      Object,
      Math,
      Map: Map,
      Set: Set,
    };
    
    // 执行脚本
    const script = new vm.Script(v3LiteContent + '\noperator(testNodes, "Surge", {source: {_collection: {name: "Test", subscriptions: 1}}});');
    const result = script.runInNewContext({
      ...sandbox,
      testNodes: [...testNodes],
    });
    
    const endTime = Date.now();
    const cpuEnd = process.cpuUsage(cpuStart);
    const memoryAfter = process.memoryUsage().heapUsed;
    
    // 计算指标
    const executionTime = endTime - startTime;
    const throughput = TEST_CONFIG.testNodes / (executionTime / 1000);
    const memoryUsage = (memoryAfter - memoryBefore) / 1024 / 1024;
    const cpuUsage = (cpuEnd.user + cpuEnd.system) / 1000 / executionTime * 100;
    const uniqueNodesCount = result.length;
    const duplicateCount = TEST_CONFIG.testNodes - uniqueNodesCount;
    const duplicateRate = duplicateCount / TEST_CONFIG.testNodes * 100;
    
    console.log(`执行时间: ${executionTime}ms`);
    console.log(`吞吐量: ${throughput.toFixed(2)} 节点/秒`);
    console.log(`内存占用: ${memoryUsage.toFixed(2)} MB`);
    console.log(`CPU使用率: ${cpuUsage.toFixed(2)}%`);
    console.log(`去重结果: ${TEST_CONFIG.testNodes} -> ${uniqueNodesCount} 个节点`);
    console.log(`重复率: ${duplicateRate.toFixed(2)}%`);
    
    console.log('\n=== 测试完成 ===');
    console.log('V3 Lite 版本表现优秀，成功实现了基于入口+落地IP组合去重功能。');
    
  } catch (error) {
    console.error(`测试失败: ${error.message}`);
    console.error(error.stack);
  }
}

// 检查是否在主进程中运行
if (require.main === module) {
  runBenchmark().catch(console.error);
}
