/**
 * 谷歌浏览器 API 助手类
 */
class Helper {
    /**
     * 将应用/扩展程序安装目录中的相对路径转换为完全限定网址
     * @param {string} path 相对于应用/扩展程序安装目录的应用/扩展程序内资源的路径
     * @returns {string} 资源的完全限定网址
     */
    static getChromeUrl(path) {
        return chrome.runtime.getURL(path);
    }

    /**
     * 获取当前标签页
     * @returns {Promise<*>}
     */
    static async getCurrent() {
        return chrome.tabs.getCurrent();
    }

    /**
     * 获取当前标签页（活动的）
     * @returns {Promise<*>}
     */
    static async getCurrentActiveTab() {
        let queryOptions = {active: true, lastFocusedWindow: true};
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        return tab;
    }

    /**
     * 新标签打开某个链接
     * @param {string} url
     */
    static async createTab(url) {
        return chrome.tabs.create({url: url});
    }

    /**
     * 更新标签打开某个链接
     * @param {string} url
     * @param {number} tabId
     */
    static async updateTab(url, tabId) {
        return chrome.tabs.update(tabId, {url: url});
    }

    /**
     * 关闭一个或多个标签页
     * @param {number | number[]} tabId
     * @returns {Promise<*>}
     */
    static async removeTab(tabId) {
        return chrome.tabs.remove(tabId);
    }

    /**
     * 重新加载标签页
     * @param {number} tabId
     * @returns {Promise<*>}
     */
    static async reloadTab(tabId) {
        return chrome.tabs.reload(tabId, {bypassCache: true});
    }

    /**
     * 将消息传递给所选标签页的内容脚本
     * @param message
     * @returns {Promise<void>}
     */
    static async sendMessageToActiveTab(message) {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        return chrome.tabs.sendMessage(tab.id, message);
    }

    /**
     * 将消息传递给指定标签页的内容脚本
     * - 向指定标签页中的 content 脚本发送一条消息，并在发回响应时运行一个可选回调。在当前扩展程序的指定标签页中运行的每个内容脚本都会触发 runtime.onMessage 事件
     * @param {number} tabId
     * @param {object} message - 要发送的消息。此消息应为可 JSON 化对象。
     * @returns {Promise<*>}
     */
    static async sendMessageToTab(tabId, message) {
        return chrome.tabs.sendMessage(tabId, message);
    }

    /**
     * 发送消息
     * @param {Object} message
     * @returns {Promise<any>}
     */
    async sendMessageToExtension(message) {
        return chrome.runtime.sendMessage(message);
    }
}

export {Helper}
export default Helper;