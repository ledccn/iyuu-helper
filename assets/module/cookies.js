import Store from '/assets/module/store.js';

/**
 * cookie前缀
 * @type {string}
 */
const SITE_COOKIE = 'SITE_COOKIE_'

/**
 * cookie存取类
 */
class Cookies extends Store {
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
        this.storeKey = SITE_COOKIE + storeKey;
    }

    /**
     * 创建对象
     * @param {string} site
     * @returns {Cookies}
     */
    static make(site) {
        return new Cookies(site);
    }
}

export {Cookies}
export default Cookies;