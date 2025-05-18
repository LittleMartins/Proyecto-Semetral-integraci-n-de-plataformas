const express = require('express');
const path = require('path');
const app = express();

// Configurar MIME types
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
    }
    next();
});

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Rutas específicas para las páginas principales
app.get('/catalogo.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'catalogo.html'));
});

app.get('/iniciar-sesion.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'iniciar-sesion.html'));
});

app.get('/mi-perfil.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mi-perfil.html'));
});

// Ruta por defecto
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 