const { getReadyClient } = require('../config/redis');
const env = require('../config/env');

const TTL = Object.freeze({ BLOG_LIST: 300, BLOG_DETAIL: 600, BLOG_TAXONOMY: 600, FAQ: 600, SETTINGS: 1800, PRICING: 600 });
const PREFIX = Object.freeze({ BLOGS: 'losa247:v1:blogs', FAQS: 'losa247:v1:faqs', SETTINGS: 'losa247:v1:settings', PRICING: 'losa247:v1:pricing' });

const devLog = (message, key) => {
  if (env.NODE_ENV !== 'production') console.log(`[Cache] ${message}: ${key}`);
};

const stableQuery = (query = {}) => Object.keys(query)
  .filter((key) => query[key] !== undefined && query[key] !== '')
  .sort()
  .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(query[key]))}`)
  .join('&') || 'default';

const keys = Object.freeze({
  blogList: (query) => `${PREFIX.BLOGS}:list:${stableQuery(query)}`,
  blogSlug: (slug) => `${PREFIX.BLOGS}:slug:${encodeURIComponent(slug)}`,
  blogRelated: (slug) => `${PREFIX.BLOGS}:related:${encodeURIComponent(slug)}`,
  blogCategories: () => `${PREFIX.BLOGS}:categories`,
  blogTags: (query) => `${PREFIX.BLOGS}:tags:${stableQuery(query)}`,
  faqList: (query) => `${PREFIX.FAQS}:list:${stableQuery(query)}`,
  siteInfo: () => `${PREFIX.SETTINGS}:site-info`,
  appearance: () => `${PREFIX.SETTINGS}:appearance`,
  leadForm: () => `${PREFIX.SETTINGS}:lead-form`,
  pricingPlans: (query) => `${PREFIX.PRICING}:plans:${stableQuery(query)}`,
  pricingComparisons: () => `${PREFIX.PRICING}:comparisons`,
});

const patterns = Object.freeze({
  allBlogs: () => `${PREFIX.BLOGS}:*`,
  blogLists: () => `${PREFIX.BLOGS}:list:*`,
  blogSlugs: () => `${PREFIX.BLOGS}:slug:*`,
  blogRelated: () => `${PREFIX.BLOGS}:related:*`,
  blogTags: () => `${PREFIX.BLOGS}:tags:*`,
  faqs: () => `${PREFIX.FAQS}:list:*`,
  pricingPlans: () => `${PREFIX.PRICING}:plans:*`,
});

const get = async (key) => {
  try {
    const client = await getReadyClient();
    if (!client) return undefined;
    const value = await client.get(key);
    if (value === null) { devLog('CACHE MISS', key); return undefined; }
    devLog('CACHE HIT', key);
    return JSON.parse(value);
  } catch (error) {
    console.error(`[Cache] GET failed: ${error.message}`);
    return undefined;
  }
};

const set = async (key, data, ttl) => {
  try {
    const client = await getReadyClient();
    if (!client) return false;
    await client.set(key, JSON.stringify(data), { EX: ttl });
    return true;
  } catch (error) {
    console.error(`[Cache] SET failed: ${error.message}`);
    return false;
  }
};

const del = async (...cacheKeys) => {
  try {
    const client = await getReadyClient();
    if (!client || cacheKeys.length === 0) return false;
    await client.del(cacheKeys);
    cacheKeys.forEach((key) => devLog('CACHE INVALIDATED', key));
    return true;
  } catch (error) {
    console.error(`[Cache] DEL failed: ${error.message}`);
    return false;
  }
};

const delPattern = async (pattern) => {
  try {
    const client = await getReadyClient();
    if (!client) return false;
    let batch = [];
    for await (const item of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      const scannedKeys = Array.isArray(item) ? item : [item];
      batch.push(...scannedKeys);
      if (batch.length >= 100) { await client.del(batch); batch = []; }
    }
    if (batch.length) await client.del(batch);
    devLog('CACHE INVALIDATED', pattern);
    return true;
  } catch (error) {
    console.error(`[Cache] DEL PATTERN failed: ${error.message}`);
    return false;
  }
};

const getOrSet = async (key, callback, ttl) => {
  const cached = await get(key);
  if (cached !== undefined) return cached;
  const data = await callback();
  await set(key, data, ttl);
  return data;
};

const middleware = (keyBuilder, ttl) => async (req, res, next) => {
  try {
    const key = keyBuilder(req);
    const cached = await get(key);
    if (cached !== undefined) return res.json(cached);

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) void set(key, body, ttl);
      return originalJson(body);
    };
    next();
  } catch (_error) {
    next();
  }
};

const invalidateAfterSuccess = (targetsBuilder) => (req, res, next) => {
  res.once('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return;
    const targets = targetsBuilder(req) || {};
    for (const key of targets.keys || []) void del(key);
    for (const pattern of targets.patterns || []) void delPattern(pattern);
  });
  next();
};

module.exports = { TTL, keys, patterns, get, set, del, delPattern, getOrSet, middleware, invalidateAfterSuccess, stableQuery };
