# ManagementDevice - He thong Quan ly Thiet bi Minh Viet Hardware

He thong quan ly thiet bi phan cung noi bo cong ty Minh Viet Hardware - ung dung web quan ly vong doi thiet bi, nhan vien, ban giao thiet bi.

---

## 1. Tong quan

| Thong tin | Chi tiet |
|-----------|----------|
| **Ten** | MinhVietHardware - He thong Quan ly Thiet bi |
| **Stack** | Node.js, Express 4.18, MongoDB (Mongoose 6.6), EJS |
| **Port** | 20236 |
| **Database** | MongoDB: `MinhVietHardware` |
| **Kien truc** | MVC + Service Layer |

---

## 2. Cau truc thu muc

```
ManagementDevice/
├── index.js                 # Entry point - Express app setup
├── seed.js                  # Script seed du lieu ban dau
├── .env                     # Bien moi truong (MONGO_CONNECT, PORT, SESSION_SECRET)
├── auths/                   # Middleware xac thuc & phan quyen
│   └── index.js             # checkLogin, checkRole
├── controllers/             # 16 controller xu ly request
├── services/                # 16 service chua business logic
├── models/model.js          # 21 Mongoose schema
├── routers/                 # 14 router dinh tuyen API
│   ├── index.router.js      # Router goc - mount tat ca sub-routers
│   ├── access.router.js     # Login/Logout
│   ├── device.router.js     # CRUD thiet bi + alerts
│   ├── handover.router.js   # Ban giao thiet bi
│   ├── staff.router.js      # Quan ly nhan vien
│   ├── user.router.js       # Quan ly tai khoan
│   ├── inventory.router.js  # Ton kho
│   ├── requireDevice.router.js # Yeu cau thiet bi
│   ├── history.router.js    # Lich su thiet bi
│   ├── department.router.js # Phong ban
│   ├── job.router.js        # Chuc danh
│   ├── position.router.js   # Cap bac
│   ├── location.router.js   # Vi tri
│   └── supplier.router.js   # Nha cung cap
├── views/                   # 20+ EJS template
├── GVs/                     # Config constants (role, device type, status...)
├── dbs/                     # Ket noi DB & import data
│   ├── init.js              # Singleton MongoDB connection
│   └── importDB.js          # Import du lieu tu JSON
├── helpers/                 # asyncHandler wrapper
├── responseHandle/          # Error/Success response classes
├── utils/                   # Utility functions (pick, projection, ObjectId...)
├── private/                 # JSON seed data
└── public/                  # Static assets
    ├── javascripts/
    │   ├── GVS.js           # Centralized API helper (AJAX, endpoints, escapeHTML)
    │   └── nav.js           # Frontend menu an/hien theo role
    ├── bootstrap-5.2.1/
    ├── fontawesome-6.2.0/
    ├── jquery/
    ├── select2-4.1.0-rc.0/
    ├── Css/
    └── images/
```

---

## 3. Cach chay du an

### Yeu cau
- **Node.js** >= 16
- **MongoDB** chay local tai `mongodb://127.0.0.1:27017`

### Cac buoc

```bash
# 1. Cai dependencies
npm install

# 2. Tao file .env (bat buoc)
# MONGO_CONNECT=mongodb://127.0.0.1:27017/MinhVietHardware
# PORT=20236
# SESSION_SECRET=your-secret-key-here

# 3. (Lan dau) Seed du lieu vao database
node seed.js

# 4. Chay ung dung
npm start          # Dung nodemon, auto-reload
# hoac
node index.js      # Chay truc tiep
```

### Ket qua
- Server: **http://localhost:20236**
- Login: **http://localhost:20236/login**
- Tai khoan mac dinh: SĐT `0375871003`, mat khau `111` (admin)
- Test API: `Manage device.postman_collection.json`

---

## 4. Luong Request (Architecture Flow)

```
Client (Browser)
  → Express Middleware (morgan, helmet, xss-clean, rate-limit, session, csrf)
    → Router (routers/*.js) [checkLogin, checkRole middleware]
      → Controller (controllers/*.js) [extract session, validate]
        → Service (services/*.js) [business logic, DB queries]
          → Model (models/model.js) [Mongoose schema & validation]
            → MongoDB
          ← Response (responseHandle/) [SuccessResponse / ErrorResponse]
        ← JSON response
      ← res.json()
    ← Client renders via AJAX + DataTables
```

