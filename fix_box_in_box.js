const fs = require('fs');

['frontend/src/PostCard.js', 'frontend/src/PostDetailPage.js'].forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    // Mui box settings usually end with fontSize: '...' or similar. Let's find .tg-code-block
    content = content.replace(/&\s*\.tg-code-block':\s*\{\s*background:\s*'#1f2937',\s*/, 
        "& .tg-code-block': {\n                            background: '#282c34',\n                            ");
    
    // Add back the .hljs override right after .tg-code-block
    content = content.replace(/fontSize:\s*'0\.95rem',\n\s*\},/, 
        "fontSize: '0.95rem',\n                        },\n                        '& .hljs, & .code-block-table': { background: 'transparent !important', padding: '0 !important', border: 'none !important' },");

    content = content.replace(/fontSize:\s*'0\.85rem',\n\s*\},/, 
        "fontSize: '0.85rem',\n                            },\n                            '& .hljs, & .code-block-table': { background: 'transparent !important', padding: '0 !important', border: 'none !important' },");

    fs.writeFileSync(file, content);
});

// Also, inside index.css I added `.hljs { background: #282c34 !important; color: #abb2bf !important; border-radius: 8px; }`. We should remove background and border-radius so it doesn't conflict anywhere. Or just keep it but since the MUI sx overrides it, it's fine. 
// Let's remove the .hljs override from index.css to be safe.
let css = fs.readFileSync('frontend/src/index.css', 'utf-8');
css = css.replace(/\.hljs\s*\{[^}]+\}/g, '');
fs.writeFileSync('frontend/src/index.css', css);

console.log('Fixed Box inside Box');
