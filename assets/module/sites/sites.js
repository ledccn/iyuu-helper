import Config from '/assets/module/sites/config.js';
import Command from '/assets/module/command.js';
import Sessions from '/assets/module/sessions.js';
import Status from '/assets/module/status.js';

console.log('import assets/module/sites/sites.js');

/**
 * 站点类（基类）
 */
class Sites {
    /**
     * 关键字
     * - 子类可以重写
     * @type {{userdetails: string}}
     */
    static keyword = {
        userdetails: 'userdetails.php?id=',
    };
    /**
     * 选择器
     * - 子类可以重写
     * @type {{info_block: string}}
     */
    static selector = {
        // 用户信息容器
        info_block: 'info_block',
    };

    /**
     * 构造函数
     * @param {Config|Object} config
     */
    constructor(config) {
        this.config = config instanceof Config ? config : new Config(config);
        this.init();
    }

    /**
     * 初始化方法
     * - 子类可以重写此方法
     */
    init() {
    }

    /**
     * 将字符串转换为类方法名
     * - 需要定义为async方法
     * - 转换规则：把字段名下划线转换为驼峰（首字母大写），拼接前缀 chainFields
     * - 转换格式：chainFields + 字段名称
     * - 示例：stringToMethodName('uid')，结果：chainFieldsUid
     * - 示例：chainFieldsUid，chainFieldsPasskey
     * @param {string} fields 待抓取的字段名称
     * @returns {string} 站点驱动类的类方法名
     */
    static stringToMethodName(fields) {
        const pascalCaseName = fields.split(/[\s-_]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
        return 'chainFields' + pascalCaseName;
    }

    /**
     * 站点标签页向扩展发送命令并携带数据
     * @param {string} command 命令（枚举值）
     * @param {string} site 站点名称
     * @param {Object} data 数据
     * @returns {Promise<any>}
     */
    static async sendMessage(command, site, data = {}) {
        return chrome.runtime.sendMessage({
            action: command, site: site, data: data
        });
    }

    /**
     * 判断缓存的cookie状态
     * @returns {Promise<boolean|null>}
     */
    async isCookieStatus() {
        return Sessions.make(this.getConfig().site).getCookieStatus();
    }

    /**
     * 设置本地浏览器缓存的cookie状态
     * @param {boolean} value
     */
    async setCookieStatus(value) {
        console.log('设置本地浏览器缓存的cookie状态', value);
        if (Boolean(value)) {
            await Status.make().setItem(this.getConfig().site, true);
            await Sessions.make(this.getConfig().site).setCookieStatus(true);
        } else {
            await Status.make().removeItem(this.getConfig().site);
            await Sessions.make(this.getConfig().site).setCookieStatus(false);
            // X秒后，发送消息，删除标签页
            setTimeout(async () => {
                await Sites.sendMessage(Command.removeSiteTab, this.getConfig().site);
            }, 60000);
        }
    }

    /**
     * 获取配置
     * @returns {Config}
     */
    getConfig() {
        return this.config;
    }

    /**
     * 检查 Cookie 是否有效
     * - 默认NexusPHP站点，info_block 中包含 userdetails.php?id= 获取用户ID
     * @returns {Promise<Boolean>}
     */
    async isCookieValid() {
        // 判断缓存，直接返回true
        if (await this.isCookieStatus()) {
            console.log('缓存的cookie状态为 true，直接返回 true');
            return true;
        }

        // 检查当前页面路径，不等于则返回 false
        if (location.href !== this.config.getFirstPageUrl()) {
            console.log('当前页面路径不等于，直接返回 false');
            return false;
        }

        return document.body.innerHTML.includes(Sites.keyword.userdetails);
    }

    /**
     * 获取用户的 user_id
     * @returns {Promise<int>}
     */
    async chainFieldsUid() {
        const dom = document.getElementById(Sites.selector.info_block) ?? document.body;
        const user_id = getLinkHrefByDocument(dom, /userdetails\.php\?id=(\d+)/, 1);
        if (user_id) {
            return parseInt(user_id);
        } else {
            throw new Error('无法获取到 user_id');
        }
    }

    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        return getFieldsPasskey('密钥');
    }

    /**
     * 执行管道或责任链
     * - 遍历所有配置项，调用对应的方法，并等待返回值
     * - 如果有异常，则跳过该方法，继续执行下一个方法
     * - 如果所有方法都执行完毕，则上报结果
     * @returns {Promise<void>}
     */
    async execute() {
        const site = this.getConfig().site;
        const result = (await Sessions.make(site).get()) || {};

        try {
            for (let option of Config.requiredOptionsKeys(site)) {
                const method = Sites.stringToMethodName(option);
                console.log(`${this.constructor.name} 执行pipeline方法 ｜ ${method} ｜ 字段 ${option}`);
                if (!this[method]) {
                    console.error(`${method} is not a function`);
                    return;
                }
                // 防重入
                if (result[option]) {
                    continue;
                }
                // 核心：调用async方法，并等待返回值；入参为 result 和 option
                let value = await this[method].bind(this)(result, option);
                console.log(`${this.constructor.name} 执行pipeline方法 ｜ ${method} ｜ 字段 ${option} ｜ 返回值:`, value)
                result[option] = value;
                // 保存结果到 Session
                await Sessions.make(site).setItem(option, value);
            }

            // 清洗数据，删除 SITE_NEXT_PAGE
            delete result[Sessions.SITE_NEXT_PAGE];
            await Sessions.make(site).removeNextPage();
            console.log('Sites::execute 抓取结果', result);

            // 上报结果
            Sites.sendMessage(Command.doneSiteTab, site, result).then((response) => {
                console.log('Sites::execute 上报结果，响应', response);
            });
        } catch (e) {
            console.error(e);
        }
    }
}

export {
    Sites
}
export default Sites;