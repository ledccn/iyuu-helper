/**
 * 成功码
 * @type {number}
 */
const SUCCESS_CODE = 0;

/**
 * 响应类
 */
class Response {
    /**
     * 构造函数
     * @param {Object} response
     */
    constructor(response) {
        try {
            this.code = response.code;
            this.data = response.data || {};
            this.msg = response.msg || '';
        } catch (e) {
        }
    }

    /**
     * 是否失败
     * @returns {boolean}
     */
    isFailed() {
        return !this.isSuccessful();
    }

    /**
     * 是否成功
     * @returns {boolean}
     */
    isSuccessful() {
        return this.code === SUCCESS_CODE;
    }

    /**
     * Json 响应体
     * @param {number} code
     * @param {*} data
     * @param {String} msg
     * @returns {{code: *, data: *, msg: *}}
     */
    static json(code, data = {}, msg = 'ok') {
        return {
            code: code,
            data: data,
            msg: msg
        }
    }

    /**
     * 成功响应
     * @param {String} msg
     * @param {*} data
     * @returns {{code: *, data: *, msg: *}}
     */
    static success(msg = 'ok', data = {}) {
        return Response.json(SUCCESS_CODE, data, msg);
    }

    /**
     * 数据响应
     * @param {*} data
     * @returns {{code: *, data: *, msg: *}}
     */
    static data(data = {}) {
        return Response.json(SUCCESS_CODE, data);
    }

    /**
     * 失败响应
     * @param {String} msg
     * @param {*} data
     * @param {number} code
     * @returns {{code: *, data: *, msg: *}}
     */
    static fail(msg = 'fail', data = {}, code = -1) {
        return Response.json(code === SUCCESS_CODE ? -1 : code, data, msg);
    }
}

export {
    Response
}
export default Response;