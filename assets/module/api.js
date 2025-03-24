import Storage from "/assets/module/storage.js";
import Request from "/assets/module/request.js";
import CryptoJS from '/assets/module/crypt.js';

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
     * 准备请求参数
     * @param config
     * @returns {{headers: {}, urlObject: URL}}
     * @throws {Error} 如果缺少必要配置
     */
    static prepareRequest(config) {
        if (!config || !config.iyuu_helper_server || !config.iyuu_helper_secret) {
            throw new Error('请先配置助手地址&助手密钥');
        }

        const secret = config.iyuu_helper_secret;
        const timestamp = String(Math.floor(Date.now() / 1000));
        const signature = CryptoJS.HmacMD5(timestamp, secret).toString().toLowerCase();
        const urlObject = new URL(config.iyuu_helper_server);
        const headers = {
            'iyuu-helper-timestamp': timestamp,
            'iyuu-helper-signature': signature,
            'iyuu-helper-algo': 'md5'
        };
        return {headers, urlObject};
    }

    /**
     * 发送请求，保存站点配置
     * @param data
     * @returns {Promise<*>}
     */
    static async postRequest(data) {
        const config = await Api.getConfig();
        const {headers, urlObject} = Api.prepareRequest(config);
        const request = new Request(urlObject.origin, headers);
        return request.post(urlObject.pathname, data);
    }

    /**
     * 发送请求，获取站点配置
     * @returns {Promise<any>}
     */
    static async getRequest() {
        const config = await Api.getConfig();
        const {headers, urlObject} = Api.prepareRequest(config);
        const request = new Request(urlObject.origin, headers);
        return request.get(urlObject.pathname);
    }
}

export {
    Api
}
export default Api;
