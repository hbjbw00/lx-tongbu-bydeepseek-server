const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 10000;

// 从环境变量读取密钥，如果没有设置则使用默认值
const AUTH_KEY = process.env.AUTH_KEY || 'lx-music-default-key';

app.use(bodyParser.json());

// 简单的认证中间件
const authenticate = (req, res, next) => {
    const clientKey = req.headers['authorization'] || req.query.key;
    
    if (!clientKey) {
        return res.status(401).json({
            code: 401,
            message: 'Authentication required'
        });
    }
    
    if (clientKey !== AUTH_KEY) {
        return res.status(403).json({
            code: 403,
            message: 'Invalid authentication key'
        });
    }
    
    next();
};

// 根路径响应
app.get('/', (req, res) => {
    res.json({
        code: 200,
        message: 'LX Music Sync Server is running',
        version: '1.0.0'
    });
});

// 状态检查
app.get('/api/status', authenticate, (req, res) => {
    res.json({
        code: 200,
        message: 'Service is healthy',
        timestamp: new Date().toISOString()
    });
});

// 同步相关接口
app.post('/api/sync/data', authenticate, (req, res) => {
    // 这里处理同步数据
    res.json({
        code: 200,
        message: 'Sync data received'
    });
});

app.get('/api/sync/data', authenticate, (req, res) => {
    // 这里返回同步数据
    res.json({
        code: 200,
        message: 'Sync data returned',
        data: {}
    });
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
    console.log(`LX Music Sync Server running on port ${port}`);
    console.log(`Authentication key: ${AUTH_KEY}`);
    console.log(`Server URL: http://0.0.0.0:${port}`);
});

module.exports = app;
