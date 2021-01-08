/**
 * Functions for interfacing with the npm API
 */

import fetch from "node-fetch";
import * as cacache from "cacache";

import { CACHE_EXPIRY } from "./constants";
import { npmCachePath } from "./paths";

export const getPackageDetails = async (packageName: string): Promise<Record<string, unknown>> => {
  const now = Date.now();
  const cacheKey = `registry.npmjs.org|${packageName}`;
  const cacheInfo = await cacache.get.info(npmCachePath, cacheKey);

  if (cacheInfo && cacheInfo.time + CACHE_EXPIRY > now) {
    // Return cached object
    const cachedData = await cacache.get(npmCachePath, cacheKey);
    return JSON.parse(cachedData.data.toString());
  }

  // Fetch from node
  return fetch(`https://registry.npmjs.org/${packageName}`)
    .then((response) => response.text())
    .then(async (data) => {
      await cacache.put(npmCachePath, cacheKey, data);
      return JSON.parse(data);
    });
};

export const clearCache = async (): Promise<void> => {
  cacache.rm.all(npmCachePath);
};
