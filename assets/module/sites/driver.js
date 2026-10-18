import Sites from '/assets/module/sites/sites.js';
import Sessions from '/assets/module/sessions.js';
import Request from "/assets/module/request.js";

console.log('import assets/module/sites/driver.js', '自定义站点驱动类');
export {
    DriverMTeam,
    DriverTtg,
    DriverHdcity,
    DriverNicept,
    DriverDiscfan,
    DriverHdpost,
    DriverGreatposterwall,
    DriverHhanclub,
    DriverPtzone,
    DriverRousi,
}

/**
 * rousi（PeerGo 新架构，rousi.pro）
 * - SPA 应用，无 NexusPHP 页面特征
 * - uid：页面 /user/{username} 链接 → /api/v1/users/{username} 的 numeric_id
 * - passkey：Tracker Passkey，页面不展示，从 .torrent 的 announce 地址提取
 */
class DriverRousi extends Sites {
    /**
     * 检查 Cookie 是否有效
     * @returns {Promise<boolean>}
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

        // SPA 异步渲染，轮询等待用户链接出现（约 10 秒上限）
        for (let i = 0; i < 20; i++) {
            if (/\/user\/[a-z0-9_]+/i.test(document.body.innerHTML)) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return false;
    }

    /**
     * 获取用户的 user_id
     * @returns {Promise<int>}
     */
    async chainFieldsUid() {
        const m = document.body.innerHTML.match(/\/user\/([a-z0-9_]+)/i);
        if (!m) {
            throw new Error('无法获取到用户名链接');
        }
        const r = await fetch('/api/v1/users/' + m[1], {credentials: 'include'});
        const j = await r.json();
        if (j && j.numeric_id) {
            return parseInt(j.numeric_id);
        }
        throw new Error('无法获取到 numeric_id');
    }

    /**
     * 获取用户的 passkey
     * - 从任意一个 .torrent 的 announce 地址提取 Tracker Passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        const lr = await fetch('/api/v1/torrents?page=1', {credentials: 'include'});
        const lj = await lr.json();
        const items = lj.items || [];
        if (!items.length) {
            throw new Error('种子列表为空，无法提取 passkey');
        }
        const r = await fetch('/api/v1/torrents/' + items[0].id + '/download', {credentials: 'include'});
        const buf = await r.arrayBuffer();
        const bytes = new Uint8Array(buf);
        // announce 在 bencode 头部，前 4000 字节足够
        let s = '';
        for (let i = 0; i < Math.min(bytes.length, 4000); i++) {
            s += String.fromCharCode(bytes[i]);
        }
        const m = s.match(/\/tracker\/([a-f0-9]{32})\/announce/);
        if (m) {
            return m[1];
        }
        throw new Error('无法从 announce 提取 passkey');
    }
}

/**
 * ptzone
 */
class DriverPtzone extends Sites {
    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        return getFieldsPasskey('密匙')
    }
}

/**
 * hhanclub (憨憨)
 */
class DriverHhanclub extends Sites {
    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        const dom = getElementByKeyword('密钥', 'span');
        const value = dom.nextElementSibling.textContent.match(/[a-zA-Z0-9]+/);
        if (!value) {
            throw new Error('无法获取到密钥')
        }
        return value[0];
    }
}

/**
 * Greatposterwall
 * chainFieldsTorrentPass, chainFieldsAuthkey, chainFieldsPasskey
 */
class DriverGreatposterwall extends Sites {
    /**
     * 检查 Cookie 是否有效
     * @returns {Promise<boolean>}
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

        return document.body.innerHTML.includes('user.php?id=');
    }

    /**
     * 获取用户的 user_id
     * @returns {Promise<int>}
     */
    async chainFieldsUid() {
        const regex = /user\.php\?id=(\d+)$/;
        const user_id = getLinkHrefByDocument(document.body, regex, 1);
        if (user_id) {
            return parseInt(user_id);
        } else {
            throw new Error('无法获取到 user_id');
        }
    }

    /**
     * 获取用户的 authkey
     * @returns {Promise<string>}
     */
    async chainFieldsAuthkey() {
        const regex = /authkey=([a-zA-Z0-9]+)/;
        const value = getLinkHrefByDocument(document.body, regex, 1);
        if (value) {
            return value;
        } else {
            throw new Error('无法获取到 authkey');
        }
    }

    /**
     * 获取用户的 torrent_pass
     * @returns {Promise<string>}
     */
    async chainFieldsTorrentPass() {
        const regex = /passkey=([A-Za-z0-9]+)/;
        const value = getLinkHrefByDocument(document.body, regex, 1);
        if (value) {
            return value;
        } else {
            throw new Error('无法获取到 torrent_pass');
        }
    }

    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        return this.chainFieldsTorrentPass();
    }
}

/**
 * Hdpost
 */
