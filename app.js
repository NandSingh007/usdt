var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const cors = require("cors");
var crypto = require("crypto");
var { config } = require("./config/Config.js");
const mysql = require("mysql2/promise");
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const sidebarLinks = require("./data/sidebarLinks.cjs");
var logoutRouter = require("./routes/logout");
var Router = require("./routes/index.js");
var frontend = require("./routes/frontend.js");
const { Server } = require("socket.io");
const http = require("http");
// const Message = require("./models/Message.js"); // Import your Message model

// userrouter
var userrouter = require("./routes/users.js");

var loginRouter = require("./routes/login.cjs");
const userloginDatas = require("./models/LofinUserDetail.js");

var app = express();
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://btuexchange.in",
    methods: ["POST", "GET", "DELETE", "PUT"]
  }
});
const allowedOrigins = [
  "https://btuexchange.in",
  "https://btuexchange.in/back",
  "https://btuexchange.in"

  // "http://192.168.29.155:7500"
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Deny the request
    }
  },
  methods: ["POST", "GET", "DELETE", "PUT"]
};

// Use CORS middleware
app.use(cors(corsOptions));

// app.use(cors({ origin: "port.ocean369.com));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Make sidebarLinks available to your entire application
app.locals.sidebarLinks = sidebarLinks;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html"); // Change the view engine to 'html'
app.engine("html", require("ejs").renderFile); // Use ejs to render HTML files

// app.use(logger("dev"));

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/back", Router);
app.use("/", frontend);
app.use("/back", loginRouter);
app.use("/users", userrouter);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handling messages from the user
  socket.on("userMessage", async (data) => {
    console.log("Received message from user:", data);

    try {
      // Find the user by ID
      const user = await userloginDatas.findById(data.userId);
      // Check if user exists
      if (!user) {
        console.log("User Not Found");
        return; // Return early if user is not found
      }

      // Create a new message object
      const message = {
        Text: data.text,
        PersonType: "User"
      };
      // Push the message into the messages array of the user object
      user.Message.push(message);
      // Save the user object to persist the changes
      await user.save(user);
      // Broadcast the message to all connected clients (including admin)
      io.emit("message", {
        name: "user",
        _id: data.userId,
        text: message.Text,
        personType: message.PersonType
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handling messages from the admin
  socket.on("adminMessage", async (data) => {
    console.log("Received message from admin:", data);

    try {
      // Find the user by ID
      const user = await userloginDatas.findById(data.userId);
      // Check if user exists
      if (!user) {
        console.log("User Not Found");
        return; // Return early if user is not found
      }
      // Create a new message object
      const message = {
        _id: data.userId,
        Text: data.text,
        PersonType: "Admin"
      };
      // Push the message into the messages array of the user object
      user.Message.push(message);
      // Save the user object to persist the changes
      await user.save();
      // Broadcast the message to all connected clients (including admin)
      io.emit("message", {
        name: "admin",
        _id: message._id,
        text: message.Text,
        personType: message.PersonType
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Serve static files from the 'public' directory
app.use(express.static("public"));
// app.use('/api', loginRouter)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
mongoose
  .connect(
    "mongodb+srv://worldpay472:jCdrzMW5M78BU1m5@cluster0.9pqtr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      writeConcern: {
        w: "majority",
        wtimeout: 0
      }
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
// (async () => {
//   try {
//     // Create a connection to the MySQL database using the configuration
//     const connection = await mysql.createConnection({
//       host: config.MYSQL_HOST,
//       user: config.MYSQL_USER,
//       database: config.MYSQL_DATABASE
//       // Add password if needed
//       // password: config.MYSQL_PASSWORD,
//     });

//     console.log("Connected to MySQL");

//     // Export the connection for use in other modules
//     module.exports = connection;
//   } catch (error) {
//     console.error("MySQL connection error:", error);
//   }
// })();
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const port = config.port;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// // Drop the index
// db.candidatepancarddatas.dropIndex("candidateName_1");

module.exports = app;
