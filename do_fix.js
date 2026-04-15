const fs = require('fs');

function fix(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Fix normalizeCodeBlockText
    content = content.replace(/const normalizeCodeBlockText = \([^\)]+\) => \{[\s\S]*?return[^\}]+\};\s*\r?\n?/g, `
const normalizeCodeBlockText = (block) => {
    let cleanText = block.innerText;
    if (cleanText === undefined) cleanText = block.textContent;
    return (cleanText || '').replace(/\\u200b/g, '').trim();
};
\n`);

    // Fix useEffect to run on every render AND set highlighted flag
    content = content.replace(/useEffect\(\(\) => \{\s*if \(contentRef\.current\) \{[\s\S]*?hljs\.highlightElement\(block\);\s*\} else \{\s*block\.innerHTML = hljs\.highlightAuto\(codeText\)\.value;\s*\}\s*\}\s*\}\);\s*\}\s*\}, \[renderedArticleContent\]\);/g, `useEffect(() => {
        if (contentRef.current) {
            contentRef.current.querySelectorAll('pre code').forEach((block) => {
                if (!block.dataset.highlighted) {
                    const codeText = normalizeCodeBlockText(block);
                    block.textContent = codeText;

                    const languageClass = Array.from(block.classList).find((cls) => cls.startsWith('language-'));
                    const language = languageClass ? languageClass.replace('language-', '') : '';

                    if (language && hljs.getLanguage(language)) {
                        hljs.highlightElement(block);
                    } else {
                        block.innerHTML = hljs.highlightAuto(codeText).value;
                        block.dataset.highlighted = 'yes';
                    }
                }
            });
        }
    });`);
    
    content = content.replace(/useEffect\(\(\) => \{\s*if \(contentRef\.current\) \{[\s\S]*?hljs\.highlightElement\(block\);\s*\} else \{\s*block\.innerHTML = hljs\.highlightAuto\(codeText\)\.value;\s*\}\s*\}\s*\}\);\s*\}\s*\}, \[renderedPreviewContent\]\);/g, `useEffect(() => {
        if (contentRef.current) {
            contentRef.current.querySelectorAll('pre code').forEach((block) => {
                if (!block.dataset.highlighted) {
                    const codeText = normalizeCodeBlockText(block);
                    block.textContent = codeText;

                    const languageClass = Array.from(block.classList).find((cls) => cls.startsWith('language-'));
                    const language = languageClass ? languageClass.replace('language-', '') : '';

                    if (language && hljs.getLanguage(language)) {
                        hljs.highlightElement(block);
                    } else {
                        block.innerHTML = hljs.highlightAuto(codeText).value;
                        block.dataset.highlighted = 'yes';
                    }
                }
            });
        }
    });`);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed ' + filePath);
}

fix('src/PostDetailPage.js');
fix('src/PostCard.js');