class DriverHdpost extends Sites {
    /**
     * 检查 Cookie 是否有效
     * @returns {Promise<boolean>}
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

        return document.body.innerHTML.includes('/general-settings/edit');
    }

    /**
     * 获取用户的 user_id
     * @returns {Promise<string|int>}
     */
    async chainFieldsUid() {
        const regex = /users\/(.+)\/uploads$/;
        const user_id = getLinkHrefByDocument(document.body, regex, 1);
        if (user_id) {
            await Sessions.make(this.getConfig().site).setNextPage(location.origin + '/users/' + user_id);
            return user_id;
        } else {
            throw new Error('无法获取到 user_id');
        }
    }

    /**
     * 获取用户的 torrent_pass
     * @returns {Promise<string>}
     */
    async chainFieldsTorrentPass() {
        const regex = /rss\/\d+.([A-Za-z0-9]+)/;
        const value = getLinkHrefByDocument(document.body, regex, 1);
        if (value) {
            return value;
        } else {
            throw new Error('无法获取到 torrent_pass');
        }
    }

    /**
     * 获取用户的 rsskey
     * @returns {Promise<string>}
     */
    async chainFieldsRsskey() {
        return this.chainFieldsTorrentPass();
    }

    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        const currentHref = await Sessions.make(this.getConfig().site).getNextPage();
        if (!currentHref) {
            throw new Error('Session NextPage为空');
        }
        if (location.href !== currentHref) {
            location.href = currentHref;
        }

        const details = getElementByKeyword('Passkey', 'details');
        const passkey = details.querySelector('code').textContent;
        if (passkey) {
            return passkey;
        }
        throw new Error('无法获取到 Passkey');
    }
}

/**
 * Discfan
 */
class DriverDiscfan extends Sites {
    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        return get_fields_passkey('密匙');
    }
}

/**
 * nicept
 */
class DriverNicept extends Sites {
    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        return getFieldsPasskey('密匙');
    }
}

/**
 * Hdcity
 */
class DriverHdcity extends Sites {
    /**
     * 初始化
     */
    init() {
        Sites.selector.info_block = 'bottomnav';
        Sites.keyword.userdetails = 'userdetails';
    }

    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        const span = $('#kpkey');
        if (span.length === 0) {
            throw new Error('无法获取到密钥关键字')
        }

        let text = span.text();
        console.log('密钥原始 text 文本', text);
        const match = text.match(/[a-zA-Z0-9]+/);
        if (match) {
            await Sessions.make(this.getConfig().site).setNextPage(location.origin + '/pt');
            return match[0]
        }
        throw new Error('无法获取到密钥');
    }

    /**
     * 获取用户的 cuhash
     * @returns {Promise<string>}
     */
    async chainFieldsCuhash() {
        const currentHref = await Sessions.make(this.getConfig().site).getNextPage();
        if (!currentHref) {
            throw new Error('Session NextPage为空');
        }
        if (location.href !== currentHref) {
            location.href = currentHref;
        }

        const cuhash = getLinkHrefByDocument(document.body, /download\?id=(\d+)&cuhash=([a-zA-Z0-9]+)/, 2);
        if (cuhash) {
            return cuhash;
        }
        throw new Error('无法获取到 cuhash');
    }
}

/**
 * TTG
 */
class DriverTtg extends Sites {
    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        return getFieldsPasskey('Passkey');
    }
}

/**
 * MTeam
 */
class DriverMTeam extends Sites {
    /**
     * 检查 Cookie 是否有效
     * @returns {Promise<boolean>}
     */
    async isCookieValid() {
        try {
            const apiHost = localStorage.getItem('apiHost');
            const auth = localStorage.getItem('auth');
            const did = localStorage.getItem('did');
            const visitorId = localStorage.getItem('visitorId');
            console.log('isCookieValid m-team localStorage', [apiHost, auth, did, visitorId]);
        } catch (error) {
            console.error('isCookieValid m-team  Error:', error);
        }

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

        return document.body.innerHTML.includes('profile/detail/');
    }

    /**
     * 获取用户的 user_id
     * @returns {Promise<int>}
     */
    async chainFieldsUid() {
        const regex = /profile\/detail\/(\d+)$/;
        const user_id = getLinkHrefByDocument(document.body, regex, 1);
        if (user_id) {
            return parseInt(user_id);
        } else {
            throw new Error('无法获取到 user_id');
        }
    }

    /**
     * 获取用户的 x-api-key
     * @returns {Promise<*>}
     */
    async chainFieldsXApiKey() {
        const config = this.getConfig()
        const url = `${config.getProtocol()}${config.base_url}`
        const auth = localStorage.getItem('auth');
        const did = localStorage.getItem('did');
        const visitorId = localStorage.getItem('visitorId');
        const request = new Request(url, {
            'authorization': auth,
            'did': did,
            'visitorid': visitorId,
            'ts': Math.floor(Date.now() / 1000)
        })
        const result = await request.post('/api/apikey/getKeyList', '');
        if (result) {
            return result.data[0]['apiKey'];
        }
        throw new Error('无法获取到 x-api-key');
    }

    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        return '';
    }
}