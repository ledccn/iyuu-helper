/**
 * Storage类，用于操作Chrome存储
 */
class Storage {
    /**
     * 构造函数，初始化存储对象
     * @param store - 存储类型，可以是 'local'、'sync' 或 'session'
     */
    constructor(store = 'local') {
        switch (store) {
            case 'sync':
                this.StorageArea = chrome.storage.sync;
                break;
            case 'session':
                this.StorageArea = chrome.storage.session;
                break;
            default:
                this.StorageArea = chrome.storage.local;
                break;
        }
    }

    /**
     * 创建一个Storage实例
     * @param {string} store - 存储类型，可以是 'local'、'sync' 或 'session'
     * @returns {Storage}
     */
    static store(store = 'local') {
        return new Storage(store);
    }

    /**
     * 创建一个Storage实例
     * @returns {Storage} 使用的存储区域为chrome.storage.local
     */
    static local() {
        return new Storage('local');
    }

    /**
     * 创建一个Storage实例
     * @returns {Storage} 使用的存储区域为chrome.storage.session
     */
    static session() {
        return new Storage('session');
    }

    /**
     * 获取存储的数据
     * @param {string | string[] | Object} keys - 要获取的键，可以是字符串、字符串数组或对象
     * @returns {Promise<Object>}
     */
    async get(keys) {
        return this.StorageArea.get(keys);
    }

    /**
     * 设置存储的数据
     * @param {Object} items - 要存储的对象
     * @returns {Promise<void>}
     */
    async set(items) {
        return this.StorageArea.set(items);
    }

    /**
     * 删除存储的数据
     * @param {string | string[]} keys - 要删除的键，可以是字符串或字符串数组
     * @returns {Promise<void>}
     */
    async remove(keys) {
        return this.StorageArea.remove(keys);
    }
}

// 示例调用
// (async () => {
//     try {
//         // 设置数据
//         await Storage.store().set({ key1: 'value1', key2: 'value2' });
//         console.log('Data set successfully');
//
//         // 获取数据
//         const data = await Storage.store().get(['key1', 'key2']);
//         console.log('Data retrieved:', data);
//
//         // 删除数据
//         await Storage.store().delete(['key1']);
//         console.log('Data deleted successfully');
//     } catch (error) {
//         console.error('Error:', error);
//     }
// })();

export {
    Storage
}
export default Storage;