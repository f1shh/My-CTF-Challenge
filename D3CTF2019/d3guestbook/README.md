题目是一个在线留言板，注册登录后可以提交留言。

简单测试后会发现留言可以插入 HTML 标签，但是后端使用了标签名/属性名白名单做过滤，一般的危险标签和属性都被 ban 掉了。

控制台可以看到打包前的前端源码，审计一波。

第一个问题，CSRF token 是直接使用的 sessionid :

![](https://i.loli.net/2019/10/22/gOsGlfUzZAvxHCM.png)

因此如果我们能获得他人的 token 就可以登录他人账号。

第二个问题，我们传入的参数 this.$route.query.did 被拼接到了 jsonp 方法的 url 当中

![](https://i.loli.net/2019/10/22/Tbzn8rgAt4S5Eh2.png)

因此我们可以设置 did 为 `1/delete?callback=alert#` ，控制 jsonp 的 callback ，在 jsonp 方法中会直接执行：

![](https://i.loli.net/2019/10/22/24iXxOwKMIyhUQ6.png)

但是后端的 jsonp api 给 callback 做了校验，只能传入有限的字符，并不能任意执行 js 代码。

![](https://i.loli.net/2019/10/22/tQNjDp18CKn27kd.png)

所以我们需要把这两个问题结合利用一下，利用这个受限的 jsonp xss 来劫持 token 。

![](https://i.loli.net/2019/10/22/yZWi6sHP2R9z3D1.png)

我们可以看到 token 被渲染到了 id 为 messageForm 的 form 中，所以我们可以尝试劫持这个 form ，让他的 submit 后提交到我们的服务器，从而获取 token 。

如何劫持呢？利用两个 HTML5 的有趣属性：

> https://www.w3school.com.cn/tags/att_input_formaction.asp
>
> https://www.w3school.com.cn/tags/att_input_form.asp

我们可以利用留言功能插入一个在表单之外的 input 标签，再利用这两个属性来劫持表单：

![](https://i.loli.net/2019/10/22/5TKfeWEpiXULMya.png)

利用 jsonp xss 来点击它：

```
http://localhost:8180/#/?pid=72&did=23%2Fdelete%3Fcallback%3Dfish.click%23
```

token 就到手了：

![](https://i.loli.net/2019/10/22/WouDfkrBwhLAX7P.png)

report 这条 payload ，获得 admin 的 token 之后登录 admin 账号，在 admin 的留言中获得 flag 。