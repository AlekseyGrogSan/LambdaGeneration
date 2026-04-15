const fs = require('fs');

const fixSpacing = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');

    content = content.replace("html = html.replace(/<\\/?div[^>]*>/gi, '\\n');", 
        "html = html.replace(/<div[^>]*>/gi, '\\n');\n    html = html.replace(/<\\/div>/gi, '');");
        
    content = content.replace("html = html.replace(/<\\/?p[^>]*>/gi, '\\n');", 
        "html = html.replace(/<p[^>]*>/gi, '\\n');\n    html = html.replace(/<\\/p>/gi, '');");

    // for chained string replacements
    content = content.replace(".replace(/<\\/?div[^>]*>/gi, '\\n')", 
        ".replace(/<div[^>]*>/gi, '\\n')\n        .replace(/<\\/div>/gi, '')");
        
    content = content.replace(".replace(/<\\/?p[^>]*>/gi, '\\n')", 
        ".replace(/<p[^>]*>/gi, '\\n')\n        .replace(/<\\/p>/gi, '')");

    fs.writeFileSync(filePath, content);
};

fixSpacing('frontend/src/PostDetailPage.js');
fixSpacing('frontend/src/PostCard.js');
fixSpacing('frontend/src/contentFormatting.js');

console.log("Fixed spacing correctly.");
