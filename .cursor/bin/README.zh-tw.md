# Gitea MCP 伺服器

[English](README.md) | [简体中文](README.zh-cn.md)

**Gitea MCP 伺服器** 是一個整合插件，旨在將 Gitea 與 Model Context Protocol (MCP) 系統連接起來。這允許通過 MCP 兼容的聊天界面無縫執行命令和管理倉庫。

[![在 VS Code 中使用 Docker 安裝](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=gitea&inputs=[{%22id%22:%22gitea_token%22,%22type%22:%22promptString%22,%22description%22:%22Gitea%20Personal%20Access%20Token%22,%22password%22:true}]&config={%22command%22:%22docker%22,%22args%22:[%22run%22,%22-i%22,%22--rm%22,%22-e%22,%22GITEA_ACCESS_TOKEN%22,%22docker.gitea.com/gitea-mcp-server%22],%22env%22:{%22GITEA_ACCESS_TOKEN%22:%22${input:gitea_token}%22}}) [![在 VS Code Insiders 中使用 Docker 安裝](https://img.shields.io/badge/VS_Code_Insiders-Install_Server-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=gitea&inputs=[{%22id%22:%22gitea_token%22,%22type%22:%22promptString%22,%22description%22:%22Gitea%20Personal%20Access%20Token%22,%22password%22:true}]&config={%22command%22:%22docker%22,%22args%22:[%22run%22,%22-i%22,%22--rm%22,%22-e%22,%22GITEA_ACCESS_TOKEN%22,%22docker.gitea.com/gitea-mcp-server%22],%22env%22:{%22GITEA_ACCESS_TOKEN%22:%22${input:gitea_token}%22}}&quality=insiders)

## 目錄

- [Gitea MCP 伺服器](#gitea-mcp-伺服器)
  - [目錄](#目錄)
  - [什麼是 Gitea？](#什麼是-gitea)
  - [什麼是 MCP？](#什麼是-mcp)
  - [🚧 安裝](#-安裝)
    - [在 VS Code 中使用](#在-vs-code-中使用)
    - [📥 下載官方二進位版本](#-下載官方二進位版本)
    - [🔧 從原始碼建置](#-從原始碼建置)
    - [📁 加入 PATH](#-加入-path)
  - [🚀 使用](#-使用)
  - [✅ 可用工具](#-可用工具)
  - [🐛 調試](#-調試)
  - [🛠 疑難排解](#-疑難排解)

## 什麼是 Gitea？

Gitea 是一個由社群管理的輕量級程式碼託管解決方案，使用 Go 語言編寫，採用 MIT 授權。Gitea 提供 Git 託管，包括倉庫瀏覽、議題追蹤、拉取請求等功能。

## 什麼是 MCP？

Model Context Protocol (MCP) 是一種協議，允許透過聊天介面整合各種工具與系統。它能夠無縫執行命令並管理倉庫、使用者及其他資源。

## 🚧 安裝

### 在 VS Code 中使用

欲快速安裝，請使用本 README 頂部的安裝按鈕。

如需手動安裝，請將下列 JSON 區塊加入 VS Code 的使用者設定 (JSON) 檔案。可按 `Ctrl + Shift + P` 並輸入 `Preferences: Open User Settings (JSON)`。

也可加入至工作區的 `.vscode/mcp.json` 檔案，方便與他人共享設定。

> `.vscode/mcp.json` 檔案不需 `mcp` 鍵。

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "gitea_token",
        "description": "Gitea 個人存取令牌",
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

### 📥 下載官方二進位版本

可至 [官方 Gitea MCP 二進位版本](https://gitea.com/gitea/gitea-mcp/releases) 下載。

### 🔧 從原始碼建置

可用 Git 下載原始碼：

```bash
git clone https://gitea.com/gitea/gitea-mcp.git
```

建置前請先安裝：

- make
- Golang（建議 Go 1.24 以上）

然後執行：

```bash
make install
```

### 📁 加入 PATH

安裝後，將 gitea-mcp 執行檔複製到系統 PATH 目錄，例如：

```bash
cp gitea-mcp /usr/local/bin/
```

## 🚀 使用

此範例適用於 Cursor，也可在 VSCode 使用插件。  
欲設定 Gitea MCP 伺服器，請將下列內容加入 MCP 設定檔：

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

**預設日誌路徑**: `$HOME/.gitea-mcp/gitea-mcp.log`

> [!注意]
> 可用命令列參數或環境變數提供 Gitea 主機與存取令牌。  
> 命令列參數優先。

一切設定完成後，可在 MCP 聊天框輸入：

```text
列出我所有的倉庫
```

## ✅ 可用工具

Gitea MCP 伺服器支援以下工具：

|               工具                |   範圍   |             描述             |
| :-------------------------------: | :------: | :--------------------------: |
|         get_my_user_info          |   用戶   |      取得已認證用戶資訊      |
|           get_user_orgs           |   用戶   |    取得已認證用戶所屬組織    |
|            create_repo            |   倉庫   |          創建新倉庫          |
|             fork_repo             |   倉庫   |           復刻倉庫           |
|           list_my_repos           |   倉庫   |       列出用戶所有倉庫       |
|           create_branch           |   分支   |          創建新分支          |
|           delete_branch           |   分支   |           刪除分支           |
|           list_branches           |   分支   |         列出所有分支         |
|          create_release           | 版本發布 |        創建新版本發布        |
|          delete_release           | 版本發布 |         刪除版本發布         |
|            get_release            | 版本發布 |         取得版本發布         |
|        get_latest_release         | 版本發布 |       取得最新版本發布       |
|           list_releases           | 版本發布 |       列出所有版本發布       |
|            create_tag             |   標籤   |          創建新標籤          |
|            delete_tag             |   標籤   |           刪除標籤           |
|              get_tag              |   標籤   |           取得標籤           |
|             list_tags             |   標籤   |         列出所有標籤         |
|         list_repo_commits         |   提交   |         列出所有提交         |
|         get_file_content          |   文件   |    取得文件內容與中繼資料    |
|          get_dir_content          |   文件   |       取得目錄內容列表       |
|            create_file            |   文件   |          創建新文件          |
|            update_file            |   文件   |         更新現有文件         |
|            delete_file            |   文件   |           刪除文件           |
|        get_issue_by_index         |   問題   |        依索引取得問題        |
|         list_repo_issues          |   問題   |         列出所有問題         |
|           create_issue            |   問題   |          創建新問題          |
|       create_issue_comment        |   問題   |       在問題上創建評論       |
|            edit_issue             |   問題   |           編輯問題           |
|        edit_issue_comment         |   問題   |         編輯問題評論         |
|    get_issue_comments_by_index    |   問題   |      依索引取得問題評論      |
|     get_pull_request_by_index     | 拉取請求 |      依索引取得拉取請求      |
|      list_repo_pull_requests      | 拉取請求 |       列出所有拉取請求       |
|        create_pull_request        | 拉取請求 |        創建新拉取請求        |
|   create_pull_request_reviewer    | 拉取請求 |     為拉取請求添加審查者     |
|   delete_pull_request_reviewer    | 拉取請求 |     移除拉取請求的審查者     |
|     list_pull_request_reviews     | 拉取請求 |    列出拉取請求的所有審查    |
|      get_pull_request_review      | 拉取請求 |      依 ID 取得特定審查      |
| list_pull_request_review_comments | 拉取請求 |      列出審查的行內評論      |
|    create_pull_request_review     | 拉取請求 |   創建審查（可含行內評論）   |
|    submit_pull_request_review     | 拉取請求 |       提交待處理的審查       |
|    delete_pull_request_review     | 拉取請求 |           刪除審查           |
|    dismiss_pull_request_review    | 拉取請求 |     駁回審查（可附訊息）     |
|           search_users            |   用戶   |           搜尋用戶           |
|         search_org_teams          |   組織   |         搜尋組織團隊         |
|          list_org_labels          |   組織   |         列出組織標籤         |
|         create_org_label          |   組織   |         創建組織標籤         |
|          edit_org_label           |   組織   |         編輯組織標籤         |
|         delete_org_label          |   組織   |         刪除組織標籤         |
|           search_repos            |   倉庫   |           搜尋倉庫           |
|   get_gitea_mcp_server_version    |  伺服器  |  取得 Gitea MCP 伺服器版本   |
|          list_wiki_pages          |   Wiki   |      列出所有 Wiki 頁面      |
|           get_wiki_page           |   Wiki   | 取得 Wiki 頁面內容與中繼資料 |
|        get_wiki_revisions         |   Wiki   |      取得 Wiki 修訂歷史      |
|         create_wiki_page          |   Wiki   |       創建新 Wiki 頁面       |
|         update_wiki_page          |   Wiki   |      更新現有 Wiki 頁面      |
|         delete_wiki_page          |   Wiki   |        刪除 Wiki 頁面        |

## 🐛 調試

啟用調試模式時，請在 http 模式執行 Gitea MCP 伺服器時加上 `-d` 旗標：

```sh
./gitea-mcp -t http [--port 8080] --token <your personal access token> -d
```

## 🛠 疑難排解

如遇問題，可參考以下步驟：

1. **檢查 PATH**：確保 `gitea-mcp` 執行檔已在系統 PATH 目錄中。
2. **驗證依賴**：確認已安裝 `make` 與 `Golang` 等必要依賴。
3. **檢查設定**：仔細檢查 MCP 設定檔是否有錯誤或遺漏。
4. **查看日誌**：檢查日誌訊息或警告以獲取更多資訊。

享受透過聊天探索與管理您的 Gitea 倉庫！
