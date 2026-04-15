const fs = require('fs');

const files = [
    'C:/Users/nbarv/source/repos/LambdaGeneration/frontend/src/contentFormatting.js',
    'C:/Users/nbarv/source/repos/LambdaGeneration/frontend/src/EditArticleModal.js',
    'C:/Users/nbarv/source/repos/LambdaGeneration/frontend/src/PostCard.js',
    'C:/Users/nbarv/source/repos/LambdaGeneration/frontend/src/PostCreationModal.js',
    'C:/Users/nbarv/source/repos/LambdaGeneration/frontend/src/PostDetailPage.js'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Thinner top bar
    content = content.replace(/padding:\s*6px\s+12px;/g, 'padding: 3px 10px;');
    // Smaller font
    content = content.replace(/font-size:\s*12px;\s*text-align:\s*left/g, 'font-size: 11px; text-align: left');

    // 2. Fix the line wrapping bug (horizontal scroll instead of forced vertical stretch)
    content = content.replace(/white-space:\s*pre-wrap\s*!important;\s*word-wrap:\s*break-word/g, 'white-space: pre !important; word-wrap: normal');

    // 3. Tighter padding in td
    content = content.replace(/<td style="padding:\s*12px;\s*overflow-x:\s*auto;/g, '<td style="padding: 10px; overflow-x: auto;');

    // 4. Capitalize the language name
    if (file.includes('contentFormatting.js')) {
        // the first match of escapeHtml(language) is inside the th tag. The second is inside the class.
        // We only want to change the displayed text!
        content = content.replace(
            /<th([^>]*)>\s*\$\{escapeHtml\(language\)\}\s*<\/th>/g, 
            '<th$1>${escapeHtml(language.charAt(0).toUpperCase() + language.slice(1))}</th>'
        );
    } else if (file.includes('EditArticleModal') || file.includes('PostCreationModal')) {
        content = content.replace(
            /<th([^>]*)>\s*\$\{lang\s*\|\|\s*'code'\}\s*<\/th>/g, 
            "<th$1>${lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : 'Code'}</th>"
        );
    } else if (file.includes('PostDetailPage') || file.includes('PostCard')) {
        content = content.replace(
            /<th([^>]*)>[\s\r\n]*\$\{language\}[\s\r\n]*<\/th>/g, 
            '<th$1>\n                ${language.charAt(0).toUpperCase() + language.slice(1)}\n            </th>'
        );
    }

    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
}
