const fs = require('fs');

['frontend/src/PostDetailPage.js', 'frontend/src/PostCard.js'].forEach(p => {
    let t = fs.readFileSync(p, 'utf-8');
    t = t.replace(/&\s*\.tg-code-block':\s*\{[\s\S]*?fontSize:\s*'0\.(95|85)rem',\s*\},\n*\s*'& \.hljs, & \.code-block-table':\s*\{\s*\n*\s*background:\s*'transparent !important',\s*\n*\s*padding:\s*'0 !important',\s*\n*\s*border:\s*'none !important'\s*\n*\s*\},\n/g, "");
    
    // just in case single line fallback
    t = t.replace(/&\s*\.tg-code-block':\s*\{[\s\S]*?border:\s*'none !important'\s*\},\s*\n/g, "");
    fs.writeFileSync(p, t);
});

console.log("Removed hardcoded tg-code-block styles which conflict with table style.");
