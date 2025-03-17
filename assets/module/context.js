import Cookies from '/assets/module/cookies.js';
import Headers from '/assets/module/headers.js';

/**
 * 任务上下文
 * - 站点与标签页的映射
 * - 标签页与站点的映射
 * - 站点与cookie的映射
 * - 站点与header的映射
 */
class Context {
    /**
     * 构造函数
     */
    constructor() {
        if (Context.instance) {
            return Context.instance;
        }
        // 站点与标签页的映射
        this.siteToTab = new Map();
        // 标签页与站点的映射
        this.tabToSite = new Map();
        // 站点与cookie的映射
        this.cookies = new Map();
        // 站点与header的映射
        this.headers = new Map();
        // 批量刷新站点的队列
        this.queue = [];
        Context.instance = this;
    }

    /**
     * 获取实例（单例）
     * @returns {Context}
     */
    static getInstance() {
        if (!Context.instance) {
            Context.instance = new Context();
        }
        return Context.instance;
    }

    /**
     * 创建站点与cookie的映射
     * - 备份cookie 持久化到 chrome.storage.local
     * @param {string} site
     * @param {string} cookie
     */
    createCookie(site, cookie) {
        this.cookies.set(site, cookie);
        Cookies.make(site).set(cookie).then(() => {
            console.log(`站点 ${site} Cookie 已持久化到 chrome.storage.local`);
        });
    }

    /**
     * 获取 cookie 的值
     * - 从 chrome.storage.local 获取
     * @param {string} site
     * @returns {Promise<string|null>}
     */
    static async getCookieByStorage(site) {
        return Cookies.make(site).get();
    }

    /**
     * 获取 header 的值
     * - 从 chrome.storage.local 获取
     * @param {string} site
     * @returns {Promise<array|null>}
     */
    static async getHeaderByStorage(site) {
        return Headers.make(site).get();
    }

    /**
     * 创建站点与header的映射
     * @param {string} site
     * @param {array} header
     */
    createHeader(site, header) {
        this.headers.set(site, header);
        Headers.make(site).set(header).then(() => {
            console.log(`站点 ${site} Header 已持久化到 chrome.storage.local`);
        });
    }

    /**
     * 创建任务
     * @param {number|string} tabId
     * @param {string} site
     */
    create(tabId, site) {
        this.siteToTab.set(site, tabId);
        this.tabToSite.set(tabId, site);
    }

    /**
     * 根据标签页移除任务
     * @param {number|string} tabId
     */
    remove(tabId) {
        try {
            const site = this.tabToSite.get(tabId);
            this.siteToTab.delete(site);
            this.tabToSite.delete(tabId);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * 判断任务是否存在
     * @param {number|string} tabId
     * @returns {boolean}
     */
    has(tabId) {
        return this.tabToSite.has(tabId);
    }

    /**
     * 根据站点移除任务
     * @param {string} site
     */
    removeBySite(site) {
        try {
            const tabId = this.siteToTab.get(site);
            this.siteToTab.delete(site);
            this.tabToSite.delete(tabId);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * 根据站点判断任务是否存在
     * @param {string} site
     * @returns {boolean}
     */
    hasBySite(site) {
        return this.siteToTab.has(site);
    }

    /**
     * 添加元素到队列
     * @param {string} site
     */
    pushQueue(site) {
        if (this.queue.indexOf(site) === -1) {
            this.queue.push(site);
        }
    }

    /**
     * 从队列获取元素
     * @returns {string}
     */
    popQueue() {
        return this.queue.shift();
    }

    /**
     * 获取队列长度
     * @returns {number}
     */
    lengthQueue() {
        return this.queue.length;
    }

    /**
     * 获取站点与标签页的映射
     * @returns {Map<string, number>}
     */
    getSiteToTab() {
        return this.siteToTab;
    }

    /**
     * 获取标签页与站点的映射
     * @returns {Map<number, string>}
     */
    getTabToSite() {
        return this.tabToSite;
    }

    /**
     * 获取站点与cookie的映射
     * @returns {Map<string, string>}
     */
    getCookies() {
        return this.cookies;
    }

    /**
     * 获取站点与header的映射
     * @returns {Map<string, array>}
     */
    getHeaders() {
        return this.headers;
    }

    /**
     * 获取批量刷新站点的队列
     * @returns {[]}
     */
    getQueue() {
        return this.queue;
    }
}

export {
    Context
};
export default Context;