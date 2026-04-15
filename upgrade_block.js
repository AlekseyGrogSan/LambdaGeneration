const fs = require('fs');

const modals = ['frontend/src/PostCreationModal.js', 'frontend/src/EditArticleModal.js'];
const modalReplacement = "const codeHTML = `<br><table class=\"tg-code-block code-block-table\" style=\"width: 100%; background: #282c34; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); border-collapse: separate; border-spacing: 0; margin: 14px 0; overflow: hidden; table-layout: fixed;\"><thead><tr><th style=\"padding: 6px 12px; background: #21252b; color: rgba(255,255,255,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; text-align: left; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.12); user-select: none;\">${lang || 'code'}</th></tr></thead><tbody><tr><td style=\"padding: 12px; overflow-x: auto;\"><pre style=\"margin: 0; white-space: pre-wrap !important; word-wrap: break-word; background: transparent;\"><code class=\"${lang ? 'language-' + lang : 'language-text'}\" style=\"font-family: Consolas, monospace; font-size: 14px; background: transparent !important; padding: 0 !important; border: none !important;\">// Ваш код...</code></pre></td></tr></tbody></table><br><div style=\"min-height: 20px;\"></div>`;";

modals.forEach(p => {
    if (!fs.existsSync(p)) return;
    let text = fs.readFileSync(p, 'utf-8');
    const oldHtmlRegex = /const codeHTML = `<br><pre class="tg-code-block"[^`]+><\/div>`;/;
    if (oldHtmlRegex.test(text)) {
        text = text.replace(oldHtmlRegex, modalReplacement);
        fs.writeFileSync(p, text);
    }
});

let cf = fs.readFileSync('frontend/src/contentFormatting.js', 'utf-8');
cf = cf.replace(
    /return `<pre class="tg-code-block"[^`]+<\/pre>`;/,
    "return `<table class=\"tg-code-block code-block-table\" style=\"width: 100%; background: #282c34; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); border-collapse: separate; border-spacing: 0; margin: 14px 0; overflow: hidden; table-layout: fixed;\"><thead><tr><th style=\"padding: 6px 12px; background: #21252b; color: rgba(255,255,255,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; text-align: left; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.12); user-select: none;\">${escapeHtml(language)}</th></tr></thead><tbody><tr><td style=\"padding: 12px; overflow-x: auto;\"><pre style=\"margin: 0; white-space: pre-wrap !important; word-wrap: break-word; background: transparent;\"><code class=\"language-${escapeHtml(language)}\" style=\"font-family: Consolas, monospace; font-size: 14px; background: transparent !important; padding: 0 !important; border: none !important;\">${escapeHtml(codeText)}</code></pre></td></tr></tbody></table>`;"
);
fs.writeFileSync('frontend/src/contentFormatting.js', cf);

['frontend/src/PostDetailPage.js', 'frontend/src/PostCard.js'].forEach(p => {
    let t = fs.readFileSync(p, 'utf-8');
    t = t.replace(/&\s*\.tg-code-block':\s*\{[\s\S]*?fontSize:\s*'0\.(95|85)rem',\s*\},\n*.*&\s*\.hljs, &\s*\.code-block-table':\s*\{\s*background:\s*'transparent !important',\s*padding:\s*'0 !important',\s*border:\s*'none !important'\s*\},\n/g, "");
    fs.writeFileSync(p, t);
});

console.log("Upgraded code block to separate styled table!");