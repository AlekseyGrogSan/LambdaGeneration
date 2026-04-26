import React, { useMemo, useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    Button,
    Chip,
    MobileStepper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';

const baseModalSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '100vw', sm: '92vw', md: 760 },
    height: { xs: '100dvh', sm: 'auto' },
    maxHeight: { xs: '100dvh', sm: '90vh' },
    borderRadius: { xs: 0, sm: '20px' },
    border: '1px solid rgba(0, 229, 201, 0.26)',
    background: 'radial-gradient(circle at 20% 0%, #1d3a39 0%, #151515 55%, #0f0f0f 100%)',
    color: '#f2f5f5',
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55)',
    display: 'flex',
    flexDirection: 'column',
};

const slideIconSx = {
    width: 46,
    height: 46,
    borderRadius: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 201, 0.13)',
    color: '#8df7ea',
    border: '1px solid rgba(141, 247, 234, 0.3)',
};

const getSlides = () => [
    {
        key: 'overview',
        icon: <AutoAwesomeMotionIcon sx={{ fontSize: 24 }} />,
        title: 'Как устроен Lambda',
        subtitle: 'Короткий маршрут по всему функционалу сайта',
        points: [
            'Лента разделена на режимы: Случайные и Рекомендации, переключение доступно на десктопе и мобильном.',
            'Каждая карточка открывается в детальный просмотр со всеми материалами, лайками и комментариями.',
            'С телефона основной функционал дублирован в нижней навигации и меню с тремя точками.',
        ],
    },
    {
        key: 'feed-search',
        icon: <TravelExploreIcon sx={{ fontSize: 24 }} />,
        title: 'Лента, поиск и фильтры',
        subtitle: 'Как быстро находить нужные материалы',
        points: [
            'Поиск открывается отдельно: вбиваете запрос, отправляете Enter и получаете релевантные статьи.',
            'Фильтрация по категориям и тегам позволяет собрать узкую подборку по стеку или теме.',
            'В ленте работает вертикальный snap: удобно просматривать публикации как единый поток.',
        ],
    },
    {
        key: 'create-edit',
        icon: <AutoFixHighIcon sx={{ fontSize: 24 }} />,
        title: 'Создание и редактирование',
        subtitle: 'Публикации с продвинутым редактором',
        points: [
            'В редакторе доступны форматирование, списки, ссылки, подсветка и вставка код-блоков.',
            'Можно обновлять текст, теги и обложку публикации, включая последующее редактирование.',
            'После публикации материалы сразу попадают в ленту и доступны через поиск и фильтры.',
        ],
    },
    {
        key: 'neuro-ai-editor',
        icon: <PsychologyAltIcon sx={{ fontSize: 24 }} />,
        title: 'Нейрофункционал: AI-редактор',
        subtitle: 'Встроенная помощь ИИ внутри редактора статей',
        points: [
            'AI-редактор запускается в окне создания и редактирования статьи через кнопку с иконкой AI.',
            'Доступны 4 режима: Официальный стиль, Добавить информацию, Добавить эмоции, Исправить ошибки.',
            'ИИ может обработать выделенный фрагмент или весь текст и показать предварительный результат перед применением.',
            'Изменения подтверждаются вручную: можно принять AI-правки или отклонить их без потери исходного текста.',
        ],
    },
    {
        key: 'neuro-moderation',
        icon: <VerifiedUserIcon sx={{ fontSize: 24 }} />,
        title: 'Нейрофункционал: модерация контента',
        subtitle: 'Безопасность текста и изображений перед публикацией',
        points: [
            'Перед сохранением контент проходит проверку: текстовую, AI-модерацию и проверку изображений.',
            'При блокировке публикации отображаются причины и флаги, чтобы можно было исправить материал.',
            'Это защищает платформу от токсичного, спамного, шок-контента и нерелевантных публикаций.',
        ],
    },
    {
        key: 'profile-community',
        icon: <AutoAwesomeMotionIcon sx={{ fontSize: 24 }} />,
        title: 'Профиль и взаимодействие',
        subtitle: 'Как управлять своим присутствием на платформе',
        points: [
            'В профиле доступны ваши публикации, данные аккаунта и настройка аватара.',
            'Поддерживаются лайки и ветвящиеся комментарии с ответами и редактированием.',
            'Для администраторов доступна отдельная панель модерации в меню.',
        ],
    },
];

