# 我的藏书 · 纸质个人藏书管理

纯前端、零后端的实体纸质藏书管理 Web 应用。所有数据保存在**你自己浏览器的 IndexedDB** 里，不上传、不联网、不需要服务器。拿到项目 `npm install && npm run dev` 就能用。

---

## 一、功能一览

| 模块 | 说明 |
| --- | --- |
| 图书新增 / 编辑 | 手动录入全部字段；上传本地图片作为封面，支持更换、删除封面 |
| 图书列表 | 卡片视图；关键词全文检索（书名 / 作者 / ISBN / 备注）；按分类、存放位置筛选；按录入时间、书名、作者排序 |
| 数据导入 | CSV / JSON **增量导入**，严格去重，绝不覆盖既有数据；完成后弹窗提示新增 / 跳过数量 |
| 数据导出 | 一键导出全部藏书为 JSON，封面转 base64 内嵌，文件名 `藏书备份_YYYYMMDD.json` |
| 统计面板 | 藏书总量、分类数量、存放位置数量、含封面数量 + 各分类占比条形图 + 存放位置分布 |
| 主题与设置 | 浅色 / 深色主题切换并记住偏好；设置页固定展示数据风险提醒与备份引导 |

### 明确不做的事

- ❌ 不实现扫码 ISBN
- ❌ 不调用任何外部图书 API（豆瓣、Google Books 等一律不接）
- ❌ 没有借阅管理
- ❌ 不使用 localStorage 存储业务数据（localStorage 只存主题偏好这类非业务设置）
- ❌ 运行时零网络请求，所有资源本地加载

---

## 二、技术栈

| 类别 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | React 18 + TypeScript | 类型安全带注释 |
| 构建 | Vite 5 | 秒级冷启动 |
| 样式 | Tailwind CSS 3 | Notion 风格中性配色，`darkMode: 'class'` |
| 本地数据库 | Dexie.js 4 | 封装 IndexedDB，封面 Blob 直接入库 |
| 状态管理 | Zustand 5 | 轻量、无样板代码 |
| 图标 | Lucide React | 按需 tree-shaking |

依赖总数 5 个运行时包 + 7 个开发包，没有多余的东西。

---

## 三、目录结构

```
bookmanager_wb/
├── index.html                    入口 HTML（内联 SVG favicon，无外部资源）
├── package.json
├── vite.config.ts                Vite 配置（base: './'，dist 可直接双击打开）
├── tsconfig.json
├── tailwind.config.js            主题色、深色模式、动画
├── postcss.config.js
└── src/
    ├── main.tsx                  应用挂载入口
    ├── App.tsx                   根组件：布局组装 + 全局弹层 + 视图切换
    ├── index.css                 Tailwind 指令 + 全局基础样式（.wb-input / .wb-card 等）
    │
    ├── types/
    │   └── book.ts               全部业务类型：Book / BookFormValues / BookFilters / ImportResult / BookStats
    │
    ├── services/                 数据层：唯一直接接触 IndexedDB 的地方
    │   ├── db.ts                 Dexie 数据库定义（PaperBookManagerDB）+ 可用性探测
    │   ├── bookService.ts        CRUD、规范化、去重键、筛选排序、选项提取
    │   ├── importService.ts      CSV / JSON 解析 + 去重判定 + 增量写入
    │   ├── exportService.ts      备份对象构建 + JSON 导出下载
    │   └── statsService.ts       统计聚合（总量 / 分类占比 / 位置分布）
    │
    ├── store/                    Zustand 全局状态
    │   ├── useBookStore.ts       藏书原始数据 + 筛选条件 + 增删改导入动作
    │   ├── useUiStore.ts         视图切换、侧边栏、各类弹层开关
    │   ├── useThemeStore.ts      主题偏好（localStorage 持久化）
    │   └── useToastStore.ts      Toast 提示队列
    │
    ├── hooks/
    │   ├── useAppInit.ts         启动初始化：主题 + DB 检测 + 首次加载
    │   ├── useBooks.ts           派生数据：可见列表、筛选选项、统计
    │   ├── useCoverUrl.ts        Blob 封面 -> objectURL（自动回收，防内存泄漏）
    │   └── useDebouncedValue.ts  搜索输入防抖
    │
    ├── utils/
    │   ├── cover.ts              书名首字占位色块、Blob <-> base64
    │   ├── csv.ts                RFC4180 风格 CSV 解析 / 生成（自研，零依赖）
    │   ├── format.ts             日期格式化、备份文件命名、浏览器下载
    │   └── cn.ts                 className 合并
    │
    └── components/
        ├── ui/                   基础件：Button / Form / Modal / Toast / ConfirmDialog / EmptyState / Badge / LoadingBlock
        ├── layout/               Sidebar / Header / DataRiskBanner
        ├── book/                 BookCover / BookCard / BookGrid / FilterBar / BookForm / BookDetailModal / LibraryView
        ├── import/               ImportDialog
        ├── stats/                StatsPanel
        └── settings/             SettingsPanel
```