### Flow khoi dong (index.js)

1. Load Express, middleware (morgan, helmet, compression, cookie-parser)
2. Ket noi MongoDB qua `dbs/init.js` (singleton pattern)
3. Cau hinh session voi MongoDB store (connect-mongo), secret tu `.env`
4. Cau hinh CSRF protection global (csurf + cookie)
5. Serve static files tu `/public`
6. Set view engine = EJS
7. Mount routes:
   - `GET /login` → render login.ejs (public)
   - `POST /api/login`, `GET /api/logout` (public)
   - `/api/handover/preview`, `/api/handover/getSumary`, `/api/handover/:id` (public - PDF renderer)
   - `checkLogin` middleware barrier
   - `/api/*` → tat ca API routes khac (protected)
   - `GET /` → render index.ejs (protected)
8. Rate limiting: 1000 requests/phut/IP
9. Error handler: an stack trace trong production
10. Listen tren port 20236

---

## 5. He thong Phan quyen (4 Roles)

| Role | Gia tri | Quyen han |
|------|---------|-----------|
| **ADMIN** | 0 | Toan quyen: quan ly user, thiet bi, nhan vien, ban giao |
| **TECHNIQUE** | 1 | Quan ly thiet bi, linh kien, kho; khong quan ly user/nhan vien |
| **ACCOUNTANT** | 2 | Xem thiet bi, ban giao, xuat PDF; khong quan ly linh kien |
| **STAFF** | 3 | Chi xem thiet bi duoc giao, tao yeu cau thiet bi |

### Middleware xac thuc (`auths/index.js`)

- **`checkLogin`**: Kiem tra `req.session.login`, redirect `/login` neu chua dang nhap
- **`checkRole([roles])`**: Kiem tra `req.session.role` co trong danh sach role duoc phep

### Frontend an/hien menu (`public/javascripts/nav.js`)
Dua vao cookie `role` de an menu khong duoc phep.

---

## 6. Cac Chuc nang Chinh

### 6.1 Dang nhap / Dang xuat
- **Route**: `POST /api/login`, `GET /api/logout`
- **Luong**: Nhap SDT + mat khau → bcrypt so sanh → tao session + cookies → redirect `/`
- **Session luu**: login, userId, role, name (het han 60 phut)
- **File**: `access.router.js` → `access.controller.js` → `access.service.js`

### 6.2 Quan ly User (Tai khoan he thong)
- **Route**: `/api/user` (Chi ADMIN)
- **Chuc nang**: Tao/sua/xem user, doi mat khau
- **File**: `user.router.js` → `user.controller.js` → `user.service.js`

### 6.3 Quan ly Nhan vien (Staff)
- **Route**: `/api/staff`
- **Chuc nang**: Tao/sua/xem nhan vien, thong ke, tim nhan vien de ban giao
- **Du lieu**: Ma NV, ten, SDT, phong ban, chuc vu, vi tri, quan ly
- **File**: `staff.router.js` → `staff.controller.js` → `staff.service.js`

### 6.4 Quan ly Thiet bi (Devices)
- **Route**: `/api/device`
- **9 loai thiet bi**: Case PC, Monitor, Wacom, Headphone, Webcam, UPS, Keyboard, Mouse, Component
- **Chuc nang**:
  - CRUD thiet bi (tao/sua/xoa/xem)
  - Ban giao thiet bi cho nhan vien (`handover`)
  - Thu hoi thiet bi (`revoke`)
  - Xem thong ke thiet bi (`getSummary`)
  - Xem chi tiet + lich su thiet bi
- **Factory Pattern**: `DeviceService.create()` dung registry de tao dung loai thiet bi
- **Trang thai**: `1` = San sang, `0` = Dang su dung, `-1` = Hong
- **File**: `device.router.js` → `device.controller.js` → `device.service.js`

### 6.5 Ban giao Thiet bi (Handover)
- **Route**: `/api/handover`
- **Chuc nang**:
  - Tao bien ban ban giao (giao/thu hoi/cap nhat)
  - Xuat PDF bien ban ban giao (Puppeteer)
  - Export toan bo bien ban
  - Dong bien ban
