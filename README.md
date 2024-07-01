# Mern_LearningSystem_Server

- 使用 MERN (MongoDB、Express、React、Node) 製作 LearningSystem
- 功能：註冊會員、登入系統、發佈及註冊課程
- 部屬
  - Frontend
    - [github-pages](https://pin50195.github.io/Mern_LearningSystem_Client/)
    - [github](https://github.com/pin50195/Mern_LearningSystem_Client)
  - Server：Render
  - Database：MongoDB Atlas

## 1.製作動機

- 學習前後端資料的串聯

## 2.套件使用

- Node.js + Express.js：設定 Server 與 Client 端點請求
- Mongoose：連接 MongoDB，對資料進行 CRUD
- dotenv：使用 .env 存放環境變數
- bcrypt：使用 bcrypt 將密碼進行雜湊函數轉換，再存放資料庫
- JSON Web Token：將使用者資訊進行簽名並形成 token 存放在客戶端，作為使用者瀏覽網站時的身分驗證依據
- passport：驗證使用者身份
- Joi：驗證使用者傳送的資料格式，格式錯誤將會回傳錯誤訊息
- multer：上傳文件 (multipart/form-data) 至 Server

## 3.功能介紹

- models folder
  - 設定 user 與 course Schema 及 instance methods
  - 設定使用者資料儲存至 mongoose 前的 middelware
- config folder
  - 驗證使用者提供的 token
- routes folder
  - auth-route 處理與使用者相關的請求(註冊、登入)
  - course-route 處理與課程相關的請求(新增、刪除、查詢、修改、註冊課程)
- validation file
  - 藉由 Joi 驗證使用者提供的資料與 Schema 設定格式是否相符
- index file
  - 設定 mongoose 連接 mongoDB
  - 設定 middleware
