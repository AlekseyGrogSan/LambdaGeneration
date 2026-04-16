const fs = require('fs');

const file = 'src/AdminPanelModal.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
content = content.replace(
    "import ConfirmationDialog from './ConfirmationDialog';",
    "import ConfirmationDialog from './ConfirmationDialog';\nimport EditArticleModal from './EditArticleModal';\nimport InputDialog from './InputDialog';"
);

// 2. Add states for editing
content = content.replace(
    "const [actionLoading, setActionLoading] = useState(false);",
    "const [actionLoading, setActionLoading] = useState(false);\n    const [editArticleModalOpen, setEditArticleModalOpen] = useState(false);\n    const [editingArticle, setEditingArticle] = useState(null);\n    const [editCommentDialog, setEditCommentDialog] = useState({ open: false, commentId: null, initialText: '' });"
);

// 3. Add edit article handler
content = content.replace(
    "const handleLoadComments = async (articleId, articleTitle) => {",
    `const handleEditArticle = async (articleId) => {
        setArticlesLoading(true);
        setStatus('');
        try {
            const response = await fetch(\`\${API_BASE_URL}/Articles/getArticleById/\${articleId}\`);
            if (!response.ok) throw new Error('Не удалось загрузить статью');
            const data = await response.json();
            setEditingArticle({
                id: data.articleID,
                title: data.articleTitle,
                article_preview: data.articlePreview,
                article_content: data.articleContent,
                tags: data.articleTags?.map(t => t.name || t) || []
            });
            setEditArticleModalOpen(true);
        } catch (err) {
            setStatus(err.message || 'Ошибка загрузки статьи');
        } finally {
            setArticlesLoading(false);
        }
    };

    const handleEditComment = (commentId, content) => {
        setEditCommentDialog({ open: true, commentId, initialText: content });
    };

    const submitEditComment = async (newContent) => {
        if (!newContent.trim()) return;
        setActionLoading(true);
        try {
            const response = await fetch(\`\${API_BASE_URL}/Comments/update-comment\`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ commentId: editCommentDialog.commentId, content: newContent.trim() })
            });
            if (!response.ok) throw new Error('Не удалось обновить комментарий');
            
            setComments(prev => prev.map(c => c.id === editCommentDialog.commentId ? { ...c, content: newContent.trim() } : c));
            setUserComments(prev => prev.map(c => c.id === editCommentDialog.commentId ? { ...c, content: newContent.trim() } : c));
            setStatus('Комментарий обновлен');
            setEditCommentDialog({ open: false, commentId: null, initialText: '' });
        } catch (err) {
            setStatus(err.message || 'Ошибка редактирования комментария');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLoadComments = async (articleId, articleTitle) => {`
);

// 4. Make Select items white
content = content.replace(
    /<MenuItem key=\{user.userID\} value=\{user.userID\}>/g,
    "<MenuItem key={user.userID} value={user.userID} sx={{ color: '#fff' }}>"
);

// 5. Add "Редактировать" buttons in articles map
const articleButtonsOld = `<Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleLoadComments(article.articleID, article.articleTitle)}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Комментарии
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDeleteArticle(article.articleID, article.articleTitle)}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Удалить
                                        </Button>`;
                                        
const articleButtonsNew = `<Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleLoadComments(article.articleID, article.articleTitle)}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Комментарии
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleEditArticle(article.articleID)}
                                            sx={{ textTransform: 'none', color: '#00bfa5', borderColor: '#00bfa5' }}
                                        >
                                            Редактировать
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDeleteArticle(article.articleID, article.articleTitle)}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Удалить
                                        </Button>`;
content = content.replace(articleButtonsOld, articleButtonsNew);

// 6. Add "Редактировать" buttons to userComments map
// Search for "Удалить" button in userComments list
const userCommentButtonOld = `<Button
                                        size="small"
                                        variant="text"
                                        color="error"
                                        disabled={actionLoading}
                                        onClick={() => handleDeleteUserComment(comment.id, comment.content)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Удалить
                                    </Button>`;
const userCommentButtonNew = `<Button
                                        size="small"
                                        variant="text"
                                        disabled={actionLoading}
                                        onClick={() => handleEditComment(comment.id, comment.content)}
                                        sx={{ textTransform: 'none', color: '#00bfa5', mr: 1 }}
                                    >
                                        Редактировать
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="text"
                                        color="error"
                                        disabled={actionLoading}
                                        onClick={() => handleDeleteUserComment(comment.id, comment.content)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Удалить
                                    </Button>`;
content = content.replace(userCommentButtonOld, userCommentButtonNew);


// 7. Add "Редактировать" buttons to comments map
// Search for secondaryAction in comments list
const postCommentActionOld = `secondaryAction={
                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                sx={{ color: '#ff8a80', textTransform: 'none' }}
                                            >
                                                Удалить
                                            </Button>
                                        }`;
const postCommentActionNew = `secondaryAction={
                                            <Box>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    onClick={() => handleEditComment(comment.id, comment.content)}
                                                    sx={{ color: '#00bfa5', textTransform: 'none', mr: 1 }}
                                                >
                                                    Редактировать
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    sx={{ color: '#ff8a80', textTransform: 'none' }}
                                                >
                                                    Удалить
                                                </Button>
                                            </Box>
                                        }`;
content = content.replace(postCommentActionOld, postCommentActionNew);

// 8. Add modals to the very end before return (
const modalsInsert = `
                {editingArticle && (
                    <EditArticleModal
                        open={editArticleModalOpen}
                        handleClose={() => {
                            setEditArticleModalOpen(false);
                            setEditingArticle(null);
                        }}
                        post={editingArticle}
                        onUpdateSuccess={(id, updatedData) => {
                            setArticles(prev => prev.map(a => a.articleID === id ? { ...a, articleTitle: updatedData.title || a.articleTitle } : a));
                            setStatus('Статья успешно обновлена');
                            fetchUserArticles(selectedUserId);
                        }}
                    />
                )}

                <InputDialog
                    open={editCommentDialog.open}
                    title="Редактировать комментарий"
                    initialValue={editCommentDialog.initialText}
                    onClose={() => setEditCommentDialog({ open: false, commentId: null, initialText: '' })}
                    onSubmit={submitEditComment}
                    loading={actionLoading}
                />
`;

content = content.replace(
    "</Box>\n        </Modal>\n        </>",
    `</Box>\n        </Modal>\n${modalsInsert}\n        </>`
);

fs.writeFileSync(file, content);
console.log('Patched AdminPanelModal.js');