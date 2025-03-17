import Storage from '/assets/module/storage.js';

console.log('import assets/module/sites/config.js');
/**
 * 配置项字段：passkey
 * - NexusPHP 架构通用
 * @type {string}
 */
const OPTIONS_FIELDS_PASSKEY = 'passkey';
/**
 * 配置项字段：cuhash
 * - 城市
 * @type {string}
 */
const OPTIONS_FIELDS_CUHASH = 'cuhash';
/**
 * 配置项字段：downhash
 * @type {string}
 */
const OPTIONS_FIELDS_DOWNHASH = 'downhash';
/**
 * 配置项字段：rsskey
 * @type {string}
 */
const OPTIONS_FIELDS_RSSKEY = 'rsskey';
/**
 * 配置项字段：uid
 * - 用户ID
 * @type {string}
 */
const OPTIONS_FIELDS_UID = 'uid';
/**
 * 配置项字段：x_api_key
 * - 馒头
 * @type {string}
 */
const OPTIONS_FIELDS_X_API_KEY = 'x_api_key';
/**
 * 配置项字段：x_csrf_token
 * - 朱雀
 * @type {string}
 */
const OPTIONS_FIELDS_X_CSRF_TOKEN = 'x_csrf_token';
/**
 * 配置项字段：rss_key
 * - 朱雀
 * @type {string}
 */
const OPTIONS_FIELDS_RSS_KEY = 'rss_key';
/**
 * 配置项字段：torrent_key
 * - 朱雀
 * @type {string}
 */
const OPTIONS_FIELDS_TORRENT_KEY = 'torrent_key';
/**
 * 配置项字段：torrent_pass
 * - 海豚音乐
 * @type {string}
 */
const OPTIONS_FIELDS_TORRENT_PASS = 'torrent_pass';
/**
 * 配置项字段：authkey
 * - 海豚音乐
 * @type {string}
 */
const OPTIONS_FIELDS_AUTHKEY = 'authkey';
/**
 * 排除 UID 的站点列表
 * @type {string[]}
 */
const EXCLUDE_UID_SITES = ['dicmusic', 'hdcity'];
/**
 * 缓存键：所有站点
 * @type {string}
 */
const CACHE_ALL_SITES = 'CACHE_ALL_SITES';
/**
 * 缓存键：站点前缀
 * @type {string}
 */
const CACHE_SITE = 'CACHE_SITE_';

/**
 * 配置类（基类）
 */
class Config {
    /**
     * 构造函数
     * @param {Object} conf
     */
    constructor(conf) {
        this.base_url = conf['base_url'];
        this.sid = conf['sid'];
        this.site = conf['site'];
        this.cookie = conf['cookie'] || '';
        this.cookie_required = Boolean(conf['cookie_required'] || false);
        this.details_page = conf['details_page'];
        this.download_page = conf['download_page'];
        this.is_https = Boolean(conf['is_https']);
        this.mirror = conf['mirror'] || '';
        this.nickname = conf['nickname'];
        this.options = conf['options'] || {};
    }

    /**
     * 是否使用 HTTPS
     * @returns {boolean}
     */
    isHttps() {
        return this.is_https;
    }

    /**
     * 获取协议
     * @returns {string}
     */
    getProtocol() {
        return this.isHttps() ? 'https://' : 'http://';
    }

    /**
     * 获取域名
     * - 如果 mirror 存在，则返回 mirror，否则返回 base_url
     * @returns {string}
     */
    getDomain() {
        return this.mirror ? this.mirror : this.base_url;
    }

    /**
     * 获取协议+主机
     * @returns {string}
     */
    getProtocolHost() {
        return this.getProtocol() + this.getDomain();
    }

    /**
     * 获取配置项
     * @returns {Object}
     */
    getOptions() {
        return this.options;
    }

    /**
     * 获取站点的首页 URL
     * @returns {string}
     */
    getFirstPageUrl() {
        switch (this.site) {
            case 'm-team':
                return 'https://kp.m-team.cc' + '/' + Config.firstPageUrl(this.site);
            default:
                return this.getProtocolHost() + '/' + Config.firstPageUrl(this.site);
        }
    }

