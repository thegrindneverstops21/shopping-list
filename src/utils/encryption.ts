import CryptoJS from "crypto-js";

function getSecretKey(): string {
    const key = import.meta.env.VITE_AES_SECRET?.trim();
    // Vite reads .env at startup. Explain missing setup instead of crashing inside AES.
    if (!key) throw new Error("Password setup is missing. Set VITE_AES_SECRET in .env and restart the app.");
    return key;
}

// AES is reversible; a real application must hash passwords on the server.
export function encryptPassword(plainPassword: string): string {
    return CryptoJS.AES.encrypt(plainPassword, getSecretKey()).toString();
}

// Login needs the same key that was used when the account was created.
export function decryptPassword(encryptedPassword: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, getSecretKey());
    return bytes.toString(CryptoJS.enc.Utf8);
}
