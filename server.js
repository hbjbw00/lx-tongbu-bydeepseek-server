const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 10000;

const AUTH_KEY = process.env.AUTH_KEY || 'lx-music';

app.use(bodyParser.json({ limit: '10mb' }));

// 存储数据（简单内存存储，生产环境应该用数据库）
let syncData = {
    list: [],
    timestamp: Date.now()
};

// 洛雪音乐认证中间件
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let clientKey = null;

    // 支持多种认证方式
    if (authHeader && authHeader.startsWith('Bearer ')) {
        clientKey = authHeader.substring(7);
    } else if (req.query.key) {
        clientKey = req.query.key;
    } else if (req.body.key) {
        clientKey = req.body.key;
    }

    console.log('Auth attempt with key:', clientKey ? 'provided' : 'missing');

    if (!clientKey) {
        return res.status(200).json({
            status: 0,
            message: 'Authentication required',
            code: 401
        });
    }

    if (clientKey !== AUTH_KEY) {
        return res.status(200).json({
            status: 0,
            message: 'Invalid authentication key',
            code: 403
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
        status: 1,
        message: 'LX Music Sync Server is running',
        version: '1.0.0'
    });
});

// 洛雪音乐同步协议 - 关键端点
app.post('/api/sync', authenticate, (req, res) => {
    try {
        const { clientId, data } = req.body;
        
        console.log('Sync request from client:', clientId);
        
        if (data && data.list) {
            syncData = {
                list: data.list,
                timestamp: Date.now()
            };
            console.log('Data saved, items count:', data.list.length);
        }

        res.json({
            status: 1,
            message: 'Sync successful',
            data: syncData,
            code: 200
        });
    } catch (error) {
        res.json({
            status: 0,
            message: 'Sync failed: ' + error.message,
            code: 500
        });
    }
});

app.get('/api/sync', authenticate, (req, res) => {
    res.json({
        status: 1,
        message: 'Sync data retrieved',
        data: syncData,
        code: 200
    });
});

// 洛雪音乐可能需要的其他端点
app.get('/api/status', authenticate, (req, res) => {
    res.json({
        status: 1,
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),
        code: 200
    });
});

// 兼容性端点
app.all('/api/v2/sync', authenticate, (req, res) => {
    if (req.method === 'POST') {
        const { list } = req.body;
        if (list) {
            syncData = {
                list: list,
                timestamp: Date.now()
            };
        }
        res.json({
            status: 1,
            message: 'Sync v2 successful',
            data: syncData,
            code: 200
        });
    } else {
        res.json({
            status: 1,
            message: 'Sync v2 data',
            data: syncData,
            code: 200
        });
    }
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        status: 0,
        message: 'Endpoint not found: ' + req.originalUrl,
        code: 404
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log('=== LX Music Sync Server Started ===');
    console.log('Port:', port);
    console.log('Auth Key:', AUTH_KEY);
    console.log('Server URL: http://0.0.0.0:' + port);
    console.log('====================================');
});

module.exports = app;
