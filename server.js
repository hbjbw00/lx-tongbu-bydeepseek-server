const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 10000;

const AUTH_KEY = process.env.AUTH_KEY || 'lx-music-default-key';

app.use(bodyParser.json());

// 认证中间件（支持多种方式）
const authenticate = (req, res, next) => {
    const clientKey = req.headers['authorization'] || 
                     req.query.key || 
                     req.query.auth_key ||
                     req.body.key;
    
    console.log('Auth attempt with key:', clientKey ? 'provided' : 'missing');
    
    if (!clientKey) {
        return res.status(401).json({
            code: 401,
            message: 'Authentication required'
        });
    }
    
    if (clientKey !== AUTH_KEY) {
        console.log('Invalid key provided');
        return res.status(403).json({
            code: 403,
            message: 'Invalid authentication key'
        });
    }
    
    console.log('Authentication successful');
    next();
};

// 健康检查
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// 根路径
app.get('/', (req, res) => {
    res.json({
        code: 200,
        message: 'LX Music Sync Server is running',
        version: '2.0.0'
    });
});

// 洛雪音乐可能需要的各种端点
app.get('/api/', authenticate, (req, res) => {
    res.json({code: 200, message: 'API is working'});
});

app.post('/api/', authenticate, (req, res) => {
    res.json({code: 200, message: 'API POST is working'});
});

// 同步端点（多种可能路径）
app.get('/api/sync', authenticate, (req, res) => {
    res.json({code: 200, message: 'Sync GET successful', data: {}});
});

app.post('/api/sync', authenticate, (req, res) => {
    res.json({code: 200, message: 'Sync POST successful'});
});

// 兼容旧版本路径
app.get('/sync', authenticate, (req, res) => {
    res.json({code: 200, message: 'Sync compatible endpoint'});
});

app.post('/sync', authenticate, (req, res) => {
    res.json({code: 200, message: 'Sync compatible endpoint POST'});
});

// 状态检查
app.get('/api/status', authenticate, (req, res) => {
    res.json({
        code: 200, 
        message: 'Service healthy',
        timestamp: new Date().toISOString()
    });
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        code: 404,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Auth key: ${AUTH_KEY}`);
});

module.exports = app;
