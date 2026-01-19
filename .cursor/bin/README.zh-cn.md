# Gitea MCP 服务器

[English](README.md) | [繁體中文](README.zh-tw.md)

**Gitea MCP 服务器** 是一个集成插件，旨在将 Gitea 与 Model Context Protocol (MCP) 系统连接起来。这允许通过 MCP 兼容的聊天界面无缝执行命令和管理仓库。

[![在 VS Code 中使用 Docker 安装](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=gitea&inputs=[{%22id%22:%22gitea_token%22,%22type%22:%22promptString%22,%22description%22:%22Gitea%20Personal%20Access%20Token%22,%22password%22:true}]&config={%22command%22:%22docker%22,%22args%22:[%22run%22,%22-i%22,%22--rm%22,%22-e%22,%22GITEA_ACCESS_TOKEN%22,%22docker.gitea.com/gitea-mcp-server%22],%22env%22:{%22GITEA_ACCESS_TOKEN%22:%22${input:gitea_token}%22}}) [![在 VS Code Insiders 中使用 Docker 安装](https://img.shields.io/badge/VS_Code_Insiders-Install_Server-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=gitea&inputs=[{%22id%22:%22gitea_token%22,%22type%22:%22promptString%22,%22description%22:%22Gitea%20Personal%20Access%20Token%22,%22password%22:true}]&config={%22command%22:%22docker%22,%22args%22:[%22run%22,%22-i%22,%22--rm%22,%22-e%22,%22GITEA_ACCESS_TOKEN%22,%22docker.gitea.com/gitea-mcp-server%22],%22env%22:{%22GITEA_ACCESS_TOKEN%22:%22${input:gitea_token}%22}}&quality=insiders)

## 目录

- [Gitea MCP 服务器](#gitea-mcp-服务器)
  - [目录](#目录)
  - [什么是 Gitea？](#什么是-gitea)
  - [什么是 MCP？](#什么是-mcp)
  - [🚧 安装](#-安装)
    - [在 VS Code 中使用](#在-vs-code-中使用)
    - [📥 下载官方二进制版本](#-下载官方二进制版本)
    - [🔧 从源码构建](#-从源码构建)
    - [📁 加入 PATH](#-加入-path)
  - [🚀 使用](#-使用)
  - [✅ 可用工具](#-可用工具)
  - [🐛 调试](#-调试)
  - [🛠 疑难排解](#-疑难排解)

## 什么是 Gitea？

Gitea 是一个由社区管理的轻量级代码托管解决方案，使用 Go 语言编写，采用 MIT 许可证。Gitea 提供 Git 托管，包括仓库浏览、问题追踪、拉取请求等功能。

## 什么是 MCP？

Model Context Protocol (MCP) 是一种协议，允许通过聊天界面整合各种工具和系统。它能够无缝执行命令并管理仓库、用户及其他资源。

## 🚧 安装

### 在 VS Code 中使用

要快速安装，请使用本 README 顶部的安装按钮。

如需手动安装，请将以下 JSON 块添加到 VS Code 的用户设置 (JSON) 文件。可通过按 `Ctrl + Shift + P` 并输入 `Preferences: Open User Settings (JSON)`。

也可添加到工作区的 `.vscode/mcp.json` 文件，方便与他人共享配置。

> `.vscode/mcp.json` 文件不需要 `mcp` 键。

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "gitea_token",
        "description": "Gitea 个人访问令牌",
        "password": true
      }
    ],
    "servers": {
      "gitea-mcp": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "-e",
          "GITEA_ACCESS_TOKEN",
          "docker.gitea.com/gitea-mcp-server"
        ],
        "env": {
          "GITEA_ACCESS_TOKEN": "${input:gitea_token}"
        }
      }
    }
  }
}
```

### 📥 下载官方二进制版本

可在 [官方 Gitea MCP 二进制版本](https://gitea.com/gitea/gitea-mcp/releases) 下载。

### 🔧 从源码构建

可用 Git 下载源码：

```bash
git clone https://gitea.com/gitea/gitea-mcp.git
```

构建前请先安装：

- make
- Golang（建议 Go 1.24 及以上）

然后运行：

```bash
make install
```

### 📁 加入 PATH

安装后，将 gitea-mcp 可执行文件复制到系统 PATH 目录，例如：

```bash
cp gitea-mcp /usr/local/bin/
```

## 🚀 使用

此示例适用于 Cursor，也可在 VSCode 使用插件。  
要配置 Gitea MCP 服务器，请将以下内容添加到 MCP 配置文件：

- **stdio 模式**

```json
{
  "mcpServers": {
    "gitea": {
      "command": "gitea-mcp",
      "args": [
        "-t",
        "stdio",
        "--host",
        "https://gitea.com"
        // "--token", "<your personal access token>"
      ],
      "env": {
        // "GITEA_HOST": "https://gitea.com",
        // "GITEA_INSECURE": "true",
        "GITEA_ACCESS_TOKEN": "<your personal access token>"
      }
    }
  }
}
```

- **http 模式**

```json
{
  "mcpServers": {
    "gitea": {
      "url": "http://localhost:8080/mcp",
      "headers": {
        "Authorization": "Bearer <your personal access token>"
      }
    }
  }
}
```

**默认日志路径**: `$HOME/.gitea-mcp/gitea-mcp.log`

> [!注意]
> 可通过命令行参数或环境变量提供 Gitea 主机和访问令牌。  
> 命令行参数优先。

一切设置完成后，可在 MCP 聊天框输入：

```text
列出我所有的仓库
```

## ✅ 可用工具

Gitea MCP 服务器支持以下工具：

|               工具                |   范围   |            描述            |
| :-------------------------------: | :------: | :------------------------: |
|         get_my_user_info          |   用户   |     获取已认证用户信息     |
|           get_user_orgs           |   用户   |   获取已认证用户关联组织   |
|            create_repo            |   仓库   |         创建新仓库         |
|             fork_repo             |   仓库   |          复刻仓库          |
|           list_my_repos           |   仓库   |      列出用户所有仓库      |
|           create_branch           |   分支   |         创建新分支         |
|           delete_branch           |   分支   |          删除分支          |
|           list_branches           |   分支   |        列出所有分支        |
|          create_release           | 版本发布 |       创建新版本发布       |
|          delete_release           | 版本发布 |        删除版本发布        |
|            get_release            | 版本发布 |        获取版本发布        |
|        get_latest_release         | 版本发布 |      获取最新版本发布      |
|           list_releases           | 版本发布 |      列出所有版本发布      |
|            create_tag             |   标签   |         创建新标签         |
|            delete_tag             |   标签   |          删除标签          |
|              get_tag              |   标签   |          获取标签          |
|             list_tags             |   标签   |        列出所有标签        |
|         list_repo_commits         |   提交   |        列出所有提交        |
|         get_file_content          |   文件   |    获取文件内容和元数据    |
|          get_dir_content          |   文件   |      获取目录内容列表      |
|            create_file            |   文件   |         创建新文件         |
|            update_file            |   文件   |        更新现有文件        |
|            delete_file            |   文件   |          删除文件          |
|        get_issue_by_index         |   问题   |       按索引获取问题       |
|         list_repo_issues          |   问题   |        列出所有问题        |
|           create_issue            |   问题   |         创建新问题         |
|       create_issue_comment        |   问题   |      在问题上创建评论      |
|            edit_issue             |   问题   |          编辑问题          |
|        edit_issue_comment         |   问题   |        编辑问题评论        |
|    get_issue_comments_by_index    |   问题   |     按索引获取问题评论     |
|     get_pull_request_by_index     | 拉取请求 |     按索引获取拉取请求     |
|      list_repo_pull_requests      | 拉取请求 |      列出所有拉取请求      |
|        create_pull_request        | 拉取请求 |       创建新拉取请求       |
|   create_pull_request_reviewer    | 拉取请求 |    为拉取请求添加审查者    |
|   delete_pull_request_reviewer    | 拉取请求 |    移除拉取请求的审查者    |
|     list_pull_request_reviews     | 拉取请求 |   列出拉取请求的所有审查   |
|      get_pull_request_review      | 拉取请求 |     按 ID 获取特定审查     |
| list_pull_request_review_comments | 拉取请求 |     列出审查的行内评论     |
|    create_pull_request_review     | 拉取请求 |  创建审查（可含行内评论）  |
|    submit_pull_request_review     | 拉取请求 |      提交待处理的审查      |
|    delete_pull_request_review     | 拉取请求 |          删除审查          |
|    dismiss_pull_request_review    | 拉取请求 |    驳回审查（可附消息）    |
|           search_users            |   用户   |          搜索用户          |
|         search_org_teams          |   组织   |        搜索组织团队        |
|          list_org_labels          |   组织   |        列出组织标签        |
|         create_org_label          |   组织   |        创建组织标签        |
|          edit_org_label           |   组织   |        编辑组织标签        |
|         delete_org_label          |   组织   |        删除组织标签        |
|           search_repos            |   仓库   |          搜索仓库          |
|   get_gitea_mcp_server_version    |  服务器  | 获取 Gitea MCP 服务器版本  |
|          list_wiki_pages          |   Wiki   |     列出所有 Wiki 页面     |
|           get_wiki_page           |   Wiki   | 获取 Wiki 页面内容和元数据 |
|        get_wiki_revisions         |   Wiki   |     获取 Wiki 修订历史     |
|         create_wiki_page          |   Wiki   |      创建新 Wiki 页面      |
|         update_wiki_page          |   Wiki   |     更新现有 Wiki 页面     |
|         delete_wiki_page          |   Wiki   |       删除 Wiki 页面       |

## 🐛 调试

启用调试模式时，请在 http 模式运行 Gitea MCP 服务器时加上 `-d` 标志：

```sh
./gitea-mcp -t http [--port 8080] --token <your personal access token> -d
```

## 🛠 疑难排解

如遇问题，可参考以下步骤：

1. **检查 PATH**：确保 `gitea-mcp` 可执行文件已在系统 PATH 目录中。
2. **验证依赖**：确认已安装 `make` 和 `Golang` 等必要依赖。
3. **检查配置**：仔细检查 MCP 配置文件是否有错误或遗漏。
4. **查看日志**：检查日志消息或警告以获取更多信息。

享受通过聊天探索和管理您的 Gitea 仓库！
