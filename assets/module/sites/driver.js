import Sites from '/assets/module/sites/sites.js';
import Sessions from '/assets/module/sessions.js';

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
        if (!dom) {
            throw new Error('无法获取到密钥关键字')
        }
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
        return 'x-api-key';
    }

    /**
     * 获取用户的 passkey
     * @returns {Promise<string>}
     */
    async chainFieldsPasskey() {
        return 'Passkey';
    }
}