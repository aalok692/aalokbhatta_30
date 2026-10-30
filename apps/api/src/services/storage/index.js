import * as localStorage from "./localStorage.js";

const adapters = { local: localStorage };

function getAdapter() {
  const provider = process.env.STORAGE_PROVIDER || "local";
  const adapter = adapters[provider];
  if (!adapter) {
    const error = new Error(`Storage provider "${provider}" is not implemented.`);
    error.statusCode = 501;
    throw error;
  }
  return adapter;
}

export function saveImage(file) {
  return getAdapter().saveImage(file);
}

export function deleteImage(storageKey) {
  return getAdapter().deleteImage(storageKey);
}
