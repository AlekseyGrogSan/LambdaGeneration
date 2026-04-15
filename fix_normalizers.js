const fs = require('fs');

const fixLocalNormalizers = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');

    const fnMatch = content.match(/const normalizeCodeBlockText = \(block\) => \{[\s\S]*?trim\(\);\s*?\};\n/);
    if (fnMatch) {
        const replacement = `const normalizeCodeBlockText = (block) => {
    let html = block.innerHTML || '';
    html = html.replace(/<br\\s*[\\/]?>/gi, '\\n');
    html = html.replace(/<\\/?div[^>]*>/gi, '\\n');
    html = html.replace(/<\\/?p[^>]*>/gi, '\\n');
    html = html.replace(/<[^>]+>/g, '');

    const temp = document.createElement('textarea');
    temp.innerHTML = html;

    return (temp.value || '')
        .replace(/\\r\\n?/g, '\\n')
        .replace(/\\u200b/g, '')
        .trim();
};\n`;
        content = content.replace(fnMatch[0], replacement);
        fs.writeFileSync(filePath, content);
    }
};

fixLocalNormalizers('frontend/src/PostDetailPage.js');
fixLocalNormalizers('frontend/src/PostCard.js');

// Now fix contentFormatting.js
let cfContent = fs.readFileSync('frontend/src/contentFormatting.js', 'utf-8');
const expectedOldFn = /const normalizeCodeText = \(rawCode\) => decodeHtmlEntities\([\s\S]*?trim\(\)\);/;
if (expectedOldFn.test(cfContent)) {
    const newFn = `const normalizeCodeText = (rawCode) => {
    let str = String(rawCode)
        .replace(/\\r\\n?/g, '\\n')
        .replace(/<br\\s*[\\/]?>/gi, '\\n')
        .replace(/<\\/?div[^>]*>/gi, '\\n')
        .replace(/<\\/?p[^>]*>/gi, '\\n')
        .replace(/<[^>]+>/g, '');

    return decodeHtmlEntities(str)
        .replace(/\\u200b/g, '')
        .replace(/\\n{3,}/g, '\\n\\n')
        .trim();
};`;
    cfContent = cfContent.replace(expectedOldFn, newFn);
    fs.writeFileSync('frontend/src/contentFormatting.js', cfContent);
}

console.log("Fixed normalizers.");