---

## 四、环境要求

- Node.js **18 或更高**（推荐 20 / 22 LTS）
- npm 9+（或 pnpm / yarn，命令自行替换）
- 现代浏览器：Chrome / Edge / Firefox / Safari 均可（需支持 IndexedDB）

检查版本：

```bash
node -v
npm -v
```

---

## 五、安装与启动

```bash
# 1. 进入项目目录
cd bookmanager_wb

# 2. 安装依赖
npm install

# 3. 启动开发服务器（默认 http://localhost:5173，会自动打开浏览器）
npm run dev
```

停止服务：在终端按 `Ctrl + C`。

---

## 六、构建与打包

```bash
# 生产构建，产物输出到 dist/
npm run build

# 本地预览构建产物
npm run preview
```

构建产物为纯静态文件，**没有任何后端依赖**，可以：

- 直接用浏览器打开 `dist/index.html`（已配置 `base: './'`，相对路径可用）
- 丢到任意静态服务器 / Nginx / GitHub Pages / 对象存储
- 拷到 U 盘离线使用

> 注意：部署到子目录时同样无需额外配置，相对路径已处理。

---

## 七、部署到 GitHub Pages（随时随地联网打开）

部署后访问地址为 `https://<你的用户名>.github.io/<仓库名>/`，手机、平板、任何联网电脑都能打开。

> ⚠️ **托管 ≠ 同步**：数据仍然只存在**每台设备的浏览器自己里面**，不会因为共用同一个网址而自动同步。
> 在 A 设备录入的书，B 设备打开同一个网址看不到——需要用「导出 JSON → 导入」搬家。
> 详细见下方「跨设备使用」。

### 方式一：GitHub Actions 自动部署（推荐）

仓库里已经放好 `.github/workflows/deploy.yml`，push 到 `main` 自动构建并发布，之后改代码再 push 就自动更新。

**第 1 步**：在 GitHub 网页端新建一个**空仓库**（不要勾选 Add README / .gitignore），记下仓库名。

**第 2 步**：在本地项目目录执行（把 `<你的用户名>` / `<仓库名>` 换成实际的）：

```bash
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

> 首次 push 浏览器会弹出 GitHub 登录授权，按提示完成即可（Git Credential Manager）。

**第 3 步**：打开仓库 **Settings → Pages → Build and deployment**，Source 选择 **GitHub Actions**。

等 workflow 跑完（Settings → Actions 可看进度），点页面上方的 `https://<用户名>.github.io/<仓库名>/` 就能用。以后每次 push 都会自动重新发布。

也可以在 GitHub 网页端 **Actions → Deploy to GitHub Pages → Run workflow** 手动触发一次部署。

### 方式二：手动推送 dist（不需要 CI）

适合不想用 Actions 的场景：把构建好的静态文件放到 `gh-pages` 分支。

```bash
npm run build
git checkout -b gh-pages
git add -f dist            # .gitignore 默认忽略 dist，这里强制加入
git commit -m "deploy: 更新静态站点"
git push origin gh-pages
```

然后在仓库 **Settings → Pages** 里 Source 选 **Deploy from a branch**，分支选 `gh-pages`、目录选 `/docs` 或 `/root`（若 dist 内容在根目录则选 root；更省事的做法是把 dist 内容提交为 gh-pages 分支根目录）。

### 注意事项

- Free 计划下 Pages 只对**公开仓库**免费。若不想公开源码，请用方式二 + 私有仓库付费 Pages，或直接把 `dist/` 扔到自家 NAS / 阿里云 OSS / Cloudflare Pages
- 推荐在 Settings → Pages 勾选 **Enforce HTTPS**，避免浏览器因混合内容拒绝 IndexedDB 写入
- 换分支名或仓库名后记得同步更新访问地址

### 跨设备使用

| 场景 | 做法 |
| --- | --- |
| 同一台电脑、同一浏览器 | 直接打开网址，数据照常在 |
| 同电脑换浏览器（如从 Edge 换 Chrome） | 旧浏览器导出 JSON → 新浏览器导入 |
| 手机 / 另一台电脑 | 原设备导出 JSON（含封面）→ 传到新设备 → 导入 |
| 担心丢数据 | 定期导出 JSON 存网盘；导入是增量的，重复导同一份文件不会重复增加（按 ISBN / 书名+作者 判定） |

---

## 八、使用说明

### 1. 新增藏书

点击右上角「**新增藏书**」→ 填写表单 → 保存。

