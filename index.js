const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
var xss = require("xss-clean");
const app = express();
var cookieParser = require("cookie-parser");
var session = require("express-session");
const MongoStore = require("connect-mongo");
var path = require("path");
const { port } = require("./GVs/port.config");
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(morgan("dev"));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 1000, // Tối đa 1000 yêu cầu từ cùng 1 IP
  message: {
    status: 429,
    message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.",
  },
  headers: true,
});

app.use(limiter);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: true,
    rolling: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_CONNECT,
    }),
    cookie: {
      maxAge: 60000 * 60,
    },
  })
);
app.use(xss());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

// init db
require("./dbs/init");

// CSRF protection
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

//init router
var indexRouter = require("./routers/index.router");
app.use("/", indexRouter);
require("./dbs/importDB");

// handling error
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  console.warn(`${req.url} Not Found!`);
  next(error);
});
app.use((error, req, res, next) => {
  const status = error.status || 500;
  console.log(error);
  return res.json({
    status: "error",
    code: status,
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    message: error.message || "Internal Server Error",
  });
});

const server = app.listen(port, () => {
  console.log(`Server start with ${port}`);
});
process.on("SIGINT", () => {
  server.close(() => console.log("Server exit"));
});
process.title = `Minh Viet Internal Management Server Port ${port}`;
