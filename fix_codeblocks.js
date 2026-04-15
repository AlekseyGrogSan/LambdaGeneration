const fs = require('fs');

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove CodeBlock component
    content = content.replace(/const CodeBlock = \(\{ language, value \}\) => \{[\s\S]*?return \([\s\S]*?\}\);\s*\};\s*/, '');

    // Remove normalizeCodeBlockText function
    content = content.replace(/const normalizeCodeBlockText = \(block\) => \{[\s\S]*?trim\(\);\s*\};\s*/, '');

    // Remove the useEffect that replaces code block tables
    // In PostDetailPage, dependencies are [renderedArticleContent]
    // In PostCard, it's [renderedPreviewContent]
    content = content.replace(/useEffect\(\(\) => \{\s*const roots = \[\];[\s\S]*?return \(\) => \{[\s\S]*?\}\);\s*\};\s*\}, \[(renderedArticleContent|renderedPreviewContent)\]\);\s*/, '');

    // Remove unused imports introduced by CodeBlock
    content = content.replace(/import \{ Prism as SyntaxHighlighter \} from 'react-syntax-highlighter';\s*/g, '');
    content = content.replace(/import \{ vscDarkPlus \} from 'react-syntax-highlighter\/dist\/esm\/styles\/prism';\s*/g, '');
    content = content.replace(/import ContentCopyIcon from '@mui\/icons-material\/ContentCopy';\s*/g, '');
    // CheckIcon might be used elsewhere, let's skip removing CheckIcon unless we are sure.
    // createRoot might be unused
    content = content.replace(/import \{ createRoot \} from 'react-dom\/client';\s*/g, '');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Patched ' + filePath);
}

patchFile('frontend/src/PostDetailPage.js');
patchFile('frontend/src/PostCard.js');
