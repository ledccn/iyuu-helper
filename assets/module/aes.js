import CryptoJS from '/assets/module/crypt.js';

/**
 * AES加解密
 */
class Aes {
    /**
     * 加密
     * @param {String} plainText
     * @param {String} passphrase
     * @returns {string}
     */
    static encrypt(plainText, passphrase) {
        return CryptoJS.AES.encrypt(plainText, passphrase).toString();
    }

    /**
     * 解密
     * @param {String} encryptedData
     * @param {String} passphrase
     * @returns {string}
     */
    static decrypt(encryptedData, passphrase) {
        return CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8);
    }

    /**
     * 获取CryptoJS
     * @returns {CryptoJS}
     */
    static getCryptoJS() {
        return CryptoJS;
    }
}

export {Aes}
export default Aes;