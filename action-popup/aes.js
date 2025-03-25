import CryptoJS from '/assets/module/crypt.js';

const passphrase = 'mySecretPassphrase';    // 替换为实际的密钥
const plainText = 'Hello, World!';
const iv = CryptoJS.lib.WordArray.random(16); // 生成随机的 16 字节 IV
const ciphertext = encrypt(plainText, passphrase);
console.log('加密与解密之一', ciphertext, decrypt(ciphertext, passphrase));

// 使用CBC模式的AES加密
const encrypted = CryptoJS.AES.encrypt(plainText, passphrase, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: CryptoJS.enc.Utf8.parse(iv)
}).toString();

// 对应的解密
const decrypted = CryptoJS.AES.decrypt(encrypted, passphrase, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: CryptoJS.enc.Utf8.parse(iv)
}).toString(CryptoJS.enc.Utf8);

console.log('加密与解密之二', encrypted, decrypted);

/**
 * 加密
 * @param {String} plainText
 * @param {String} passphrase
 * @returns {string}
 */
function encrypt(plainText, passphrase) {
    return CryptoJS.AES.encrypt(plainText, passphrase).toString();
}

/**
 * 解密
 * @param {String} encryptedData
 * @param {String} passphrase
 * @returns {string}
 */
function decrypt(encryptedData, passphrase) {
    return CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8);
}
