import React from 'react';
import { Routes, Route } from 'react-router-dom'; // <--- НОВЫЙ ИМПОРТ
import PostPage from './PostPage'; 
import ResetPasswordPage from './ResetPasswordPage'; // <--- НОВЫЙ КОМПОНЕНТ

function App() {
    return (
        // Routes смотрит на текущий URL
        <Routes>
            {/* 1. Основной путь: Если URL = /, показываем PostPage */}
            <Route path="/" element={<PostPage />} />
            
            {/* 2. Сброс пароля: Если URL = /reset-password, показываем ResetPasswordPage */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* 3. Опционально: Обработка 404/несуществующих путей */}
            {/* <Route path="*" element={<PostPage />} /> */}
        </Routes>
    );
}

export default App;