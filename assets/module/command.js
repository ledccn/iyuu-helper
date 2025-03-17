/**
 * action 通信命令枚举类
 * - chrome.runtime.onMessage 或 chrome.runtime.sendMessage
 */
class Command {
    /**
     * 创建站点标签页
     * - 消息流向：其他页面 ===> service_worker.js
     * @type {string}
     */
    static createSiteTab = 'createSiteTab';
    /**
     * 初始化站点标签页
     * - 消息流向：content_scripts.js ===> service_worker.js
     * @type {string}
     */
    static initSiteTab = 'initSiteTab';
    /**
     * 保存站点标签页会话信息
     * @type {string}
     */
    static saveSessions = 'saveSessions';
    /**
     * 站点标签页汇报 抓取失败后关闭标签页
     * @type {string}
     */
    static removeSiteTab = 'removeSiteTab';
    /**
     * 站点标签页汇报 完成抓取
     * @type {string}
     */
    static doneSiteTab = 'doneSiteTab';
    /**
     * 批量刷新站点
     * @type {string}
     */
    static batchRefreshSite = 'batchRefreshSite';
}

export {
    Command
}
export default Command;