const SiteGuideSlidesModal = ({ open, onClose }) => {
    const [activeStep, setActiveStep] = useState(0);
    const slides = useMemo(() => getSlides(), []);

    useEffect(() => {
        if (!open) {
            setActiveStep(0);
        }
    }, [open]);

    const maxSteps = slides.length;
    const currentSlide = slides[activeStep];

    const handleNext = () => {
        setActiveStep((prev) => Math.min(prev + 1, maxSteps - 1));
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="site-guide-title" aria-describedby="site-guide-content">
            <Box sx={baseModalSx}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: { xs: 1.5, sm: 2.25 },
                        py: { xs: 1.1, sm: 1.5 },
                        borderBottom: '1px solid rgba(0, 229, 201, 0.18)',
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <Chip
                        label="Инструкция"
                        size="small"
                        sx={{
                            fontWeight: 700,
                            bgcolor: 'rgba(0, 229, 201, 0.16)',
                            color: '#98fff2',
                            border: '1px solid rgba(0, 229, 201, 0.28)',
                        }}
                    />
                    <Typography sx={{ ml: 'auto', color: '#b9c4c3', fontSize: '0.8rem' }}>
                        {activeStep + 1} / {maxSteps}
                    </Typography>
                    <IconButton onClick={onClose} aria-label="Закрыть инструкцию" sx={{ color: '#d6e8e6' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        p: { xs: 1.8, sm: 2.5 },
                        overflowY: 'auto',
                        flex: 1,
                        '&::-webkit-scrollbar': { width: '8px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#00bfa5', borderRadius: '10px' },
                    }}
                >
                    <Box sx={slideIconSx}>{currentSlide.icon}</Box>
                    <Typography id="site-guide-title" variant="h5" sx={{ mt: 1.5, fontWeight: 800, letterSpacing: 0.2 }}>
                        {currentSlide.title}
                    </Typography>
                    <Typography id="site-guide-content" sx={{ mt: 0.8, color: '#b7c4c2', lineHeight: 1.6 }}>
                        {currentSlide.subtitle}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'grid', gap: 1.2 }}>
                        {currentSlide.points.map((point) => (
                            <Box
                                key={point}
                                sx={{
                                    p: 1.3,
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.09)',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                }}
                            >
                                <Typography sx={{ fontSize: { xs: '0.92rem', sm: '0.96rem' }, lineHeight: 1.5 }}>{point}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ borderTop: '1px solid rgba(0, 229, 201, 0.18)' }}>
                    <MobileStepper
                        variant="dots"
                        steps={maxSteps}
                        position="static"
                        activeStep={activeStep}
                        sx={{
                            background: 'transparent',
                            px: { xs: 1, sm: 1.6 },
                            '& .MuiMobileStepper-dot': {
                                backgroundColor: 'rgba(255,255,255,0.28)',
                            },
                            '& .MuiMobileStepper-dotActive': {
                                backgroundColor: '#00e5c9',
                            },
                        }}
                        nextButton={
                            <Button
                                size="small"
                                onClick={handleNext}
                                disabled={activeStep === maxSteps - 1}
                                endIcon={<ArrowForwardIosIcon sx={{ fontSize: 13 }} />}
                                sx={{ color: '#8ef7ea' }}
                            >
                                Далее
                            </Button>
                        }
                        backButton={
                            <Button
                                size="small"
                                onClick={handleBack}
                                disabled={activeStep === 0}
                                startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
                                sx={{ color: '#8ef7ea' }}
                            >
                                Назад
                            </Button>
                        }
                    />
                </Box>
            </Box>
        </Modal>
    );
};

export default SiteGuideSlidesModal;
