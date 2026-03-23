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
    bgcolor: '#2c2c2c',
    border: '2px solid #000',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
    color: 'white',
    maxHeight: '80vh',
    overflowY: 'auto',
};

const scrollbarStyle = {
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#1a1a1a',
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#00bfa5',
        borderRadius: '10px',
        border: '2px solid #1a1a1a',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        background: '#009e8a',
    },
    scrollbarWidth: 'thin',
    scrollbarColor: '#00bfa5 #1a1a1a',
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
            'Если нужно изменить или удалить пост, откройте публикацию и свяжитесь с администратором. Он сможет внести правки при наличии прав доступа.',
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
];

const FaqModal = ({ open, handleClose }) => {
    return (
        <Modal
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
                <Typography id="faq-modal-title" variant="h6" component="h2" sx={{ color: '#00bfa5', fontWeight: 'bold', mb: 1 }}>
                    Часто задаваемые вопросы (FAQ)
                </Typography>
                <Typography sx={{ color: '#bdbdbd', mb: 2 }}>
                    Ответы на базовые вопросы по работе с платформой и публикациями.
                </Typography>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
                {faqItems.map((item) => (
                    <Accordion
                        key={item.question}
                        disableGutters
                        sx={{
                            bgcolor: '#1f1f1f',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.06)',
                            '&::before': { display: 'none' },
                            mb: 1,
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{ color: '#00bfa5' }} />}
                            sx={{ px: 2, py: 0.5 }}
                        >
                            <Typography sx={{ fontWeight: 600 }}>{item.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 2, pb: 2, color: '#cfcfcf' }}>
                            {item.answer}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Modal>
    );
};

export default FaqModal;