- **3 loai**: `0` = Thu hoi toan bo, `1` = Ban giao toan bo, `2` = Cap nhat (bo sung/thu hoi mot phan)
- **File**: `handover.router.js` → `handover.controller.js` → `handover.service.js`

### 6.6 Yeu cau Thiet bi (Require Device)
- **Route**: `/api/require-device`
- **Luong**:
  1. Nhan vien tao yeu cau (status = `2` Pending)
  2. Admin/Tech duyet (`accept`) hoac tu choi (`reject`)
  3. Neu duyet → tu dong ban giao thiet bi
- **Status flow**: Pending(2) → Accepted(1)/Rejected(0) → Admin Approved(3)/Rejected(4) → Tech Approved(5)/Rejected(6)
- **File**: `requireDevice.router.js` → `requireDevice.controller.js` → `requireDevice.service.js`

### 6.7 Kho / Ton kho (Inventory)
- **Route**: `/api/inventory`
- **Chuc nang**: Theo doi so luong ton kho theo thiet bi & vi tri
- **Tu dong cap nhat**: Khi ban giao/thu hoi → tang/giam `quantity`
- **File**: `inventory.router.js` → `inventory.controller.js` → `inventory.service.js`

### 6.8 Lich su Thiet bi (History)
- **Route**: `/api/history`
- **Chuc nang**: Ghi log moi thao tac ban giao/thu hoi
- **Tra cuu**: Theo thiet bi hoac theo nhan vien
- **Loai**: `0` = Thu hoi, `1` = Ban giao
- **File**: `history.router.js` → `history.controller.js` → `history.service.js`

### 6.9 Quan ly Danh muc (Job / Position / Department / Supplier / Location)
- **Route**: `/api/job`, `/api/position`, `/api/department`, `/api/supplier`, `/api/location`
- **Chuc nang**: CRUD cac danh muc dung cho nhan vien va thiet bi
- **Du lieu**:
  - Job: 14 chuc danh (Developer, 3D Artist, Du an...)
  - Department: 13 phong ban (Maya, Blender, UE, Com...)
  - Position: 4 cap bac (Ban lanh dao, Truong BP, NV, Thuc tap)
  - Supplier: Nha cung cap (ten, SDT, dia chi, MST)
  - Location: Vi tri lam viec (dia chi, tang, cong ty)

### 6.10 Canh bao Thiet bi (Device Alert) - MỚI
- **Route**: `/api/device/alerts`, `/api/device/alerts/warranty`, `/api/device/alerts/failure-risk`
- **Chuc nang**:
  - Canh bao het bao hanh (da het, 30 ngay, 90 ngay)
  - Du doan nguy co hong thiet bi (diem risk 0-100 dua tren tuoi, so lan ban giao, loai thiet bi, bao hanh)
- **Dashboard**: Hien thi tren trang chu voi 4 the tong quan + 2 bang chi tiet (tab Bao hanh / Du doan hong)
- **File**: `deviceAlert.controller.js` → `deviceAlert.service.js`

---

## 7. Bao mat

| Lop bao ve | Cong nghe | Chi tiet |
|------------|-----------|----------|
| **CSRF** | csurf (cookie) | Token qua meta tag `csrf-token`, gui header `CSRF-Token` trong moi AJAX request |
| **XSS** | xss-clean + GVS.escapeHTML | Middleware server-side + client-side escape trong `GVS.js` |
| **Rate Limit** | express-rate-limit | 1000 req/phut/IP |
| **Headers** | helmet | Security headers (tat CSP) |
| **Password** | bcrypt | Hash mat khau |
| **Session** | express-session + MongoStore | Luu MongoDB, het han 60 phut, secret tu `.env` |
| **Error** | Custom error handler | An stack trace trong production (`NODE_ENV=production`) |

---

## 8. Database Schema (21 Models)

Tat ca models dinh nghia trong `models/model.js`.

### Core
- **user**: name, phoneNumber, password (bcrypt), role (0-3)
- **staff**: code, name, phoneNumber, department, job, position, location, manager
- **device**: staff, name, supplier, type, status, expirationDate, createdAt

