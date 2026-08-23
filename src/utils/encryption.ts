// crypto-js does not ship TypeScript declarations in this project.
// @ts-expect-error: CryptoJS is used through its JavaScript API.
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_AES_SECRET as string;

//encrypt password
export function encryptPassword(plainPassword: string): string {
    return CryptoJS.AES.encrypt(plainPassword, SECRET_KEY).toString();
}

//decrypt password
export function decryptPassword(encryptedPassword: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptPassword, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}