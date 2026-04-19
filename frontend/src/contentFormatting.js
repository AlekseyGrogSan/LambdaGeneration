import DOMPurify from 'isomorphic-dompurify';

const FENCED_CODE_REGEX = /```\s*([a-zA-Z0-9_+\-.#]*)?\s*\r?\n([\s\S]*?)\r?\n```/g;

const CODE_LANGUAGE_ALIASES = {
    'c#': 'csharp',
    'cs': 'csharp',
    'c++': 'cpp',
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'shell': 'bash',
    'sh': 'bash',
    'plaintext': 'text',
    'txt': 'text',
    'none': 'text',
};

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

const normalizeCodeText = (rawCode) => {
    let str = String(rawCode)
        .replace(/\r\n?/g, '\n')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<div[^>]*>/gi, '\n')
        .replace(/<\/div>/gi, '')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<\/p>/gi, '')
        .replace(/<[^>]+>/g, '');

    return decodeHtmlEntities(str)
        .replace(/\u200b/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

export const normalizeCodeLanguage = (rawLanguage = '') => {
    const normalized = String(rawLanguage || '')
        .trim()
        .toLowerCase();

    if (!normalized) return 'text';
    return CODE_LANGUAGE_ALIASES[normalized] || normalized;
};

export const formatCodeLanguageLabel = (rawLanguage = '') => {
    const language = normalizeCodeLanguage(rawLanguage);
    if (language === 'text') return 'Text';
    return language.charAt(0).toUpperCase() + language.slice(1);
};

const toTelegramLikeCodeBlock = (lang, code) => {
    const language = normalizeCodeLanguage(lang);
    const languageLabel = formatCodeLanguageLabel(language);
    const codeText = normalizeCodeText(code);
    return `<table class="tg-code-block code-block-table" data-language="${escapeHtml(language)}" style="width: 100%; background: #282c34; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); border-collapse: separate; border-spacing: 0; margin: 14px 0; overflow: hidden; table-layout: fixed;"><thead><tr><th style="padding: 2px 6px; background: #21252b; color: rgba(255,255,255,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-align: left; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.12); user-select: none;">${escapeHtml(languageLabel)}</th></tr></thead><tbody><tr><td style="padding: 10px; overflow-x: auto;"><pre style="margin: 0; white-space: pre-wrap !important; word-wrap: break-word; background: transparent;"><code class="language-${escapeHtml(language)}" style="font-family: Consolas, monospace; font-size: 14px; background: transparent !important; padding: 0 !important; border: none !important;">${escapeHtml(codeText)}</code></pre></td></tr></tbody></table>`;
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

    let htmlContent = contentWithCodeBlocks;

    // Apply safe HTML tags strictly
    if (!hasHtmlTag(contentWithCodeBlocks)) {
        htmlContent = escapeHtml(contentWithCodeBlocks).replace(/\n/g, '<br />');      
    }

    // Sanitize any resulting HTML output from script tags and malformed input
    return DOMPurify.sanitize(htmlContent, {
        ADD_TAGS: ['iframe'], // if you need youtube/embed functionality
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
    });
};
