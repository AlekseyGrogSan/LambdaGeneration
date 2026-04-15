const fs = require('fs');
['frontend/src/PostCard.js', 'frontend/src/PostDetailPage.js'].forEach(p => {
    let t = fs.readFileSync(p, 'utf-8');
    t = t.replace(/lineHeight:\s*1\.45,\s*'\s*\}\}/g, "lineHeight: 1.45 } }");
    fs.writeFileSync(p, t);
});