- **只有「书名」是必填项**，其余全部选填
- 封面：点「上传封面」选本地图片（jpg / png / webp，≤ 8MB）。不上传也没关系，系统会用**书名首字 + 稳定色块**生成占位图
- 「录入日期」由系统自动记录，不用填、也不可改
- 所有字段保存后随时可以回来编辑

### 2. 查找与整理

- 顶部搜索框：一次检索**书名、作者、ISBN、备注**四个字段
- 右侧下拉：按分类、存放位置筛选，按录入时间 / 书名 / 作者排序
- 点「重置」一键清空所有筛选条件

### 3. 导出备份（**强烈建议定期做**）

点右上角「**导出备份**」，浏览器会下载 `藏书备份_YYYYMMDD.json`。

- 文件包含：全部字段 + 封面 base64 + 录入时间
- 建议保存到电脑、手机、网盘等至少两个地方

### 4. 导入数据（CSV / JSON，增量导入）

点右上角「**导入**」→ 选择文件 → 开始导入。导入**只新增、不覆盖**。

**去重判定规则：**

| 情况 | 判定 | 处理 |
| --- | --- | --- |
| ISBN 非空且完全一致 | 重复 | 跳过，不新增 |
| ISBN 为空，书名 + 作者完全一致 | 重复 | 跳过，不新增 |
| 同一书名但 ISBN 不同（不同版本） | 两本独立图书 | 正常新增 |

导入完成后弹窗显示：解析记录数、成功新增数、跳过重复数、无效记录数，并列出明细。文件里缺少字段会留空，不影响导入。

#### CSV 格式

- 支持中英文表头，顺序不限，允许带引号、字段内含逗号或换行
- 可识别的表头：`书名/title`、`作者/author`、`ISBN`、`出版社/publisher`、`出版年份/year`、`分类/category/tag`、`存放位置/location`、`购入日期/purchaseDate`、`备注/notes`
- 如果第一行没有任何可识别表头，则按上面的顺序逐列解析
- 导入弹窗里可以点「**下载 CSV 模板**」拿到标准示例

示例：

```csv
书名,作者,ISBN,出版社,出版年份,分类,存放位置,购入日期,备注
百年孤独,加西亚·马尔克斯,978-7-5442-5399-4,南海出版公司,2011,文学,书房 A 架 2 层,2024-03-15,精装版
```

#### JSON 格式

支持三种结构，任选其一：

```json
[
  { "title": "百年孤独", "author": "马尔克斯", "isbn": "9787544253994", "category": "文学" }
]
```

```json
{ "books": [ { "title": "百年孤独", "author": "马尔克斯" } ] }
```

也可以直接把**本应用导出的备份文件**原样导入，封面 base64 会一并恢复。

### 5. 主题切换

侧边栏底部或设置页可切换浅色 / 深色，偏好记在本机浏览器里，下次打开自动应用。

---

## 九、数据安全与存放位置

- 数据存在浏览器 **IndexedDB** 数据库 `PaperBookManagerDB` 的 `books` 表中
- 封面图片以 **Blob** 形式存在同一条记录里，不会转成 base64 常驻内存
- localStorage 只存两样非业务内容：主题偏好 `pbm:theme`

⚠️ **清除浏览器缓存 / 网站数据 / Cookie 会连同 IndexedDB 一起清空，藏书（含封面）永久丢失且无法找回。** 本应用在列表页顶部和设置页都做了常驻提醒。

即使把本应用部署到 GitHub Pages 或任意云端（server 只提供静态文件，看不到你的数据），
所有藏书依然**只留在当前这台设备的浏览器里** —— 换个设备打开同一个网址，看到的是空书架，需要导入 JSON 备份。

恢复方式：导入之前导出的 JSON 备份文件。

---

## 十、常见问题

**Q：换电脑后数据还在吗？**
不在。数据只在本机浏览器里。换设备前先导出 JSON，在新设备导入即可完整恢复（含封面）。

**Q：能多人共用吗？**
不能。这是单人本机工具，没有账号体系也没有云端同步。

**Q：一本书有两个版本怎么录？**
录两条即可，填不同的 ISBN。去重规则会按 ISBN 区分，不会误判为重复。

**Q：无痕模式能用吗？**
不建议。无痕模式关闭窗口即清空存储，应用会给出明确提示。

**Q：部署到 GitHub Pages 后，手机上能看到电脑上录的书吗？**
不能。网址相同不代表数据共享——每台设备的浏览器各存各的。跨设备必须先导出 JSON 再导入。这是纯前端方案的固有特性，不是 bug。

**Q：GitHub Pages 免费额度够吗？**
够。静态站点的访问流量、构建时长对个人使用毫无压力；唯一限制是 Free 计划私有仓库不开 Pages，公开仓库完全免费。

**Q：忘记填分类，统计面板里显示「未分类」？**
是的，未填写分类或存放位置的藏书会归入「未分类 / 未记录位置」，方便你发现漏填的书。
