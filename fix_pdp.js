const fs = require('fs');

['frontend/src/PostDetailPage.js', 'frontend/src/PostCard.js'].forEach(p => {
    let content = fs.readFileSync(p, 'utf-8');
    
    // Look for the end of p replacements in normalizeCodeBlockText
    const target = "html = html.replace(/<\\/p>/gi, '');";
    
    if (content.includes(target) && !content.includes("/<[^>]+>/g")) {
        content = content.replace(target, target + "\n    html = html.replace(/<[^>]+>/g, '');");
        fs.writeFileSync(p, content);
        console.log("Patched " + p);
    }
    
    // just in case they were already patched but with different formatting
    else if (content.includes("html.replace(/<\\/?p[^>]*>/gi, '\\n');") && !content.includes("/<[^>]+>/g")) {
        content = content.replace("html.replace(/<\\/?p[^>]*>/gi, '\\n');", "html.replace(/<\\/?p[^>]*>/gi, '\\n');\n    html = html.replace(/<[^>]+>/g, '');");
        fs.writeFileSync(p, content);
        console.log("Patched " + p + " (fallback)");
    }
});
