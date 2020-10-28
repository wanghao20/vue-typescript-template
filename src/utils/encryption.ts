// import constants = require("constants");

/*crypto加密解密*/
const crypto = require('crypto');

// import fs = require("fs");
// import NodeRSA = require("node-rsa");
// import Keys = require("../config/Keys");
/**
 * RSA加密/解密非常慢且占用大量CPU。先使用对称算法（AES）对大输入文件进行加密，
 * 然后再使用(非对称加密)RSA密钥对该算法使用的密钥进行加密
 * 测试加密解密代码
// try {
// 	console.log('解密' + ctx.request.body.key);
// 	const dkey = ctx.request.body.key;
// 	// 客户端私钥解密数据
// 	const key = await Encryption.privateDecrypt(dkey);
// 	// 对称解密
// 	ctx.request.body.uid = await Encryption.aesDecrypt(ctx.request.body.uid, key);
// 	console.log('解密后' + ctx.request.body.uid);
// 	console.log(ctx.request.body.uid);
// } catch (error) {
// 	console.log('数据解密错误');
// }
await next();
// // 服务器公钥加密数据
// const key = Encryption.publicEncrypt(symmetryKey);
// // 对称加密
// ctx.body.key = key;
// ctx.body.data = Encryption.aesEncrypt(JSON.stringify(ctx.body.data), symmetryKey);
// console.log(ctx.body.data);
 */
export class Encryption {
    /**
     * 非对称加密
     * @description
     * 客户端私钥解密数据
     * @param {*} data 待解密数据
     * @returns utf8
     */
    // public async privateDecrypt(data: string) {
    // // 解密数据类型
    // const privateKey = new NodeRSA(Keys.clientPrivKey);
    // // padding 填充方式
    // privateKey.setOptions({ "encryptionScheme": "pkcs1" }); // 因为jsencrypt自身使用的是pkcs1加密方案, nodejs需要修改成pkcs1。
    // const decrypted = privateKey.decrypt(data, "utf8");

    // return decrypted;
    // }

    /**
     * 非对称加密
     * @description
     * 服务器公钥加密数据
     * @param {*} data 待加密数据
     * @returns base64
     */
    // public publicEncrypt(data: string) {
    //     const pubKey = new NodeRSA(Keys.serverPubKey);
    //     pubKey.setOptions({ "encryptionScheme": "pkcs1" });
    //     const encrypted = pubKey.encrypt(data, "base64");

    //     return encrypted;
    // }

    /**
     * 对称加密
     * AES_128_CBC 加密
     * @param data 加密数据体
     * @return base64
     */
    public aesEncrypt(data: string, key: string) {
        //AES对称加密
        const cipher = crypto.createCipher('aes192', key);//使用aes192加密
        const enc = cipher.update(data, "utf8", "hex");//编码方式从utf-8转为hex;
        return enc
    }

    /**
     * 对称解密
     * @param encrypt 解密数据体
     * @return utf8
     */
    public aesDecrypt(encrypt: string, key: any) {
        
        //AES对称解密
        const decipher = crypto.createDecipher('aes192', key);

        let dec = decipher.update(encrypt, "hex", "utf8");

        return dec;
    }
}
export const encryption = new Encryption();
