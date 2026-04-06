import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "my-secret-key-123";

const SecureStorage = {
  // 1. Save Data (Encrypts it first)
  setItem: (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(jsonValue, SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error("Error saving to secure storage", error);
    }
  },

  // 2. Get Data (Decrypts it)
  getItem: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      return decrypted ? JSON.parse(decrypted) : null;
    } catch (error) {
      console.error("Error reading from secure storage", error);
      return null;
    }
  },

  // 3. Remove Data
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
};

export default SecureStorage;
