import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // <--- НОВЫЙ ИМПОРТ

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        {/* Это позволяет приложению слушать изменения URL */}
        <BrowserRouter> 
            <App />
        </BrowserRouter>
    </React.StrictMode>
);