import bcrypt from "bcrypt";
import crypto from "crypto";

export const encrypt = <T>(key: string, data: T) => {
  const iv = crypto.randomBytes(8).toString("hex");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf-8", "base64");
  encrypted += cipher.final("base64");
  return Buffer.from([iv, encrypted].join("|")).toString("base64");
};

export const decrypt = <T>(key: string, value: string) => {
  value = Buffer.from(value, "base64").toString("utf-8");

  const [iv, hash] = value.split("|");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(hash, "base64", "utf-8");
  decrypted += decipher.final("utf-8");
  return JSON.parse(decrypted) as T;
};

export const Hash = {
  salt: 16,
  create(value: string) {
    return bcrypt.hash(JSON.stringify(value), this.salt);
  },
  verify(hash: string, plain: string) {
    return bcrypt.compare(hash, plain);
  },
};
