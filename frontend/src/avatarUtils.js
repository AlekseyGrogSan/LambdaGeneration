export const DEFAULT_AVATAR_SRC = '/default-avatar.png';
export const MAX_AVATAR_BYTES = 10 * 1024 * 1024;
export const MAX_ARTICLE_IMAGE_BYTES = 10 * 1024 * 1024;

const ABSOLUTE_URL_RE = /^(https?:)?\/\//i;

const isAbsoluteLike = (value = '') => (
    ABSOLUTE_URL_RE.test(value) || value.startsWith('blob:') || value.startsWith('data:')
);

const toAssetOrigin = (apiBaseUrl = '') => String(apiBaseUrl).replace(/\/api\/?$/i, '');

const ensureLeadingSlash = (path = '') => (path.startsWith('/') ? path : `/${path}`);

const extractWebPath = (inputPath = '') => {
    const p = String(inputPath).replace(/\\/g, '/');
    const low = p.toLowerCase();

    const marker = '/wwwroot/';
    const idxWwwroot = low.indexOf(marker);
    if (idxWwwroot >= 0) {
        // C:/.../wwwroot/uploads/a.png  или /app/wwwroot/uploads/a.png -> /uploads/a.png
        return ensureLeadingSlash(p.slice(idxWwwroot + marker.length));
    }

    const knownDirs = ['/uploads/', '/articles_uploads/', '/avatars/'];
    for (const dir of knownDirs) {
        const idx = low.indexOf(dir);
        if (idx >= 0) return ensureLeadingSlash(p.slice(idx));
    }

    return '';
};

const toWebRootRelativePath = (rawPath = '') => {
    if (!rawPath) return '';

    let p = String(rawPath).trim().replace(/^["']|["']$/g, '').replace(/\\/g, '/');
    p = p.replace(/^~\//, '/');

    // Сначала пытаемся вырезать от wwwroot/known dirs (важно для абсолютных путей Linux/Windows)
    const extracted = extractWebPath(p);
    if (extracted) return extracted;

    // Уже корректный web-path
    if (p.startsWith('/')) return p;

    // Относительный путь: uploads/a.png, articles_uploads/a.png
    return ensureLeadingSlash(p.replace(/^\/+/, ''));
};

const buildFileUrl = (apiBaseUrl, rawPath, fallback = '') => {
    if (!rawPath) return fallback;

    const input = String(rawPath).trim();
    if (!input) return fallback;
    if (isAbsoluteLike(input)) return input;

    const webPath = toWebRootRelativePath(input);
    if (!webPath) return fallback;

    return `${toAssetOrigin(apiBaseUrl)}${webPath}`;
};

export const buildAvatarUrl = (apiBaseUrl, avatarPath) => {
    if (!avatarPath) return DEFAULT_AVATAR_SRC;

    const raw = String(avatarPath).trim();

    // Если пришло просто имя файла "abc.png", считаем что это /uploads/abc.png
    if (!isAbsoluteLike(raw) && !raw.includes('/') && !raw.includes('\\')) {
        return buildFileUrl(apiBaseUrl, `/uploads/${raw}`, DEFAULT_AVATAR_SRC);
    }

    return buildFileUrl(apiBaseUrl, raw, DEFAULT_AVATAR_SRC);
};

export const buildArticleImageUrl = (apiBaseUrl, imagePath) => {
    if (!imagePath) return '';

    const raw = String(imagePath).trim();

    // Если пришло только имя файла: "abc.jpg"
    if (!isAbsoluteLike(raw) && !raw.includes('/') && !raw.includes('\\')) {
        return buildFileUrl(apiBaseUrl, `/articles_uploads/${raw}`, '');
    }

    return buildFileUrl(apiBaseUrl, raw, '');
};

export const isAvatarTooLarge = (file, maxBytes = MAX_AVATAR_BYTES) => {
    if (!file) return false;
    return file.size > maxBytes;
};

export const isArticleImageTooLarge = (file, maxBytes = MAX_ARTICLE_IMAGE_BYTES) => {
    if (!file) return false;
    return file.size > maxBytes;
};

export const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / (1024 ** index);
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};
