## 🧑‍💻 写在开头

---

> 本项目使用的是 node18.18.0，使用的都是较新版本的包，在配置 lint 的时候 stylelint 的插件容易抽风，特别是配置顺序修正的时候，重启 vscode 即可，并非配置有问题。

## 你能学到什么？

希望在你阅读本篇文章之后，不会觉得浪费了时间。如果你跟着读下来，你将会学到：

- 🧑‍ 一个标准化的项目初始化、代码规范、提交规范的配置流程
- 🍑 eslint、stylelint 及 prettier 的配置
- 🍒 代码提交规范的第三方工具强制约束方式实现

## 同系列文章列举

### 项目初始化相关

- [package.json 详解](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [LICENSE 文件都有啥?](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [.gitignore?](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [项目 install 不够快? 配置下 npmrc | yarnrc 吧!](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)

### 解决代码风格问题

- [EditorConfig 统一编辑器风格](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [Prettier&保存自动格式化](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)

### 代码质量问题

- [ESLint&保存自动修复](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [StyleLint&保存自动修复](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [ESLint、Stylelint 和 Prettier 的冲突](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [lint-staged&husky](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [commitlint + changelog](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)

### 项目配置流程

- [React18+ts5+webpack5 项目模板配置](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [React18+ts5+Storybook 组件库搭建](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [webpack 基本配置解析](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [webpack 基本优化](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [webpack 原理解析](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [你不得不知道的 babel](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)
- [0 基础上手 rollup 打包](https://editor.mdnice.com/?outId=d6c05ad8402e4665bb8e51d1216ca584)

## 🍐 一、项目初始化及配置

### package.json

package.json 是基于 Node.js 生态系统的任何项目（尤其是前端项目）的核心文件之一。它在项目中扮演了多个重要角色：

- **项目元数据（Metadata）**: 它包含了项目的元数据，如项目名称、版本、描述、作者、许可证等。
- **依赖管理（Dependency Management）**: 它列出了项目所依赖的 npm 包及其版本，这包括 dependencies 和 devDependencies 等。
- **脚本（Scripts）**: scripts 字段允许定义可以通过 npm run 命令执行的脚本，使得启动、构建、测试和部署等操作可以自动化。
- **版本控制（Version control）**: 通过 version 字段指定，可以帮助管理项目的发布和版本控制。
- **配置平台（Platform Config）**: 它可以指明项目运行所需的 Node.js 或 npm 版本，有助于确保一致的开发环境。

```js
yarn init -y
```

```json
{
	"name": "lint_demo",
	"version": "1.0.0",
	"description": "a lint demo ",
	"main": "dist/boundle.js",
	"author": "xxx",
	"license": "MIT",
	"private": false
}
```

### LICENSE

LICENSE 文件是指软件项目中包含的许可证文件，用于规定该软件在何种条件下可以被使用、复制、修改和分发。LICENSE 文件通常包含了开源许可证的全文或摘要，以及适用该许可证的条款和条件。在开源软件项目中，LICENSE 文件是非常重要的，它定义了开发者和用户之间的权利和责任，确保了代码的合法使用和共享。

常见的开源许可证包括 MIT 许可证、GNU 通用公共许可证（GPL）、Apache 许可证等。每种许可证都有不同的要求和限制，开发者在选择和使用许可证时需要仔细考虑项目的需求和目标。

可以在[choosealicense](https://choosealicense.com/)网站选择一个合适的

### .gitignore

`.gitignore`文件是用来指定哪些文件或目录不应该被 Git 版本控制系统跟踪的配置文件。在项目中，有些文件（如编译生成的文件、日志文件、临时文件等）不应该被包含在版本控制中，因为它们可能包含敏感信息、过时的内容或者不必要的文件。通过.gitignore 文件，可以告诉 Git 哪些文件应该被忽略，不会被提交到代码仓库中。

使用 vscode 的 gitignore 插件，下载安装该插件之后， ctrl+shift+p 召唤命令面板，输入 Add gitignore 命令，即可在输入框输入系统或编辑器名字，来自动添加需要忽略的文件或文件夹至 .gitignore 中。

### .npmrc | .yarnrc

`npmrc` 和 `yarnrc` 是两个配置文件，用于配置 npm 和 Yarn 包管理器的行为和设置。它们分别用于配置 npm 和 Yarn 的命令行工具的行为，例如设置镜像源、代理、缓存路径等。

**npmrc**

`npmrc` 是 npm 的配置文件，通常是 `.npmrc` 文件。你可以在项目级别或全局级别创建 `.npmrc` 文件来配置 npm 的行为。

**配置方式：**

1. **项目级别配置：** 在项目根目录下创建 `.npmrc` 文件，并添加所需配置。
2. **全局级别配置：** 使用命令 `npm config edit` 打开全局配置文件，并添加所需配置。

**常见配置项：**

- `registry`：设置包的下载源。
- `proxy` 和 `https-proxy`：设置代理服务器。
- `cache`：设置包的缓存路径。
- `prefix`：设置全局安装包的路径。
- `strict-ssl`：是否强制使用 SSL。

示例

```js
# .npmrc

# 设置下载源为淘宝镜像，淘宝证书到期了，换了
registry=https://registry.npm.taobao.org/

# 设置代理服务器
proxy=http://proxy.example.com:8080
https-proxy=http://proxy.example.com:8080

# 设置包的缓存路径
cache=/path/to/npm-cache

# 设置全局安装包的路径
prefix=/path/to/npm-global
```

**yarnrc**

`yarnrc` 是 Yarn 的配置文件，通常是 `.yarnrc` 或 `.yarnrc.yml` 文件。你可以在项目级别或全局级别创建 `.yarnrc` 文件来配置 Yarn 的行为。

**配置方式：**

1. **项目级别配置：** 在项目根目录下创建 `.yarnrc` 文件，并添加所需配置。
2. **全局级别配置：** 使用命令 `yarn config set` 添加全局配置。

**常见配置项：**

- `registry`：设置包的下载源。
- `proxy` 和 `https-proxy`：设置代理服务器。
- `cache-folder`：设置包的缓存路径。
- `preferred-cache-folder`：设置首选缓存路径。
- `nodeLinker`：设置 Node 模块链接器。

**示例：**

```
# .yarnrc

# 设置下载源为淘宝镜像，淘宝证书到期了，换了
registry "https://registry.npm.taobao.org/"

# 设置代理服务器
proxy "http://proxy.example.com:8080"
https-proxy "http://proxy.example.com:8080"

# 设置包的缓存路径
cache-folder "/path/to/yarn-cache"

# 设置首选缓存路径
preferred-cache-folder "/path/to/preferred-cache"
```

配置文件中的每一行都应该是一个配置项，以 `key value` 的格式表示。你可以根据需要添加或修改这些配置项来定制 npm 和 Yarn 的行为。

### README.md

README.md 文件通常是一个项目的说明文档，用于向其他开发者或用户介绍项目的内容、使用方法、贡献指南等信息。.md 代表 Markdown 格式，Markdown 是一种轻量级的标记语言，用于简单地排版文档。

README.md 文件通常包含以下内容：

- 项目名称和简介：简要介绍项目的名称、功能和用途。
- 安装说明：指导用户如何安装项目的依赖或部署项目。
- 使用方法：说明如何使用项目，包括配置、运行命令等。
- 示例：提供一些示例代码或截图，展示项目的功能。
- 贡献指南：说明如何贡献代码或报告问题。
- 版本历史：列出项目的版本历史和更新内容。
- 许可证信息：说明项目的许可证类型和使用限制。

## 🍎 二、规范代码与提交

### EditorConfig

.editorconfig 文件是用来帮助开发人员在不同的编辑器和 IDE 中保持一致的代码风格和格式的配置文件。它可以定义一些基本的编辑器设置，如缩进风格、换行符类型、字符编码等，以确保团队成员在不同的编辑器中编写的代码具有一致的风格。

.editorconfig 文件的语法很简单，通常由一系列键值对组成，每个键值对表示一项编辑器配置。以下是一个示例.editorconfig 文件的内容：

```js
# EditorConfig 文件示例

# 表示这是项目根目录下的顶级 .editorconfig 文件，编辑器在查找配置时会停止向上查找
root = true

# 匹配所有文件
[*]
# 使用 Unix 风格的换行符
end_of_line = lf
# 文件末尾会插入一个空行
insert_final_newline = true

# 匹配 JavaScript 文件
[*.js]
# 使用空格缩进
indent_style = space
# 缩进大小为 4
indent_size = 4

# 匹配 Markdown 文件
[*.md]
# 使用制表符缩进
indent_style = tab
```

常见配置项 .editorconfig 文件支持的配置项有很多，常见的包括：

- root：是否是项目根目录下的顶级 .editorconfig 文件。
- indent_style：缩进风格，可以是 tab（制表符）或 space（空格）。
- indent_size：缩进大小，对于 tab 缩进风格无效。
- tab_width：制表符宽度，用于 tab 缩进风格。
- end_of_line：换行符类型，可以是 lf（Unix 风格）、crlf（Windows 风格）或 cr（旧版 Mac 风格）。
- charset：字符编码，通常设置为 utf-8。
- trim_trailing_whitespace：是否去除行末多余的空格。
- insert_final_newline：文件末尾是否插入空行。以上是一些常见的配置项，具体可以根据项目需要进行配置。详细的配置项列表和说明可以参考 EditorConfig 官方文档。

这里解释下空格为什么需要统一，为什么有几种风格？换行符类型的不同风格主要是由于不同操作系统对换行符的处理方式不同所导致的。

`LF（Line Feed）`：在 Unix 和类 Unix 系统（如 Linux、macOS、FreeBSD 等）中使用的换行符。在文本文件中，每行结尾只有 LF 字符。

`CRLF（Carriage Return + Line Feed）`：在 Windows 系统中使用的换行符。在文本文件中，每行结尾有 CR 和 LF 两个字符组成。

`CR（Carriage Return）`：在旧版 Mac 系统中使用的换行符。在文本文件中，每行结尾只有 CR 字符。

这些不同的换行符类型源于早期计算机系统中不同的文本处理方式，如今在不同的操作系统和文本编辑器中仍然会存在这些差异。因此，.editorconfig 文件中的 end_of_line 配置选项允许你指定在项目中使用的换行符类型，以便在不同的环境中保持一致的换行符风格。

如果在一个项目中不同的文件使用了不同的换行符类型，可能会导致一些问题，主要包括：

- 跨平台兼容性问题：不同的操作系统对换行符的处理方式不同，如果文件中混合使用了不同的换行符类型，可能会导致在不同操作系统下的编辑器或工具处理文件时出现问题，如显示异常或解析错误。

- 版本控制问题：版本控制系统（如 Git）可能会在提交和比较文件时将换行符转换为统一的格式，如果文件中混合使用了不同的换行符类型，可能会导致版本控制系统不正确地处理换行符，导致代码冲突或历史记录混乱。

- 可读性问题：混合使用不同的换行符类型会使代码在不同的编辑器或工具中显示不一致，降低代码的可读性和维护性。

## 🍓 二、主体内容 2

🧑‍💻☀️🍐🍎🍑🍉🍒🥑🥝

## 🍋 写在最后

如果你看到这里了，并且觉得这篇文章对你有所帮助，希望你能够点赞 👍 和收藏 ⭐ 支持一下作者 🙇🙇🙇，感谢 🍺🍺！如果文中有任何不准确之处，也欢迎您指正，共同进步。感谢您的阅读，期待您的点赞 👍 和收藏 ⭐！

- [个人作品集](https://editor.mdnice.com/?outId=e007c3dbe88248f2856075e1ab4de3c0)
- [个人博客](https://editor.mdnice.com/?outId=e007c3dbe88248f2856075e1ab4de3c0)
- [知识库](https://editor.mdnice.com/?outId=e007c3dbe88248f2856075e1ab4de3c0)

往期文章

- [文章 1](https://editor.mdnice.com/?outId=e007c3dbe88248f2856075e1ab4de3c0)
- [文章 2](https://editor.mdnice.com/?outId=e007c3dbe88248f2856075e1ab4de3c0)
- [文章 3](https://editor.mdnice.com/?outId=e007c3dbe88248f2856075e1ab4de3c0)
- [文章 4](https://editor.mdnice.com/?outId=e007c3dbe88248f2856075e1ab4de3c0)

感兴趣的同学可以关注下我的公众号 ObjectX 前端实验室 ![](https://files.mdnice.com/user/62323/f700dfe9-e2b9-4697-abc3-79ebb2df6fac.png =50%x)

🌟 少走弯路 | ObjectX 前端实验室 🛠️「精选资源｜实战经验｜技术洞见」
