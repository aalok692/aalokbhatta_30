import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const directory = fileURLToPath(new URL("../../../uploads/", import.meta.url));

function isValidImage(buffer, mimeType) {
  if (mimeType === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === "image/gif") return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString());
  if (mimeType === "image/webp") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  return false;
}

export async function saveImage(file) {
  if (!isValidImage(file.buffer, file.mimetype)) {
    const error = new Error("The uploaded file does not match a supported image format.");
    error.statusCode = 400;
    throw error;
  }
  let metadata;
  try {
    metadata = await sharp(file.buffer, { limitInputPixels: 40000000 }).metadata();
  } catch {
    const error = new Error("The uploaded image could not be decoded.");
    error.statusCode = 400;
    throw error;
  }
  if (!metadata.width || !metadata.height || metadata.width * metadata.height > 40000000) {
    const error = new Error("The uploaded image dimensions are not supported.");
    error.statusCode = 400;
    throw error;
  }
  const imageId = randomUUID();
  const storageKey = `${imageId}.webp`;
  const thumbnailKey = `${imageId}-thumb.webp`;
  await mkdir(directory, { recursive: true });
  const mainImage = await sharp(file.buffer, { limitInputPixels: 40000000 })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const thumbnail = await sharp(file.buffer, { limitInputPixels: 40000000 })
    .rotate()
    .resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  await writeFile(path.join(directory, storageKey), mainImage, { flag: "wx" });
  try {
    await writeFile(path.join(directory, thumbnailKey), thumbnail, { flag: "wx" });
  } catch (error) {
    await unlink(path.join(directory, storageKey));
    throw error;
  }
  return {
    storageKey,
    imageUrl: `/uploads/${storageKey}`,
    thumbnailUrl: `/uploads/${thumbnailKey}`
  };
}

export async function deleteImage(storageKey) {
  if (!/^[\da-f-]+\.webp$/i.test(storageKey)) {
    throw new Error("Invalid storage key.");
  }
  const keys = [storageKey, `${path.basename(storageKey, ".webp")}-thumb.webp`];
  for (const key of keys) {
    try {
      await unlink(path.join(directory, key));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}
