import Store from '/assets/module/store.js';

/**
 * headers前缀
 * @type {string}
 */
const SITE_HEADERS = 'SITE_HEADERS_'

/**
 * headers存储
 */
class Headers extends Store {
    /**
     * 构造函数
     * @param {string} site 站点名称
     */
    constructor(site) {
        super(site);
        this.site = site;
    }

    /**
     * 设置缓存数据键
     * @param {string} storeKey
     */
    setStoreKey(storeKey) {
        this.storeKey = SITE_HEADERS + storeKey;
    }

    /**
     * 创建会话
     * @param {string} site
     * @returns {Headers}
     */
    static make(site) {
        return new Headers(site);
    }
}

export {Headers}
export default Headers;