### Thiet bi chi tiet (ke thua tu device)
- **casePC**: macAddress, RAM, VGA, PSU, hardDrives, CPU, mainBoard...
- **monitor**: size, resolution, panelType...
- **wacom**, **headphone**, **webcam**, **ups**, **keyboard**, **mouse**, **component**

### To chuc
- **department**: name
- **job**: name
- **position**: name
- **location**: address, floor, company
- **supplier**: name, phoneNumber, address, taxCode

### Workflow
- **handover**: staff, user, devices[], type (0/1/2), status
- **history**: device, staff, user, type (0=thu hoi/1=ban giao)
- **requireDevice**: staff, user, devices[], status (0-6)
- **inventory**: device, location, quantity
- **log**: audit log

### Quan he chinh
```
Staff → Department, Job, Position, Location, Manager(Staff)
Device → Staff (duoc giao), Supplier, User (nguoi tao)
Handover → Staff, User, Devices[]
History → Device, Staff, User
Inventory → Device, Location
RequireDevice → Staff, User, Devices[]
```

---

## 9. Frontend

| Thanh phan | Cong nghe |
|------------|-----------|
| Template Engine | EJS |
| UI Framework | Bootstrap 5.2.1, Font Awesome 6.2.0 |
| Data Table | DataTables (sort, search, pagination) |
| Dropdown | Select2 |
| AJAX | jQuery + `GVS.js` (centralized API helper, endpoints, escapeHTML) |
| PDF | Puppeteer (server-side render EJS → PDF) |

### GVS.js - API Helper
File `public/javascripts/GVS.js` la trung tam xu ly AJAX:
- `GVS.setting(url, method, data)`: Tao config AJAX voi CSRF token tu meta tag
- `GVS.escapeHTML(str)`: Escape XSS cho client-side rendering
- Chua tat ca API endpoint constants (e.g. `GVS.GetAllDevice`, `GVS.GetDeviceAlerts`...)
- Chua config tinh nhu danh sach `location`, `statusDevice`

---

## 10. API Endpoints

### Public (khong can dang nhap)
| Method | Route | Mo ta |
|--------|-------|-------|
| GET | `/login` | Trang dang nhap |
| POST | `/api/login` | Dang nhap |
| GET | `/api/logout` | Dang xuat |
| GET | `/api/handover/preview` | Preview PDF ban giao |
| POST | `/api/handover/getSumary` | Lay summary ban giao (cho PDF) |
| PUT | `/api/handover/:id` | Lay chi tiet ban giao (cho PDF) |

### Protected (can dang nhap)
| Method | Route | Role | Mo ta |
|--------|-------|------|-------|
| GET | `/` | All | Trang chu dashboard |
| GET | `/api/device/getSummary` | All | Thong ke thiet bi |
| GET | `/api/device/alerts` | All | Canh bao thiet bi (bao hanh + rui ro) |
| POST | `/api/device/create` | ADMIN, TECHNIQUE | Tao thiet bi |
| POST | `/api/device/handover` | ADMIN, TECHNIQUE | Ban giao thiet bi |
| POST | `/api/device/revoke` | ADMIN, TECHNIQUE | Thu hoi thiet bi |
| GET | `/api/staff/getAll` | All | Danh sach nhan vien |
| POST | `/api/user/` | ADMIN | Tao tai khoan |
| GET | `/api/handover/getAll` | All | Danh sach bien ban ban giao |
| POST | `/api/handover/create` | ADMIN, TECHNIQUE | Tao bien ban |
| GET | `/api/handover/exportPDF/:id` | All | Xuat PDF |
| POST | `/api/require-device/` | All | Tao yeu cau thiet bi |
| PATCH | `/api/require-device/accept/:id` | ADMIN, TECHNIQUE | Duyet yeu cau |
| GET | `/api/inventory/getAll` | All | Danh sach ton kho |
| GET | `/api/history/getAll` | All | Lich su thiet bi |

---

## 11. Seed Data

Chay `node seed.js` de:
1. Ket noi MongoDB
2. Import du lieu tu `private/*.json` (departments, jobs, positions, locations, suppliers, staff, devices...)
3. Tao admin user mac dinh
4. Verify ket qua

Du lieu seed nam trong folder `private/` duoi dang JSON files.
