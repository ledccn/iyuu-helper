/**
 * 工具类
 */
class Utils {
    /**
     * 函数组合工具
     * @param fns
     * @returns {function(*): *}
     */
    static pipeline(...fns) {
        return (input) => fns.reduce((acc, fn) => fn(acc), input);
    }

    /**
     * 延迟解决
     * - 延迟执行函数或返回值
     * @param {function|*} value 可执行函数或值
     * @param {number} timeout 延迟时间，单位毫秒
     * @returns {Promise<*>}
     */
    static async delayResolve(value, timeout = 5000) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const type = typeof value;
                    console.log(`delayResolve type: ${type}`)
                    if (type === 'function') {
                        let result = value();
                        resolve(result);
                    } else {
                        resolve(value);
                    }
                } catch (e) {
                    reject(e);
                }
            }, timeout);
        });
    }
}

export {
    Utils
}
export default Utils;