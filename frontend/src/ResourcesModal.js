import React from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Link,
    Divider,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import LaunchIcon from '@mui/icons-material/Launch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(92vw, 620px)',
    bgcolor: 'var(--surface-panel)',
    border: '1px solid color-mix(in oklab, var(--text-primary) 8%, transparent)',
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

const resources = [
    {
        title: 'Инструкция по сайту: что где находится',
        description:
            'Лента с публикациями находится в центре. Слева — кнопки «Категории», «Полезные материалы», «FAQ» и доступ к профилю. В карточке поста доступны лайк, комментарии и переход к деталям. Поиск и фильтры доступны сверху ленты.',
        icon: <MenuBookIcon />,
        tag: 'Навигация',
    },
    {
        title: 'Как проводится модерация статей',
        description:
            'Материалы проверяются на соответствие правилам площадки: корректность, отсутствие спама, соблюдение тематики и авторских прав. При необходимости модератор может снять публикацию.',
        icon: <SchoolIcon />,
        tag: 'Модерация',
    },
    {
        title: 'Что запрещено на сайте',
        description:
            'Запрещены оскорбления, дискриминация, агрессивная реклама, спам, вредоносные ссылки, публикация чужих материалов без разрешения, а также любые данные, нарушающие закон или политику платформы.',
        icon: <MenuBookIcon />,
        tag: 'Правила',
    },
    {
        title: 'Обучающие материалы',
        description:
            'Подборка источников по направлениям. Открывайте нужный пункт и выбирайте, что изучать дальше.',
        icon: <SchoolIcon />,
        tag: 'Справочник',
        children: [
            {
                group: 'Языки программирования',
                items: [
                    { title: 'C#', href: 'https://learn.microsoft.com/dotnet/csharp/' },
                    { title: 'Java', href: 'https://docs.oracle.com/en/java/' },
                    { title: 'Python', href: 'https://docs.python.org/3/' },
                    { title: 'JavaScript', href: 'https://developer.mozilla.org/ru/docs/Web/JavaScript' },
                    { title: 'TypeScript', href: 'https://www.typescriptlang.org/docs/' },
                    { title: 'Go', href: 'https://go.dev/doc/' },
                    { title: 'Rust', href: 'https://doc.rust-lang.org/book/' },
                    { title: 'Kotlin', href: 'https://kotlinlang.org/docs/home.html' },
                    { title: 'Swift', href: 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/' },
                    { title: 'PHP', href: 'https://www.php.net/docs.php' },
                    { title: 'C++', href: 'https://en.cppreference.com/w/' },
                    { title: 'C', href: 'https://en.cppreference.com/w/c' },
                    { title: 'Ruby', href: 'https://www.ruby-lang.org/en/documentation/' },
                    { title: 'PascalABC', href: 'https://pascalabc.net/en/?classic=1' },
                ],
            },
            {
                group: 'Фреймворки',
                items: [
                    { title: '.NET', href: 'https://learn.microsoft.com/dotnet/' },
                    { title: 'ASP.NET', href: 'https://learn.microsoft.com/aspnet/core/' },
                    { title: 'Entity Framework', href: 'https://learn.microsoft.com/ef/' },
                    { title: 'Spring', href: 'https://spring.io/guides' },
                    { title: 'React', href: 'https://react.dev/learn' },
                    { title: 'Angular', href: 'https://angular.dev/overview' },
                    { title: 'Vue', href: 'https://vuejs.org/guide/' },
                    { title: 'Node.js', href: 'https://nodejs.org/en/learn' },
                    { title: 'Django', href: 'https://docs.djangoproject.com/' },
                    { title: 'Flask', href: 'https://flask.palletsprojects.com/en/latest/' },
                    { title: 'Unity', href: 'https://learn.unity.com/' },
                ],
            },
            {
                group: 'Технологии',
                items: [
                    { title: 'Math', href: 'https://www.khanacademy.org/math' },
                    { title: 'Data Structures', href: 'https://www.geeksforgeeks.org/data-structures/' },
                    { title: 'LLM', href: 'https://huggingface.co/learn/nlp-course/' },
                    { title: 'ML', href: 'https://scikit-learn.org/stable/tutorial/basic/tutorial.html' },
                ],
            },
            {
                group: 'Навигация по профессиям',
                items: [
                    { title: 'Roadmap.sh', href: 'https://roadmap.sh/' },
                    { title: 'freeCodeCamp', href: 'https://www.freecodecamp.org/' },
                    { title: 'MDN Web Docs', href: 'https://developer.mozilla.org/ru/' },
                    { title: 'Material UI', href: 'https://mui.com/material-ui/getting-started/' },
                ],
            },
        ],
    },
];

const ResourcesModal = ({ open, handleClose }) => {
    return (
        <Modal disableRestoreFocus
            open={open}
            onClose={handleClose}
            aria-labelledby="resources-modal-title"
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
                <Typography id="resources-modal-title" variant="h6" component="h2" sx={{ color: 'var(--accent-500)', fontWeight: 'bold', mb: 1 }}>
                    Полезные материалы
                </Typography>
                <Typography sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                    Подборка актуальных источников, которые помогут быстрее разобраться с интерфейсом, публикациями и разработкой.
                </Typography>
                <Divider sx={{ borderColor: 'color-mix(in oklab, var(--text-primary) 8%, transparent)', mb: 2 }} />
                <List sx={{ p: 0, border: 'none', boxShadow: 'none', backgroundImage: 'none', backgroundColor: 'transparent' }}>
                    {resources.map((resource) => (
                        resource.children ? (
                            <Box
                                key={resource.title}
                                sx={{
                                    borderBottom: '1px solid color-mix(in oklab, var(--text-primary) 6%, transparent)',
                                }}
                            >
                                <Accordion
                                    disableGutters
                                    sx={{
                                        bgcolor: 'transparent',
                                        color: 'var(--text-primary)',
                                        backgroundImage: 'none',
                                        boxShadow: 'none',
                                        '&::before': { display: 'none' },
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: 'var(--accent-500)' }} />}
                                        sx={{ px: 0, py: 1.25 }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ListItemIcon sx={{ minWidth: 36, color: 'var(--accent-500)' }}>
                                                    {resource.icon}
                                                </ListItemIcon>
                                                <Typography sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                                    {resource.title}
                                                </Typography>
                                            </Box>
                                             <Chip
                                                 label={resource.tag}
                                                 size="small"
                                                 sx={{
                                                     bgcolor: 'color-mix(in oklab, var(--accent-500) 16%, transparent)',
                                                     color: 'var(--accent-600)',
                                                     fontWeight: 500,
                                                 }}
                                             />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 0, pb: 2 }}>
                                        <Typography sx={{ color: 'var(--text-secondary)', mb: 1 }}>
                                            {resource.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                            {resource.children.map((group) => (
                                                <Box key={group.group}>
                                                    <Typography sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 0.5 }}>
                                                        {group.group}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {group.items.map((item) => (
                                                            <Link
                                                                key={item.href}
                                                                href={item.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                underline="hover"
                                                                sx={{ color: 'var(--accent-600)', fontSize: '0.9rem' }}
                                                            >
                                                                {item.title}
                                                            </Link>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        ) : (
                            <ListItem
                                key={resource.title}
                                alignItems="flex-start"
                                sx={{
                                    px: 0,
                                    py: 1.25,
                                    borderBottom: '1px solid color-mix(in oklab, var(--text-primary) 6%, transparent)',
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, color: 'var(--accent-500)', mt: 0.5 }}>
                                    {resource.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            {resource.href ? (
                                                <Link
                                                    href={resource.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    underline="hover"
                                                    sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
                                                >
                                                    {resource.title}
                                                </Link>
                                            ) : (
                                                <Typography sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                                    {resource.title}
                                                </Typography>
                                            )}
                                            {resource.href && <LaunchIcon fontSize="small" sx={{ color: 'var(--text-secondary)' }} />}
                                            <Chip
                                                label={resource.tag}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'color-mix(in oklab, var(--accent-500) 16%, transparent)',
                                                    color: 'var(--accent-600)',
                                                    fontWeight: 500,
                                                }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Typography component="span" sx={{ color: 'var(--text-secondary)', display: 'block', mt: 0.5 }}>
                                            {resource.description}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        )
                    ))}
                </List>
                <Typography sx={{ mt: 2, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Нужен материал под конкретную задачу? Ищите на нашем сайте!
                </Typography>
            </Box>
        </Modal>
    );
};

export default ResourcesModal;