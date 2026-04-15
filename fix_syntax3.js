const fs = require('fs');

['frontend/src/PostDetailPage.js', 'frontend/src/PostCard.js'].forEach(p => {
    let t = fs.readFileSync(p, 'utf-8');
    t = t.replace(/&\s*strong':\s*\{\s*fontWeight:\s*'bold',\s*color:\s*'white'\s*\}\s*'\s*\}\}/g, 
        "& strong': { fontWeight: 'bold', color: 'white' }\n                    }}");
    fs.writeFileSync(p, t);
});