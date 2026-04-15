const fs = require('fs');
let p = 'frontend/src/PostCard.js';
let t = fs.readFileSync(p, 'utf-8');
t = t.replace(/lineHeight:\s*1\.45,\s*''\}\}/g, "lineHeight: 1.45 } }");
t = t.replace(/lineHeight:\s*1\.45,\s*'\s*\}\}/g, "lineHeight: 1.45 } }");
fs.writeFileSync(p, t);
