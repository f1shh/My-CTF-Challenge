部署后目录结构：

![](https://i.loli.net/2019/10/22/54wp6tiShkGOeFJ.png)

把 front/dist 目录下打包后的前端代码复制到 web 目录下，再建一个 backend 目录放后端目录，然后进入 backend 目录，导入 d3guestbook.sql 到 mysql 数据库中，启动后端：

```
npm install
node index.js
```

然后配置 nginx 反代：

```
server {
	listen 80 default_server;
	listen [::]:80 default_server;

	root /app;

	index index.html index.htm index.nginx-debian.html;

	server_name _;

	location /api {
		proxy_pass http://127.0.0.1:8000;
	}

	location / {
		try_files $uri $uri/ /index.html;
	}
}
```

重启 nginx ，题目就部署完毕了。

然后参考

> https://wangxin1248.github.io/linux/2018/09/ubuntu18.04-install-chrome-headless.html

在服务器安装 Chrome ，然后使用 admin/261281f4497dd6c2acbf29212aa56311 在题目网页上登录，复制登录后的 cookie 粘贴到 bot.py 中的对应位置，最后运行 bot.py

