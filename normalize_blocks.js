const fs = require('fs');

const effectReplacement = `    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.querySelectorAll('pre code').forEach((block) => {
                if (!block.dataset.highlighted) {
                    const codeText = normalizeCodeBlockText(block);

                    const languageClass = Array.from(block.classList).find((cls) => cls.startsWith('language-'));
                    let language = languageClass ? languageClass.replace('language-', '') : '';
                    if (!language || language === 'text') {
                        // try to find it from an older th element if it was an old table
                        const possibleTh = block.closest('table')?.querySelector('th');
                        if (possibleTh && possibleTh.textContent && possibleTh.textContent.trim() !== 'code') {
                            language = possibleTh.textContent.trim();
                        } else {
                            language = 'code';
                        }
                    }

                    // Find the outermost container to replace
                    let container = block;
                    const possibleTable = block.closest('table.code-block-table');
                    if (possibleTable) {
                        container = possibleTable;
                    } else {
                        const possiblePre = block.closest('pre.tg-code-block') || block.closest('pre');
                        if (possiblePre) {
                            container = possiblePre;
                        }
                    }

                    // Build our standard unified block
                    const newWrapper = document.createElement('div');
                    newWrapper.innerHTML = \`<table class="tg-code-block code-block-table" style="width: 100%; background: #282c34; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); border-collapse: separate; border-spacing: 0; margin: 14px 0; overflow: hidden; table-layout: fixed;">
    <thead>
        <tr>
            <th style="padding: 6px 12px; background: #21252b; color: rgba(255,255,255,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; text-align: left; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.12); user-select: none;">
                \${language}
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 12px; overflow-x: auto;">
                <pre style="margin: 0; white-space: pre-wrap !important; word-wrap: break-word; background: transparent;"><code class="language-\${language}" style="font-family: Consolas, monospace; font-size: 14px; background: transparent !important; padding: 0 !important; border: none !important;"></code></pre>
            </td>
        </tr>
    </tbody>
</table>\`;
                    const newTable = newWrapper.firstElementChild;
                    const newCode = newTable.querySelector('code');
                    newCode.textContent = codeText;
                    
                    if (language && language !== 'code' && hljs.getLanguage(language)) {
                        hljs.highlightElement(newCode);
                    } else {
                        newCode.innerHTML = hljs.highlightAuto(codeText).value;
                    }
                    newCode.dataset.highlighted = 'true';
                    
                    if (container && container.parentNode) {
                        container.parentNode.replaceChild(newTable, container);
                    }
                }
            });
        }
    }, [renderedArticleContent]);`;

['frontend/src/PostDetailPage.js', 'frontend/src/PostCard.js'].forEach(p => {
    let t = fs.readFileSync(p, 'utf-8');
    t = t.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[renderedArticleContent\]\);/, effectReplacement);
    // Ensure we handle PostCard's version if it is named renderedPreviewContent
    t = t.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[renderedPreviewContent\]\);/, effectReplacement.replace('renderedArticleContent', 'renderedPreviewContent'));
    fs.writeFileSync(p, t);
});

console.log('Replaced code blocks normalizer');