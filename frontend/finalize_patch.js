const fs = require('fs');

function finalize(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    const importRegex = /^import [^;]+;/gm;
    let imports = [];
    content = content.replace(importRegex, (match) => {
        imports.push(match);
        return '';
    });
    content = content.replace(/^\s+/, '');
    
    imports = [...new Set(imports)];
    content = imports.join('\n') + '\n\n' + content;
    
    const effectRegex = /React\.useEffect\(\(\) => \{\s*const roots = \[\];[\s\S]*?\}\); \r?\n?/g;
    let effectBlocks = [];
    content = content.replace(effectRegex, (match) => {
        effectBlocks.push(match);
        return '';
    });
    
    if (effectBlocks.length > 0) {
        let effectToInject = effectBlocks[0];
        
        let injectionPoint = /(const renderedArticleContent = [^\n]+\n|const renderedPreviewContent = [^\n]+\n)/;
        content = content.replace(injectionPoint, (match) => {
            return match + '\n' + effectToInject + '\n';
        });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Finalized ' + filePath);
}

finalize('src/PostDetailPage.js');
finalize('src/PostCard.js');
