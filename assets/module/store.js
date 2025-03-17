import Storage from '/assets/module/storage.js';

/**
 * 数据仓基础类
 */
class Store {
    /**
     * 构造函数
     * @param {string} storeKey 缓存数据键
     */
    constructor(storeKey) {
        if (typeof storeKey !== 'string') {
            throw new Error('无效的数据键名');
        }
        this.setStoreKey(storeKey);
    }

    /**
     * 设置缓存数据键
     * @param {string} storeKey
     */
    setStoreKey(storeKey) {
        this.storeKey = storeKey;
    }

    /**
     * 获取缓存数据键
     * @returns {string}
     */
    getStoreKey() {
        return this.storeKey;
    }

    /**
     * 获取会话数据
     * @returns {Promise<*|null>}
     */
    async get() {
        const key = this.getStoreKey();
        const items = await Storage.local().get(key);
        return items[key] || null;
    }

    /**
     * 设置会话数据
     * @param {object} items
     * @returns {Promise<void>}
     */
    async set(items) {
        return Storage.local().set({[this.getStoreKey()]: items});
    }

    /**
     * 更新会话数据
     * @param items
     * @returns {Promise<void>}
     */
    async update(items) {
        const last = (await this.get()) || {};
        return this.set({...last, ...items});
    }

    /**
     * 删除会话数据
     * @returns {Promise<void>}
     */
    async remove() {
        return Storage.local().remove(this.getStoreKey())
    }

    /**
     * 设置一个会话数据项
     * @param {string} key
     * @param {any} value
     * @returns {Promise<void>}
     */
    async setItem(key, value) {
        const items = (await this.get()) || {};
        items[key] = value;
        return this.set(items);
    }

    /**
     * 移除一个会话数据项
     * @param {string} key
     * @returns {Promise<void>}
     */
    async removeItem(key) {
        const items = (await this.get()) || {};
        delete items[key];
        return this.set(items);
    }

    /**
     * 获取一个会话数据项
     * @param {string} key
     * @returns {Promise<*|null>}
     */
    async getItem(key) {
        const items = (await this.get()) || {};
        return items[key] || null;
    }
}

export {Store}
export default Store;