    /**
     * 站点的首个页面
     * @param {string} site
     * @returns {string}
     */
    static firstPageUrl(site) {
        switch (site) {
            case 'ttg':
                return 'my.php';
            case 'hdcity':
                return 'usercp?action=security';
            case 'm-team':
                return 'usercp?tab=laboratory';
            case 'greatposterwall':
                return 'user.php?action=notify';
            case 'hdpost':
            case 'monikadesign':
                return 'rss';
            default:
                return 'usercp.php';
        }
    }

    /**
     * 获取必填配置项的名称
     * @param {string} site
     * @returns {string[]}
     */
    static requiredOptionsKeys(site) {
        const required_keys = [];
        if (!EXCLUDE_UID_SITES.includes(site)) {
            required_keys.push(OPTIONS_FIELDS_UID);
        }

        switch (site) {
            case 'hdpost':
            case 'monikadesign':
                required_keys.push(OPTIONS_FIELDS_TORRENT_PASS, OPTIONS_FIELDS_RSSKEY, OPTIONS_FIELDS_PASSKEY);
                break;
            case 'dicmusic':
            case 'greatposterwall':
                required_keys.push(OPTIONS_FIELDS_TORRENT_PASS, OPTIONS_FIELDS_AUTHKEY, OPTIONS_FIELDS_PASSKEY);
                break;
            case 'm-team':
                required_keys.push(OPTIONS_FIELDS_X_API_KEY, OPTIONS_FIELDS_PASSKEY);
                break;
            case 'zhuque':
                required_keys.push(OPTIONS_FIELDS_X_CSRF_TOKEN, OPTIONS_FIELDS_TORRENT_KEY, OPTIONS_FIELDS_RSS_KEY);
                break;
            case 'hdcity':
                required_keys.push(OPTIONS_FIELDS_PASSKEY, OPTIONS_FIELDS_CUHASH);
                break;
            default:
                required_keys.push(OPTIONS_FIELDS_PASSKEY);
                break;
        }

        return required_keys;
    }

    /**
     * 获取必填配置项的名称
     * @returns {string[]}
     */
    getRequiredOptionsKeys() {
        return Config.requiredOptionsKeys(this.site);
    }

    /**
     * 保存配置
     * @returns {Promise<*>}
     */
    async saveStorageLocal() {
        return Storage.local().set({[this.site]: this});
    }

    /**
     * 缓存所有站点（获取或保存）
     * - list 为 null 时，获取所有站点；否则保存所有站点
     * @param {Object | Array | null} list
     * @returns {Promise<*>}
     */
    static async allSites(list = null) {
        if (list) {
            // 缓存单独站点
            const sites = {};
            list.forEach((item) => {
                let key = CACHE_SITE + item.site;
                sites[key] = item;
            });
            await Storage.local().set(sites);
            // 缓存所有站点
            return Storage.local().set({CACHE_ALL_SITES: list});
        } else {
            // 获取所有站点
            const data = await Storage.local().get(CACHE_ALL_SITES);
            return data[CACHE_ALL_SITES] || [];
        }
    }

    /**
     * 移除所有站点
     * @returns {Promise<*>}
     */
    static async removeAllSites() {
        return Storage.local().remove(CACHE_ALL_SITES);
    }

    /**
     * 创建配置
     * @param {string} site 站点名称
     * @returns {Promise<Config|null>}
     */
    static async make(site) {
        const key = CACHE_SITE + site;
        const data = await Storage.local().get(key);
        return data ? new Config(data[key]) : null;
    }
}

export {
    Config,
    OPTIONS_FIELDS_PASSKEY,
    OPTIONS_FIELDS_CUHASH,
    OPTIONS_FIELDS_DOWNHASH,
    OPTIONS_FIELDS_RSSKEY,
    OPTIONS_FIELDS_UID,
    OPTIONS_FIELDS_X_API_KEY,
    OPTIONS_FIELDS_X_CSRF_TOKEN,
    OPTIONS_FIELDS_RSS_KEY,
    OPTIONS_FIELDS_TORRENT_KEY,
    OPTIONS_FIELDS_TORRENT_PASS,
    OPTIONS_FIELDS_AUTHKEY,
    EXCLUDE_UID_SITES,
    CACHE_ALL_SITES,
}
export default Config;