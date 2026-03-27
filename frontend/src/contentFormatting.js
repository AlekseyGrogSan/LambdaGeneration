const FENCED_CODE_REGEX = /```\s*([a-zA-Z0-9_+\-.#]*)?\s*\r?\n([\s\S]*?)\r?\n```/g;

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const decodeHtmlEntities = (value) => String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&');

const normalizeCodeText = (rawCode) => decodeHtmlEntities(String(rawCode)
    .replace(/\r\n?/g, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/div>\s*<div[^>]*>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/\u200b/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim());

const toTelegramLikeCodeBlock = (lang, code) => {
    const language = (lang || 'text').trim().toLowerCase() || 'text';
    const codeText = normalizeCodeText(code);
    return `<pre class="tg-code-block"><code class="language-${escapeHtml(language)}">${escapeHtml(codeText)}</code></pre>`;
};

const hasHtmlTag = (value) => /<\/?[a-z][\s\S]*>/i.test(value);

export const normalizeContentForSubmit = (content = '') => {
    if (!content) return '';
    return String(content).replace(FENCED_CODE_REGEX, (_, lang, code) => toTelegramLikeCodeBlock(lang, code));
};

export const formatContentForRender = (content = '') => {
    if (!content) return '';

    const normalized = String(content).replace(/\r\n?/g, '\n');
    const contentWithCodeBlocks = normalized.replace(FENCED_CODE_REGEX, (_, lang, code) => toTelegramLikeCodeBlock(lang, code));

    if (!hasHtmlTag(contentWithCodeBlocks)) {
        return escapeHtml(contentWithCodeBlocks).replace(/\n/g, '<br />');
    }

    return contentWithCodeBlocks;
};
