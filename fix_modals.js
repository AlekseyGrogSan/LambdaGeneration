const fs = require('fs');

const modals = ['frontend/src/PostCreationModal.js', 'frontend/src/EditArticleModal.js'];

// Adds normalizeCodeBlockText function
const normalizeFn = `
const normalizeCodeBlockText = (block) => {
    let html = block.innerHTML || '';
    html = html.replace(/<br\\s*[\\/]?>/gi, '\\n');
    html = html.replace(/<\\/?div[^>]*>/gi, '\\n');
    html = html.replace(/<p[^>]*>/gi, '\\n');
    html = html.replace(/<\\/p>/gi, '');
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return (temp.innerText || temp.textContent || '')
        .replace(/\\r\\n?/g, '\\n')
        .replace(/\\u200b/g, '')
        .trim();
};
`;

const hljsEffectStr = `
    useEffect(() => {
        if (previewTab === 1 && previewRef.current) {
            const blocks = previewRef.current.querySelectorAll('pre code');
            blocks.forEach((block) => {
                if (!block.dataset.highlighted) {
                    const blockClass = block.className || '';
                    const languageMatch = blockClass.match(/language-(\\w+)/);
                    const language = languageMatch ? languageMatch[1] : null;

                    const codeText = normalizeCodeBlockText(block);

                    if (language && hljs.getLanguage(language)) {
                        hljs.highlightElement(block);
                    } else {
                        block.innerHTML = hljs.highlightAuto(codeText).value;
                    }
                    block.dataset.highlighted = 'true';
                }
            });
        }
    }, [previewTab, contentHTML]);
`;

modals.forEach(file => {
    if (!fs.existsSync(file)) return;
    let text = fs.readFileSync(file, 'utf8');

    // 1. imports
    if (!text.includes('import hljs from')) {
        text = text.replace(/import \{ normalizeContentForSubmit.*?\} from '\.\/contentFormatting';/,
        "import { normalizeContentForSubmit, formatContentForRender } from './contentFormatting';\nimport hljs from 'highlight.js';\nimport 'highlight.js/styles/atom-one-dark.css';");
    }

    // 2. Add normalizeCodeBlockText
    if (!text.includes('const normalizeCodeBlockText')) {
        // Find place where API_BASE_URL is defined
        text = text.replace(/const API_BASE_URL.*?;\n/, match => match + '\n' + normalizeFn);
    }

    // 3. Add useEffect to the component
    if (!text.includes('hljs.highlightElement(block)')) {
        text = text.replace(/(const \[previewTab, setPreviewTab\] = useState\(0\);.*?)/s, match => match + '\n' + hljsEffectStr);
    }

    // Also update normalizeCodeBlockText in PostCard if needed
    fs.writeFileSync(file, text);
});

// Update PostCard.js normalizeCodeBlockText too
let pcard = fs.readFileSync('frontend/src/PostCard.js', 'utf8');
if (pcard.includes('const temp = document.createElement(\'textarea\');')) {
    pcard = pcard.replace(/const normalizeCodeBlockText = \(block\) => \{[\s\S]*?return \(temp\.value \|\| ''\).*?\.trim\(\);\n\};/, normalizeFn.trim());
    fs.writeFileSync('frontend/src/PostCard.js', pcard);
}

console.log("Modals patched.");
