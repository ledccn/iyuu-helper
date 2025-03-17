import Store from '/assets/module/store.js';

/**
 * session存储的前缀
 * @type {string}
 */
const SITE_SESSION = 'SITE_SESSION_';
/**
 * Session中的下一页会话
 * @type {string}
 */
const SITE_NEXT_PAGE = 'NEXT_PAGE';
/**
 * Session中的cookie状态键
 * @type {string}
 */
const COOKIE_STATUS_KEY = 'is_cookie_valid';

/**
 * 站点会话
 * - 站点会话数据存储于chrome.storage.local中
 * - 站点标签关闭后，会自动清理数据（见 background.js 在标签页关闭时触发）
 */
class Sessions extends Store {
    static SITE_NEXT_PAGE = SITE_NEXT_PAGE;

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
        this.storeKey = SITE_SESSION + storeKey;
    }

    /**
     * 创建对象
     * @param {string} site
     * @returns {Sessions}
     */
    static make(site) {
        return new Sessions(site);
    }

    /**
     * 设置Cookie状态
     * @param {boolean} value
     * @returns {Promise<void>}
     */
    async setCookieStatus(value) {
        return this.setItem(COOKIE_STATUS_KEY, Boolean(value));
    }

    /**
     * 获取Cookie状态
     * @returns {Promise<boolean>}
     */
    async getCookieStatus() {
        return Boolean((await this.getItem(COOKIE_STATUS_KEY)) || false);
    }

    /**
     * 设置下一页
     * @param {string} page
     * @returns {Promise<void>}
     */
    async setNextPage(page) {
        return this.setItem(SITE_NEXT_PAGE, page);
    }

    /**
     * 获取下一页
     * @returns {Promise<string>}
     */
    async getNextPage() {
        return (await this.getItem(SITE_NEXT_PAGE)) || '';
    }

    /**
     * 删除下一页
     * @returns {Promise<void>}
     */
    async removeNextPage() {
        return this.removeItem(SITE_NEXT_PAGE);
    }
}

export {
    Sessions
}
export default Sessions;
