import Store from '/assets/module/store.js';

const SITE_STATUS = 'SITE_STATUS';

/**
 * 站点状态缓存
 */
class Status extends Store {
    /**
     * 设置缓存数据键
     * @param {string} storeKey
     */
    setStoreKey(storeKey) {
        this.storeKey = SITE_STATUS + storeKey;
    }

    /**
     * 创建对象
     * @returns {Status}
     */
    static make() {
        return new Status('');
    }
}

export {Status}
export default Status;