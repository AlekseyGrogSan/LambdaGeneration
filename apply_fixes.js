const fs = require('fs');

// 1. contentFormatting.js
let cfPath = 'frontend/src/contentFormatting.js';
let cf = fs.readFileSync(cfPath, 'utf8');

cf = cf.replace(
    /return `<pre class="tg-code-block"><code class="language-\$\{escapeHtml\(language\)\}">(.*?)<\/code><\/pre>`;/g,
    'return `<pre class="tg-code-block" style="background: #282c34; border-radius: 8px; padding: 12px; margin: 10px 0; overflow-x: auto; white-space: pre-wrap !important;"><code class="language-${escapeHtml(language)}" style="font-family: Consolas, monospace; font-size: 14px;">${escapeHtml(codeText)}</code></pre>`;'
);
fs.writeFileSync(cfPath, cf);

// 2. Modals
const tableRegex = /const codeHTML = `<br><table class="code-block-table"[\s\S]*?<\/table><br><div style="min-height: 20px;"><\/div>`;/g;
const preHtml = "const codeHTML = `<br><pre class=\"tg-code-block\" style=\"background: #282c34; border-radius: 8px; padding: 12px; margin: 10px 0; overflow-x: auto; white-space: pre-wrap !important;\"><code class=\"${lang ? 'language-' + lang : 'language-text'}\" style=\"font-family: Consolas, monospace; font-size: 14px;\">// Ваш код...</code></pre><br><div style=\"min-height: 20px;\"></div>`;";

['frontend/src/PostCreationModal.js', 'frontend/src/EditArticleModal.js'].forEach(p => {
    if(!fs.existsSync(p)) return;
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(tableRegex, preHtml);
    fs.writeFileSync(p, text);
});

// 3. PostCard and PostDetailPage (Strip hljs transparent override)
['frontend/src/PostCard.js', 'frontend/src/PostDetailPage.js'].forEach(p => {
    if(!fs.existsSync(p)) return;
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/&\s*\.hljs':\s*\{\s*background:\s*'transparent\s*!important',\s*padding:\s*'0\s*!important'\s*\},/g, '');
    fs.writeFileSync(p, text);
});

// 4. normalizer in PostDetailPage.js
let pdp = fs.readFileSync('frontend/src/PostDetailPage.js', 'utf8');
let newNorm = `const normalizeCodeBlockText = (block) => {
    let html = block.innerHTML || '';
    html = html.replace(/<br\\s*[\\/]?>/gi, '\\n');
    html = html.replace(/<\\/?div[^>]*>/gi, '\\n');
    html = html.replace(/<p[^>]*>/gi, '\\n');
    html = html.replace(/<\\/p>/gi, '');
    
    // Create a temporary element to properly decode HTML entities
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Get text content, returning newlines as expected
    return (temp.innerText || temp.textContent || '')
        .replace(/\\r\\n?/g, '\\n')
        .replace(/\\u200b/g, '')
        .trim();
};`;
pdp = pdp.replace(/const normalizeCodeBlockText = \(block\) => \{[\s\S]*?return \(temp\.value \|\| ''\).*?\.trim\(\);\n\};/, newNorm);
fs.writeFileSync('frontend/src/PostDetailPage.js', pdp);

// 5. CSS
let css = fs.readFileSync('frontend/src/index.css', 'utf8');
if (!css.includes('.tg-code-block code')) {
    css += '\n/* Fix codeblocks rendering and synicing */\n.code-block-table pre, .code-block-table code, .tg-code-block code, .tg-code-block pre {\n    white-space: pre-wrap !important;\n    word-wrap: break-word !important;\n    overflow-x: auto !important;\n}\n';
    css += '.hljs {\n    background: #282c34 !important;\n    color: #abb2bf !important;\n    border-radius: 8px;\n}\n';
    fs.writeFileSync('frontend/src/index.css', css);
}

console.log("Patches applied.");
