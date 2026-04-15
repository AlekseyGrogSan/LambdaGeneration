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

    // Revert white-space: pre !important; word-wrap: normal; to white-space: pre-wrap !important; word-wrap: break-word;
    content = content.replace(/white-space:\s*pre\s*!important;\s*word-wrap:\s*normal(?:;)?/g, 'white-space: pre-wrap !important; word-wrap: break-word;');

    fs.writeFileSync(file, content);
    console.log(`Reverted CSS in ${file}`);
}
