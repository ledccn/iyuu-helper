import CryptoJS from '/assets/module/crypt.js';
import Aes from '/assets/module/aes.js';

const passphrase = 'e7cc9277cdd4bdce6b51d1e5d2245db9';    // 替换为实际的密钥
const plainText = 'Hello, World!';
//const iv = CryptoJS.enc.Hex.parse('efbe32aa615391c3c25f774417af151b');
const iv = CryptoJS.lib.WordArray.random(16); // 生成随机的 16 字节 IV //CryptoJS.enc.Utf8.parse(iv)
const ciphertext = Aes.encrypt(plainText, passphrase);
console.log('加密与解密之一', ciphertext, Aes.decrypt(ciphertext, passphrase));

// 使用CBC模式的AES加密
const encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS.enc.Hex.parse(passphrase), {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: iv
}).toString();

// 对应的解密
const decrypted = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Hex.parse(passphrase), {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: iv
}).toString(CryptoJS.enc.Utf8);

console.log('加密与解密之二', encrypted, decrypted, iv.toString());
