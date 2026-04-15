const fs = require('fs');

const fixDivs = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');

    // Fix the double spacing issue
    content = content.replace(/html\.replace\(\/<\\[\\/\?]div\[\^>\]\*>\/gi, '\\\\n'\);/g, 
        "html.replace(/<div[^>]*>/gi, '\\n');\n    html = html.replace(/<\\/div>/gi, '');");
        
    content = content.replace(/html\.replace\(\/<\\[\\/\?]p\[\^>\]\*>\/gi, '\\\\n'\);/g, 
        "html.replace(/<p[^>]*>/gi, '\\n');\n    html = html.replace(/<\\/p>/gi, '');");

    fs.writeFileSync(filePath, content);
};

fixDivs('frontend/src/PostDetailPage.js');
fixDivs('frontend/src/PostCard.js');

// Fix contentFormatting.js separately since it chains replaces
let cf = fs.readFileSync('frontend/src/contentFormatting.js', 'utf-8');
cf = cf.replace(/\.replace\(\/<\\[\\/\?]div\[\^>\]\*>\/gi, '\\\\n'\)/g, 
    ".replace(/<div[^>]*>/gi, '\\n')\n        .replace(/<\\/div>/gi, '')");
    
cf = cf.replace(/\.replace\(\/<\\[\\/\?]p\[\^>\]\*>\/gi, '\\\\n'\)/g, 
    ".replace(/<p[^>]*>/gi, '\\n')\n        .replace(/<\\/p>/gi, '')");

fs.writeFileSync('frontend/src/contentFormatting.js', cf);

console.log("Fixed spacing.");
