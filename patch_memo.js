const fs = require('fs');

const files = [
    'C:/Users/nbarv/source/repos/LambdaGeneration/frontend/src/contentFormatting.js',
    'C:/Users/nbarv/source/repos/LambdaGeneration/frontend/src/EditArticleModal.js',
    'C:/Users/nbarv/source/repos/LambdaGeneration/frontend/src/PostCard.js',
    'C:/Users/nbarv/source/repos/LambdaGeneration/frontend/src/PostCreationModal.js',
    'C:/Users/nbarv/source/repos/LambdaGeneration/frontend/src/PostDetailPage.js'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Revert white-space: pre to white-space: pre-wrap !important; word-wrap: break-word;
    content = content.replace(/white-space:\s*pre\s*!important;\s*word-wrap:\s*normal(?:;)?/g, 'white-space: pre-wrap !important; word-wrap: break-word;');

    if (file.includes('PostDetailPage.js')) {
        // Add useMemo to imports
        if (!content.includes('useMemo')) {
            content = content.replace(/import\s+React,\s*\{\s*useEffect,\s*useRef,\s*useState\s*\}\s*from\s*'react';/, "import React, { useEffect, useRef, useState, useMemo } from 'react';");
        }

        // Add the useMemo hook for the article body
        if (!content.includes('const articleBody = useMemo')) {
            // First, find the Box.
            const boxRegex = /<Box\s+ref=\{contentRef\}\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*renderedArticleContent\s*\}\}\s+sx=\{\{[^}]+\}\}\s*\/>/s;
            const match = content.match(boxRegex);
            if (match) {
                const boxCode = match[0];
                const memoCode = `const articleBody = useMemo(() => (\n        ${boxCode.replace(/\n/g, '\n        ')}\n    ), [renderedArticleContent]);`;
                
                // Insert memoCode right before return statement of the component
                // It's after `const loadComments = async () =>` or somewhere at the top. Let's put it right after `renderedArticleContent` initialization.
                
                content = content.replace(/const renderedArticleContent = formatContentForRender[^\n]+;\n/, "const renderedArticleContent = formatContentForRender(post?.article_content || '');\n\n    const articleBody = useMemo(() => (\n        " + boxCode + "\n    ), [renderedArticleContent]);\n");
                
                // Replace the physical Box with {articleBody}
                content = content.replace(boxRegex, "{articleBody}");
            }
        }
    }

    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
}
