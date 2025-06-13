import fs from "fs";
import path from "path";
import os from "os";

/**
 * CacheManager handles simple file-based caching with TTL (time-to-live) support.
 *
 * Each cache entry is stored as a separate JSON file in the specified cachePath directory.
 * The cache file is named after the provided cache name (e.g., "mycache.json").
 *
 * TTL (in milliseconds) controls how long the cache is valid:
 *   - If ttl === 0, the cache never expires until manually cleared.
 *   - If ttl > 0, the cache expires after the specified duration.
 */
export class CacheManager {

    /** The path to the cache directory */
    private cachePath: string;

    /**
     * Create a new CacheManager.
     */
    constructor() {
        this.cachePath = process.env.CACHE_DIR || os.homedir() + "/.todoist-mcp-server/";
        if (!fs.existsSync(this.cachePath)) {
            try {
                fs.mkdirSync(this.cachePath, { recursive: true });
            } catch (error) {
                console.error(`Failed to create cache directory at ${this.cachePath}:`, error);
                throw error;
            }
        }
    }

    /**
     * Retrieve cached data by name, if not expired.
     *
     * @param name The cache name (file will be `${name}.json`)
     * @returns The cached data array, or null if not found or expired.
     *
     * If ttl === 0, the cache never expires until manually cleared.
     */
    getCache(name: string): Array<any> | null {
        const fullPath = path.join(this.cachePath, `${name}.json`);

        if (!fs.existsSync(fullPath)) return null;

        try {
            const cache = JSON.parse(fs.readFileSync(fullPath, "utf8"));
            if (
                typeof cache.timestamp === "number" &&
                typeof cache.ttl === "number" &&
                Array.isArray(cache.data)
            ) {
                if (cache.ttl === 0 || Date.now() < cache.timestamp + cache.ttl) {
                    // ttl === 0 means never expire
                    return cache.data;
                } else {
                    // Cache expired, remove file
                    fs.unlinkSync(fullPath);
                    return null;
                }
            }
            // Fallback for legacy cache
            return cache.data || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Store data in the cache under the given name, with a timestamp and TTL.
     *
     * @param name The cache name (file will be `${name}.json`)
     * @param data The array of objects to cache.
     * @param ttl Time to live in ms (default 5 minutes). If 0, cache never expires.
     */
    setCache(name: string, data: Array<any>, ttl: number = 300000): void {
        const fullPath = path.join(this.cachePath, `${name}.json`);
        const cache = {
            timestamp: Date.now(),
            ttl: ttl,
            data: data,
        };
        fs.writeFileSync(fullPath, JSON.stringify(cache));
    }

    /**
     * Delete a cache file by name.
     *
     * @param name The cache name (file will be `${name}.json`)
     * @returns true if the file was deleted, false if not found.
     */
    deleteCache(name: string): boolean {
        const fullPath = path.join(this.cachePath, `${name}.json`);
        if (!fs.existsSync(fullPath)) return false;
        try {
            fs.unlinkSync(fullPath);
            return true;
        } catch (e) {
            console.error(`Failed to delete cache file at ${fullPath}:`, e);
            return false;
        }
    }
} 
