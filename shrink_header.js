const fs = require('fs');

const files = [
    'frontend/src/contentFormatting.js',
    'frontend/src/EditArticleModal.js',
    'frontend/src/PostCard.js',
    'frontend/src/PostCreationModal.js',
    'frontend/src/PostDetailPage.js'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Reduce padding on th to make the top bar thinner and push text further to the left (2px vertical, 4px horizontal)
    content = content.replace(/padding:\s*3px\s+10px;/g, 'padding: 2px 6px;');
    
    // 2. Remove the whitespace/newlines around the text inside <th>...</th> so it doesn't render an extra space before the word
    if (file.includes('contentFormatting.js')) {
        content = content.replace(
            /<th([^>]*)>\s*\$\{escapeHtml\(language\.charAt\(0\)\.toUpperCase\(\)\s*\+\s*language\.slice\(1\)\)\}\s*<\/th>/g, 
            '<th$1>${escapeHtml(language.charAt(0).toUpperCase() + language.slice(1))}</th>'
        );
    } else if (file.includes('EditArticleModal') || file.includes('PostCreationModal')) {
        content = content.replace(
            /<th([^>]*)>\s*\$\{lang\s*\?\s*lang\.charAt\(0\)\.toUpperCase\(\)\s*\+\s*lang\.slice\(1\)\s*:\s*'Code'\}\s*<\/th>/g, 
            "<th$1>${lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : 'Code'}</th>"
        );
    } else if (file.includes('PostDetailPage') || file.includes('PostCard')) {
        content = content.replace(
            /<th([^>]*)>[\s\r\n]*\$\{language\.charAt\(0\)\.toUpperCase\(\)\s*\+\s*language\.slice\(1\)\}[\s\r\n]*<\/th>/g, 
            '<th$1>${language.charAt(0).toUpperCase() + language.slice(1)}</th>'
        );
    }

    fs.writeFileSync(file, content);
    console.log(`Shrunk header in ${file}`);
}
