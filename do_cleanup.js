const fs = require('fs');

function cleanup(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove the old hljs useEffect entirely!
    // It's the one that has: if (contentRef.current) { contentRef.current.querySelectorAll('pre code').forEach((block) => { if (!block.dataset.highlighted)
    content = content.replace(/useEffect\(\(\) => \{\s*if \(contentRef\.current\) \{\s*contentRef\.current\.querySelectorAll\('pre code'\).forEach\(\(block\) => \{[\s\S]*?\}\);\s*\}\s*\}, \[(renderedArticleContent|renderedPreviewContent)\]\);\s*\r?\n?/g, '');

    // Make sure we only have ONE React.useEffect for CodeBlock replacement, the one without dependencies
    // (If my previous patch added it repeatedly, let's just make sure it looks fine)

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Cleaned up ' + filePath);
}

cleanup('frontend/src/PostDetailPage.js');
cleanup('frontend/src/PostCard.js');
