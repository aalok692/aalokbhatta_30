import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { deleteImage, saveImage } from "./localStorage.js";

test("local storage rejects content whose bytes do not match its image MIME type", async () => {
  await assert.rejects(
    saveImage({ buffer: Buffer.from("<svg></svg>"), mimetype: "image/png" }),
    { statusCode: 400, message: "The uploaded file does not match a supported image format." }
  );
});

test("local storage creates optimized WebP variants and deletes both files", async () => {
  const input = await sharp({
    create: { width: 900, height: 600, channels: 3, background: { r: 30, g: 90, b: 50 } }
  }).png().toBuffer();
  const stored = await saveImage({ buffer: input, mimetype: "image/png" });
  assert.match(stored.imageUrl, /^\/uploads\/[\da-f-]+\.webp$/);
  assert.match(stored.thumbnailUrl, /-thumb\.webp$/);
  await deleteImage(stored.storageKey);
});
