var express = require('express');
var app = express();
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var crypto = require('crypto');
var myxss = require("./myxss");
var url = require("url");

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// database
// 261281f4497dd6c2acbf29212aa56311
var pool  = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database:'d3guestbook',
    port: 3306
});
var sqlMap = {
    addUser: 'INSERT INTO users(username, password) VALUES(?, ?)',
    queryUserByName: 'SELECT * FROM users WHERE username = ?',
    queryUserById: 'SELECT username FROM users WHERE id = ?',
    addPost: 'INSERT INTO posts(userid, content) VALUES(?, ?)',
    queryPosts: 'SELECT id, content FROM posts WHERE userid = ?',
    queryPostById: 'SELECT id, content FROM posts WHERE userid = ? and id = ?',
    queryPostByAdmin: 'SELECT id, content FROM posts WHERE id = ?',
    deletePost: 'DELETE FROM posts WHERE id = ? and userid = ?',
    addUrl: 'INSERT INTO urls(url, viewed) VALUES(?, 0)',
};

// session
var identityKey = 'sessid';
var secretKey = 'f1sh2333d3guestbook';
app.use(session({
    name: identityKey,
    secret: secretKey,
    store: new FileStore(),
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: false
    }
}));

var csrfProtection = function (req, res, next) {
    var token = req.query.token || req.body.token;
    if(req.cookies[identityKey] && req.cookies[identityKey] == token) {
        next();
    } else if(req.get('Referer') && url.parse(req.get('Referer'), true).hostname.endsWith(`.d3guestbook.d3ctf.io`)) {
        next();
    } else {
        res.status(403);
        res.send("");
    }
};
app.use(csrfProtection);

// routers
app.post('/api/register', function (req, res) {
    if(!req.session.user) {
        pool.getConnection(function (err, connection) {
            connection.query(sqlMap.addUser, [req.body.username, crypto.createHash('md5').update(secretKey + req.body.password).digest('hex')], function(err, result) {
                connection.release();
                if(err) {
                    res.json({ret_code: 1, ret_msg: 'Register failed.'});
                    return;
                }
                res.json({ret_code: 0, ret_msg: 'Register success.'});
            });
        });
    } else {
        res.json({ret_code: 1, ret_msg: 'Already login.'});
    }
});

app.post('/api/login', function (req, res) {
    if(!req.session.user) {
        pool.getConnection(function (err, connection) {
            connection.query(sqlMap.queryUserByName, [req.body.username], function(err, result) {
                connection.release();
                if(err) {
                    res.json({ret_code: 1, ret_msg: 'Login failed.'});
                    return;
                }
                if(result[0] && result[0].password == crypto.createHash('md5').update(secretKey + req.body.password).digest('hex')) {
                    req.session.regenerate(function (err) {
                        if(err){
                            res.json({ret_code: 2, ret_msg: 'Login failed.'});
                            return;
                        }
                        req.session.user = result[0].id;
                        res.json({ret_code: 0, ret_msg: 'Login success.'});
                    });
                } else {
                    res.json({ret_code: 3, ret_msg: 'Incorrect username or password.'});
                }
            });
        });
    } else {
        res.json({ret_code: 0, ret_msg: 'Already login.'});
    }
});

app.post('/api/post', function (req, res) {
    if(req.session.user && req.session.user !== 1) {
        var content = myxss.process(req.body.content);
        pool.getConnection(function (err, connection) {
            connection.query(sqlMap.addPost, [req.session.user.toString(), content], function(err, result) {
                connection.release();
                if(err) {
                    res.json({ret_code: 1, ret_msg: 'Message failed.'});
                    return;
                }
                res.json({ret_code: 0, ret_msg: 'Message success.'});
            });
        });
    } else {
        res.json({ret_code: 2, ret_msg: 'Not login.'});
    }
});

