const fs = require('fs');

const codeBlockStr = 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { createRoot } from 'react-dom/client';

const CodeBlock = ({ language, value }) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Box sx={{ my: 2, borderRadius: '8px', overflow: 'hidden', border: '1px solid #3a3a3a' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1e1e1e', py: 0.5, px: 2, borderBottom: '1px solid #2d2d2d' }}>
                <Typography variant='caption' sx={{ color: '#888', fontWeight: 'bold' }}>
                    {language || 'text'}
                </Typography>
                <IconButton size='small' onClick={handleCopy} sx={{ color: '#888', '&:hover': { color: '#fff' } }}>
                    {isCopied ? <CheckIcon fontSize='small' sx={{ color: '#00e676' }} /> : <ContentCopyIcon fontSize='small' />}
                </IconButton>
            </Box>
            <SyntaxHighlighter
                language={language && language !== 'text' ? language : 'javascript'}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '16px', fontSize: '0.9rem', backgroundColor: '#1e1e1e' }}
            >
                {value}
            </SyntaxHighlighter>
        </Box>
    );
};
;

function restoreCodeBlock(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes('const CodeBlock =')) {
        console.log('Already has CodeBlock in ' + filePath);
        return;
    }

    content = content.replace(/const normalizeCodeBlockText = \([^\)]+\) => \{[\s\S]*?return[^\}]+\};\s*\r?\n?/g, '');
    let norm = 
const normalizeCodeBlockText = (block) => {
    let cleanText = block.innerText;
    if (cleanText === undefined) cleanText = block.textContent;
    return (cleanText || '').replace(/\u200b/g, '').trim();
};
;

    content = content.replace(/useEffect\(\(\) => \{\s*if \(contentRef\.current\) \{[\s\S]*?\}\s*\}\s*\}, \[(renderedArticleContent|renderedPreviewContent)\]\);\s*\r?\n?/g, '');

    const effectReplacement = 
    React.useEffect(() => {
        const roots = [];
        if (contentRef.current) {
            contentRef.current.querySelectorAll('.code-block-table').forEach((table) => {
                if (table.dataset.replaced) return;
                table.dataset.replaced = 'true';

                const th = table.querySelector('th');
                const languageClass = th ? th.textContent.trim() : 'text';      

                const codeBlock = table.querySelector('pre code') || table.querySelector('pre');
                const codeText = codeBlock ? normalizeCodeBlockText(codeBlock) : normalizeCodeBlockText(table);

                const parent = table.parentNode;
                const wrapper = document.createElement('div');
                wrapper.className = 'custom-code-block-wrapper';
                parent.insertBefore(wrapper, table);
                table.style.display = 'none';

                const root = createRoot(wrapper);
                roots.push({ root, wrapper, original: table });
                root.render(<CodeBlock language={languageClass} value={codeText} />);
            });

            contentRef.current.querySelectorAll('pre code').forEach((block) => {
                if (block.closest('.code-block-table') || block.closest('.custom-code-block-wrapper') || block.dataset.replaced) return;
                block.dataset.replaced = 'true';
                const codeText = normalizeCodeBlockText(block);

                const languageCls = Array.from(block.classList).find((cls) => cls.startsWith('language-'));
                const language = languageCls ? languageCls.replace('language-', '') : '';

                const pre = block.parentNode;
                const wrapper = document.createElement('div');
                wrapper.className = 'custom-code-block-wrapper';
                pre.parentNode.insertBefore(wrapper, pre);
                pre.style.display = 'none';

                const root = createRoot(wrapper);
                roots.push({ root, wrapper, original: pre });
                root.render(<CodeBlock language={language} value={codeText} />);
            });
        }

        return () => {
             roots.forEach(({ root, wrapper, original }) => {
                 setTimeout(() => root.unmount(), 0);
                 if (wrapper && wrapper.parentNode) {
                     wrapper.parentNode.removeChild(wrapper);
                 }
                 if (original) {
                     delete original.dataset.replaced;
                 }
             });
        };
    }); // RU_NS AFTER EVERY RENDER TO CATCH DOM WIPES
;

    content = content.replace(/import (.*?) from 'react';\r?\n/, "import  from 'react';\n" + codeBlockStr + '\n' + norm + '\n');
    
    let compRegex;
    if (filePath.includes('PostDetailPage')) {
        compRegex = /const PostDetailPage = \(\{[\s\S]*?return \(\s*<Box/g;
    } else {
        compRegex = /const PostCard = \(\{[\s\S]*?return \(\s*<Card/g;
    }
    
    let match = compRegex.exec(content);
    if (match) {
        let replacement = match[0].replace(/return \(\s*<(Box|Card)/, effectReplacement + '\n    return (\n        <');
        content = content.replace(match[0], replacement);
    } else {
        console.error('Could not find return ' + filePath);
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Restored beautiful CodeBlock in ' + filePath);
}

restoreCodeBlock('frontend/src/PostDetailPage.js');
restoreCodeBlock('frontend/src/PostCard.js');