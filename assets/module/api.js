import Storage from "/assets/module/storage.js";
import Request from "/assets/module/request.js";

/**
 * 本地存储的键
 * @type {string}
 */
const IYUU_HELPER_CONFIG = 'IYUU_HELPER_CONFIG';

/**
 * API
 */
class Api {
    /**
     * 本地存储的键
     * @type {string}
     */
    static IYUU_HELPER_CONFIG = IYUU_HELPER_CONFIG;
    /**
     * 从本地存储获取配置
     * @returns {Promise<Object>}
     */
    static async getConfig() {
        const storage = await Storage.local();
        const config = await storage.get(IYUU_HELPER_CONFIG);
        return config[IYUU_HELPER_CONFIG] || {};
    }

    /**
     * 保存配置到本地存储
     * @param config
     * @returns {Promise<void>}
     */
    static async setConfig(config) {
        const storage = await Storage.local();
        return storage.set({
            [IYUU_HELPER_CONFIG]: config
        });
    }

    /**
     * 发送请求，保存站点配置
     * @param data
     * @returns {Promise<*>}
     */
    static async postRequest(data) {
        const config = await Api.getConfig();
        if (config && config.iyuu_helper_server) {
            const urlObject = new URL(config.iyuu_helper_server);
            const request = new Request(urlObject.origin, {
                'x-iyuu-helper': config['x-iyuu-helper'] || ''
            });
            return request.post(urlObject.pathname, data);
        }
        throw new Error('请先配置服务器地址');
    }

    /**
     * 发送请求，获取站点配置
     * @returns {Promise<any>}
     */
    static async getRequest() {
        const config = await Api.getConfig();
        if (config && config.iyuu_helper_server) {
            const urlObject = new URL(config.iyuu_helper_server);
            const request = new Request(urlObject.origin, {
                'x-iyuu-helper': config['x-iyuu-helper'] || ''
            });
            return request.get(urlObject.pathname);
        }
        throw new Error('请先配置服务器地址');
    }
}

export {
    Api
}
export default Api;