app.get('/api/post/:id', function (req, res) {
    var data = [];
    if(req.session.user) {
        if(req.session.user !== 1) {
            pool.getConnection(function (err, connection) {
                connection.query(sqlMap.queryPostById, [req.session.user.toString(), req.params.id], function(err, result) {
                    connection.release();
                    if(err) {
                        res.json({ret_code: 1, ret_msg: 'Query failed.', data: data});
                        return;
                    }
                    result.forEach(function (element) {
                        data.push({id: element.id, content: element.content});
                    });
                    res.json({ret_code: 0, ret_msg: 'Query success.', data: data});
                });
            });
        } else {
            pool.getConnection(function (err, connection) {
                connection.query(sqlMap.queryPostByAdmin, [req.params.id], function(err, result) {
                    connection.release();
                    if(err) {
                        res.json({ret_code: 1, ret_msg: 'Query failed.', data: data});
                        return;
                    }
                    result.forEach(function (element) {
                        data.push({id: element.id, content: element.content});
                    });
                    res.json({ret_code: 0, ret_msg: 'Query success.', data: data});
                });
            });            
        }
    } else {
        res.json({ret_code: 2, ret_msg: 'Not login.'});
    }
});

app.get('/api/posts', function (req, res) {
    var data = [];
    if(req.session.user) {
        pool.getConnection(function (err, connection) {
            connection.query(sqlMap.queryPosts, [req.session.user.toString()], function(err, result) {
                connection.release();
                if(err) {
                    res.json({ret_code: 1, ret_msg: 'Query failed.', data: data});
                    return;
                }
                result.forEach(function (element) {
                    data.push({id: element.id, content: element.content});
                });
                res.json({ret_code: 0, ret_msg: 'Query success.', data: data});
            });
        });
    } else {
        res.json({ret_code: 2, ret_msg: 'Not login.', data: data});
    }
});

app.get('/api/post/:id/delete', function (req, res) {
    if(req.session.user) {
        req.params.id = req.params.id == '68' ? '1' : req.params.id;
        pool.getConnection(function (err, connection) {
            connection.query(sqlMap.deletePost, [req.params.id, req.session.user.toString()], function(err, result) {
                connection.release();
                if(err) {
                    res.jsonp({ret_code: 1, ret_msg: 'Delete failed.'});
                    return;
                }
                res.jsonp({ret_code: 0, ret_msg: 'Delete success.'});
            });
        });
    } else {
        res.jsonp({ret_code: 2, ret_msg: 'Not login.'});
    }
});

app.get('/api/user', function (req, res) {
    if(req.session.user) {
        pool.getConnection(function (err, connection) {
            connection.query(sqlMap.queryUserById, [req.session.user.toString()], function(err, result) {
                connection.release();
                if(err) {
                    res.json({ret_code: 1, ret_msg: 'Query failed.'});
                    return;
                }
                res.json({ret_code: 0, ret_msg: 'Query success.', user: result[0]});
            });
        });
    } else {
        res.json({ret_code: 2, ret_msg: 'Not login.'});
    }
});

app.post('/api/report', function (req, res) {
    var code = crypto.createHash('md5').update(Math.random().toString(36).slice(-8)).digest('hex').substr(0, 6);
    if(req.session.code && req.body.code && req.session.code === crypto.createHash('md5').update(req.body.code).digest('hex').substr(0, 6)) {
        req.session.code = code;
        var verification = `substr(md5(?), 0, 6) === '${code}'`;
        if(url.parse(req.body.url, true).hostname.endsWith(".d3guestbook.d3ctf.io")) {
            pool.getConnection(function (err, connection) {
                connection.query(sqlMap.addUrl, [req.body.url], function(err, result) {
                    connection.release();
                    if(err) {
                        res.json({ret_code: 1, ret_msg: 'Report failed.', verification: verification});
                        return;
                    }
                    res.json({ret_code: 0, ret_msg: 'Report success.', verification: verification});
                });
            });
        } else {
            res.json({ret_code: 2, ret_msg: 'URL must be on this site.', verification: verification});
        }
    } else {
        req.session.code = code;
        var verification = `substr(md5(?), 0, 6) === '${code}'`;
        res.json({ret_code: 1, ret_msg: 'Verification code error.', verification: verification});
    }
});

app.listen(8000);
