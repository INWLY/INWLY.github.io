推送至 GitHub：

在终端（Terminal）中，依次输入以下命令（每一行输入完按回车）：

# 1. 将新文件添加到暂存区
git add .

# 2. 提交更改，并写上备注
git commit -m "Add my first blog post"

# 3. 推送到 GitHub 远程仓库
git push


第六步：清理多余的模版文件

项目中有很多原作者自带的图片（例如各种 post-bg-xxx.jpg），你可以安全地删除它们。

进入图片文件夹：

在 Cursor 左侧文件栏，展开 img 文件夹。

识别并删除：

你可以按住 Ctrl (Windows) 或 Cmd (Mac) 键，多选以下文件，然后右键选择 Delete (删除)：

所有名字里带 post-bg- 但你并不需要的图片（如 post-bg-alibaba.jpg, post-bg-ioses.jpg 等）。

avatar-by.jpg (这是原作者的头像，你可以删掉，记得上传一个你自己的头像并命名为 avatar.jpg)。

about-BY-gentle.jpg 等其他看起来像演示用的图片。

⚠️ 警告：请保留以下文件，否则网站会出错：

home-bg.jpg (或者你已经替换成了你自己的名字)

404-bg.jpg (404页面的背景)

favicon.ico (网页标签栏的小图标)

不要删除 css, js, fonts 这些文件夹。

同步删除操作到 GitHub：

删除文件后，必须运行 Git 命令告诉 GitHub 这些文件被删了：

# 1. 自动识别删除和修改
git add .

# 2. 提交
git commit -m "Delete unused template images"

# 3. 推送
git push


常见问题排查 (Troubleshooting)

🔴 报错：! [rejected] master -> master (fetch first)

现象：git push 时提示 Updates were rejected because the remote contains work that you do not have locally。

原因：GitHub 上的代码比你本地的代码“新”。这通常是因为你之前在 GitHub 网页上直接修改了文件（比如 _config.yml），但你本地电脑还没同步这些修改。

解决方法：
在推送之前，先“拉取”合并远程的修改：

# 1. 拉取远程代码并自动合并
git pull origin master

# 2. 如果弹出编辑器（类似 Vim），按 Esc 键，输入 :wq 然后回车即可

# 3. 再次推送
git push
