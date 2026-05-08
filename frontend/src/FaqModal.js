import React from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(92vw, 620px)',
    bgcolor: 'var(--surface-panel)',
    border: '1px solid color-mix(in oklab, var(--text-primary) 2%, transparent)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-soft)',
    p: 4,
    color: 'var(--text-primary)',
    maxHeight: '80vh',
    overflowY: 'auto',
};

const scrollbarStyle = {
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'var(--surface-soft)',
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'var(--accent-500)',
        borderRadius: '10px',
        border: '2px solid var(--surface-soft)',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        background: 'var(--accent-600)',
    },
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--accent-500) var(--surface-soft)',
};

const faqItems = [
    {
        question: 'Как опубликовать статью?',
        answer:
            'Нажмите «Опубликовать» в боковом меню, заполните заголовок, текст и выберите категорию. После сохранения пост появится в ленте.',
    },
    {
        question: 'Как изменить или удалить публикацию?',
        answer:
            'Если нужно изменить или удалить пост, откройте ваш профиль(или воспользуйтесь поиском), найдите нужную статью и нажмите редактировать.',
    },
    {
        question: 'Почему не вижу кнопку «Админ-панель»?',
        answer:
            'Кнопка отображается только для пользователей с ролью Admin. Если вы администратор, но кнопки нет, войдите заново или обратитесь к поддержке.',
    },
    {
        question: 'Как настроить профиль и аватар?',
        answer:
            'Откройте «Мой профиль», загрузите изображение и обновите данные. Смена аватара доступна в форме профиля.',
    },
    {
        question: 'Как восстановить пароль?',
        answer:
            'На экране входа выберите «Забыли пароль?». Мы отправим письмо с инструкциями на вашу почту.',
    },
    {
        question: 'Где искать нужные материалы?',
        answer:
            'Раздел «Полезные материалы» содержит подборку документации и обучающих ссылок. Также используйте поиск и фильтры в ленте.',
    },
    {
        question: 'Какие горячие клавиши доступны в редакторе?',
        answer:
            'В текстовом редакторе поддерживаются:\n' +
            'Ctrl+B - жирный текст\n' +
            'Ctrl+I - курсив\n' +
            'Ctrl+U - подчеркивание\n' +
            'Ctrl+Shift+8 - маркированный список\n' +
            'Ctrl+Shift+7 - нумерованный список\n' +
            'Ctrl+Alt+2 - заголовок H2\n' +
            'Ctrl+K - добавить ссылку\n' +
            'Ctrl+Shift+0 - сброс цвета текста к стандартному\n\n' +
            'В тулбаре редактора справа есть маленький значок «!». Нажмите его, чтобы открыть мини-инструкцию с этими сочетаниями.',
    },
];

const FaqModal = ({ open, handleClose }) => {
    return (
        <Modal disableRestoreFocus
            open={open}
            onClose={handleClose}
            aria-labelledby="faq-modal-title"
        >
            <Box sx={{ ...style, ...scrollbarStyle }}>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography id="faq-modal-title" variant="h6" component="h2" sx={{ color: 'var(--accent-500)', fontWeight: 'bold', mb: 1 }}>
                    Часто задаваемые вопросы (FAQ)
                </Typography>
                <Typography sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                    Ответы на базовые вопросы по работе с платформой и публикациями.
                </Typography>
                <Divider sx={{ borderColor: 'color-mix(in oklab, var(--text-primary) 8%, transparent)', mb: 2 }} />
                {faqItems.map((item) => (
                    <Accordion
                        key={item.question}
                        disableGutters
                        sx={{
                            bgcolor: 'var(--surface-panel)',
                            color: 'var(--text-primary)',
                            border: '1px solid color-mix(in oklab, var(--text-primary) 6%, transparent)',
                            '&::before': { display: 'none' },
                            mb: 1,
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{ color: 'var(--accent-500)' }} />}
                            sx={{ px: 2, py: 0.5 }}
                        >
                            <Typography sx={{ fontWeight: 600 }}>{item.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 2, pb: 2, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                            {item.answer}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Modal>
    );
};

export default FaqModal;
