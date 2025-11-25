const PostCreationModal = ({ open, handleClose }) => {

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '600px', md: '700px' },
        bgcolor: '#383838',
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    const uploadAreaStyle = {
        border: '2px dashed #00bfa5',
        borderRadius: '12px',
        padding: 2,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: 'rgba(0, 191, 165, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100px',
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="post-creation-modal-title"
        >
            <Box sx={modalStyle}>
                <Typography id="post-creation-modal-title" variant="h5" component="h2" sx={{ color: '#ffffff', fontWeight: 300, textAlign: 'center', marginBottom: 2 }}>
                    Создать новый пост
                </Typography>

                {/* 1. Поле для ввода заголовка проекта */}
                <TextField
                    label="Заголовок проекта"
                    variant="filled"
                    fullWidth
                    sx={inputStyle}
                />

                {/* 2. Область для прикрепления файла */}
                <Box sx={uploadAreaStyle}>
                    <CloudUploadIcon sx={{ fontSize: 40, color: '#00bfa5', mb: 1 }} />
                    <Typography variant="body1" sx={{ color: '#bdbdbd' }}>
                        Нажмите или перетащите файл (Изображение/Видео)
                    </Typography>
                    <input type="file" hidden accept="image/*,video/*" />
                </Box>

                {/* 3. Поле для ввода основного текста */}
                <TextField
                    label="Введите текст поста (до 10000 символов)"
                    variant="filled"
                    fullWidth
                    multiline
                    rows={8}
                    sx={inputStyle}
                />

                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        marginTop: 1,
                        backgroundColor: '#00bfa5',
                        '&:hover': { backgroundColor: '#009688' },
                        color: '#ffffff',
                        padding: '12px 0',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        borderRadius: '8px'
                    }}
                    onClick={handleClose}
                >
                    Опубликовать
                </Button>
            </Box>
        </Modal>
    );
};