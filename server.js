const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

const AUTH_KEY = process.env.AUTH_KEY || 'lx-music';

app.use(express.json({ limit: '50mb' }));

let storage = {};

// 最简化的认证
app.use((req, res, next) => {
    const key = req.headers['authorization'] || req.query.key || req.body.key;
    
    if (!key || key !== AUTH_KEY) {
        return res.json({
            status: 0,
            message: 'Authentication failed',
            code: 401
        });
    }
    next();
});

// 健康检查
app.get('/healthz', (req, res) => res.send('OK'));

// 根路径
app.get('/', (req, res) => res.json({ status: 1, message: 'OK' }));

// 同步端点 - 兼容多种路径
app.post('/api/sync', (req, res) => {
    try {
        const { clientId, data } = req.body;
        if (data) storage = data;
        
        res.json({
            status: 1,
            message: 'Success',
            data: storage,
            code: 200
        });
    } catch (error) {
        res.json({ status: 0, message: error.message, code: 500 });
    }
});

app.get('/api/sync', (req, res) => {
    res.json({
        status: 1,
        message: 'Success', 
        data: storage,
        code: 200
    });
});

// 启动
app.listen(port, '0.0.0.0', () => {
    console.log('Server ready on port', port);
});
