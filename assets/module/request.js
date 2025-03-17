/**
 * 请求类
 */
class Request {
    /**
     * 构造函数
     * @param {string} baseURL 请求的根URL
     * @param {object} headers 请求头
     */
    constructor(baseURL = '', headers = {}) {
        /**
         * 根URL
         * @type {string}
         */
        this.baseURL = baseURL;
        /**
         * 请求头
         * @type {Object}
         */
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...headers,
        };
    }

    /**
     * 发送请求
     * @param {string} url
     * @param {object} options
     * @returns {Promise<any|string>}
     */
    async request(url, options = {}) {
        const {method = 'GET', body, headers = {}, timeout = 10000, ...restOptions} = options;
        const fullUrl = this.baseURL + url;
        const requestOptions = {
            method,
            headers: {
                ...this.headers,
                ...headers
            },
            ...restOptions,
        };

        if (body && method !== 'GET' && method !== 'HEAD') {
            requestOptions.body = JSON.stringify(body);
        }

        const controller = new AbortController();
        const signal = controller.signal;

        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);

        try {
            const response = await fetch(fullUrl, {...requestOptions, signal});
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Fetch aborted due to timeout');
            } else {
                console.error('Fetch error:', error);
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * GET请求
     * @param {string} url
     * @param {object} options
     * @returns {Promise<*|string>}
     */
    get(url, options = {}) {
        return this.request(url, {method: 'GET', ...options});
    }

    /**
     * POST请求
     * @param {string} url
     * @param {*} body
     * @param {object} options
     * @returns {Promise<*|string>}
     */
    post(url, body, options = {}) {
        return this.request(url, {method: 'POST', body, ...options});
    }

    /**
     * POST请求
     * @param {string} url
     * @param {*} body
     * @param {object} options
     * @returns {Promise<*|string>}
     */
    put(url, body, options = {}) {
        return this.request(url, {method: 'PUT', body, ...options});
    }

    /**
     * POST请求
     * @param {string} url
     * @param {*} body
     * @param {object} options
     * @returns {Promise<*|string>}
     */
    patch(url, body, options = {}) {
        return this.request(url, {method: 'PATCH', body, ...options});
    }

    /**
     * POST请求
     * @param {string} url
     * @param {object} options
     * @returns {Promise<*|string>}
     */
    delete(url, options = {}) {
        return this.request(url, {method: 'DELETE', ...options});
    }
}

export {
    Request
};
export default Request;