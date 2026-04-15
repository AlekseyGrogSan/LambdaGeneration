const fs = require('fs');

['frontend/src/PostDetailPage.js', 'frontend/src/PostCard.js'].forEach(p => {
    let t = fs.readFileSync(p, 'utf-8');
    t = t.replace(/&\s*strong':\s*\{\s*fontWeight:\s*'bold',\s*color:\s*'white'\s*\},/g, 
        "& strong': { fontWeight: 'bold', color: 'white' }");
        
    // Clean up empty lines or lonely single quote
    t = t.replace(/,\n*.*'\n*\s*\}\}\n/g, "\n                        }\n                    }}\n");
    fs.writeFileSync(p, t);
});