"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
const electron_1 = __importDefault(require("electron"));
const notionIpc = __importStar(require("../helpers/notionIpc"));
const urlHelpers = __importStar(require("../shared/urlHelpers"));
const electronApi = {
    openInNewWindow(urlPath) {
        notionIpc.sendToMainListeners("notion:create-window", urlPath);
    },
    openExternalUrl(url) {
        const sanitizedUrl = urlHelpers.sanitizeUrlStrict(url);
        if (sanitizedUrl) {
            void electron_1.default.shell.openExternal(url);
        }
    },
    clearBrowserHistory() {
        electron_1.default.remote.getCurrentWebContents().clearHistory();
    },
    getAppVersion() {
        return electron_1.default.remote.app.getVersion();
    },
    setBadge(str) {
        const dock = electron_1.default.remote.app.dock;
        if (dock) {
            dock.setBadge(str);
            return;
        }
        const win = electron_1.default.remote.getCurrentWindow();
        if (win.setOverlayIcon) {
            if (str === "") {
                win.setOverlayIcon(null, "");
                return;
            }
            const canvas = document.createElement("canvas");
            canvas.width = 16 * window.devicePixelRatio;
            canvas.height = 16 * window.devicePixelRatio;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                return;
            }
            const scale = 18 / 20;
            const centerX = canvas.width / 2 / scale;
            const centerY = canvas.height / 2 / scale;
            const radius = (canvas.width / 2) * scale * scale;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = "rgba(247,94,79,0.95)";
            ctx.fill();
            ctx.font = `${9 * scale * window.devicePixelRatio}px sans-serif`;
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(str, centerX, centerY + 3.5 * scale * window.devicePixelRatio);
            const pngData = electron_1.default.remote.nativeImage
                .createFromDataURL(canvas.toDataURL("image/png"))
                .toPNG();
            const img = electron_1.default.remote.nativeImage.createFromBuffer(pngData, {
                scaleFactor: window.devicePixelRatio,
            });
            win.setOverlayIcon(img, `${str} unread notifications`);
        }
    },
    windowFocus: {
        addListener(fn) {
            electron_1.default.remote.app.addListener("browser-window-focus", fn);
        },
        removeListener(fn) {
            electron_1.default.remote.app.removeListener("browser-window-focus", fn);
        },
    },
    fullscreen: {
        get() {
            const window = electron_1.default.remote.getCurrentWindow();
            return window && window.isFullScreen();
        },
        addListener(fn) {
            notionIpc.receiveNotionFromIndex.addListener("notion:full-screen-changed", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromIndex.removeListener("notion:full-screen-changed", fn);
        },
    },
    inPageSearch: {
        start(isPeekView) {
            notionIpc.sendNotionToIndex("search:start", isPeekView);
        },
        stop() {
            notionIpc.sendNotionToIndex("search:stop");
        },
        started: {
            addListener(fn) {
                notionIpc.receiveNotionFromIndex.addListener("search:started", fn);
            },
            removeListener(fn) {
                notionIpc.receiveNotionFromIndex.removeListener("search:started", fn);
            },
        },
        stopped: {
            addListener(fn) {
                notionIpc.receiveNotionFromIndex.addListener("search:stopped", fn);
            },
            removeListener(fn) {
                notionIpc.receiveNotionFromIndex.removeListener("search:stopped", fn);
            },
        },
    },
    zoom: {
        set(scale) {
            notionIpc.sendNotionToIndex("zoom", scale);
        },
        get() {
            return electron_1.default.webFrame.getZoomFactor();
        },
    },
    loadSpellcheck: () => {
        try {
            const cld = require("cld");
            electronApi.cld = {
                detect: (text, fn) => {
                    cld.detect(text, fn);
                },
            };
        }
        catch (error) {
            console.error("Failed to load spellchecker", error);
        }
    },
    setSpellCheckerLanguages: languages => {
        const session = electron_1.default.remote.getCurrentWebContents().session;
        session.setSpellCheckerLanguages(languages.filter(language => session.availableSpellCheckerLanguages.includes(language)));
    },
    contextMenu: {
        addListener: fn => {
            electron_1.default.remote.getCurrentWebContents().addListener("context-menu", fn);
        },
        removeListener: fn => {
            electron_1.default.remote.getCurrentWebContents().removeListener("context-menu", fn);
        },
    },
    replaceMisspelling: (word) => {
        electron_1.default.remote.getCurrentWebContents().replaceMisspelling(word);
    },
    cut: () => {
        electron_1.default.remote.getCurrentWebContents().cut();
    },
    copy: () => {
        electron_1.default.remote.getCurrentWebContents().copy();
    },
    paste: () => {
        electron_1.default.remote.getCurrentWebContents().paste();
    },
    inspectElement: (x, y) => {
        electron_1.default.remote.getCurrentWebContents().inspectElement(x, y);
    },
    copyText: (text) => {
        electron_1.default.clipboard.writeText(text);
    },
    copyImage: (src) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            canvas.height = img.height;
            canvas.width = img.width;
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                electron_1.default.clipboard.writeImage(electron_1.default.nativeImage.createFromDataURL(dataURL));
            }
        };
        img.src = src;
    },
    openDevTools: () => {
        electron_1.default.remote.getCurrentWebContents().openDevTools();
    },
    setWindowTitle: title => {
        const browserWindow = electron_1.default.remote.getCurrentWindow();
        if (browserWindow.getTitle() !== title) {
            browserWindow.setTitle(title);
        }
    },
    toggleMaximized: () => {
        const win = electron_1.default.remote.getCurrentWindow();
        if (win.isMaximized()) {
            win.unmaximize();
        }
        else {
            win.maximize();
        }
    },
    checkForUpdates() {
        notionIpc.sendToMainListeners("notion:check-for-updates");
    },
    updateReady: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:update-ready", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:update-ready", fn);
        },
    },
    installUpdate() {
        notionIpc.sendToMainListeners("notion:install-update");
    },
    updateError: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:update-error", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:update-error", fn);
        },
    },
    updateChecking: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:checking-for-update", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:checking-for-update", fn);
        },
    },
    updateAvailable: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:update-available", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:update-available", fn);
        },
    },
    updateProgress: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:update-progress", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:update-progress", fn);
        },
    },
    updateNotAvailable: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:update-not-available", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:update-not-available", fn);
        },
    },
    checkForAppUpdates() {
        notionIpc.sendToMainListeners("notion:check-for-app-updates");
    },
    appUpdateReady: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-ready", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-ready", fn);
        },
    },
    appUpdateError: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-error", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-error", fn);
        },
    },
    appUpdateChecking: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:checking-for-app-update", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:checking-for-app-update", fn);
        },
    },
    appUpdateAvailable: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-available", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-available", fn);
        },
    },
    appUpdateProgress: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-progress", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-progress", fn);
        },
    },
    appUpdateNotAvailable: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-not-available", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-not-available", fn);
        },
    },
    appUpdateFinished: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-finished", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-finished", fn);
        },
    },
    appUpdateInstall: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-install", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-install", fn);
        },
    },
    windowsBackgrounded: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:windows-backgrounded", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:windows-backgrounded", fn);
        },
    },
    getSubstitutions() {
        return ((electron_1.default.remote.systemPreferences.getUserDefault &&
            electron_1.default.remote.systemPreferences.getUserDefault("NSUserDictionaryReplacementItems", "array")) ||
            []);
    },
    isMainWindow() {
        const currentWindow = electron_1.default.remote.getCurrentWindow();
        const focusedWindow = electron_1.default.remote.BrowserWindow.getFocusedWindow();
        if (focusedWindow && focusedWindow.isVisible()) {
            return focusedWindow.id === currentWindow.id;
        }
        const firstWindow = electron_1.default.remote.BrowserWindow.getAllWindows().filter(window => window.isVisible())[0];
        return firstWindow && firstWindow.id === currentWindow.id;
    },
    windowIsVisible() {
        const currentWindow = electron_1.default.remote.getCurrentWindow();
        return currentWindow.isVisible();
    },
    setTheme(theme) {
        notionIpc.sendNotionToIndex("search:set-theme", theme);
    },
    newWindow: {
        addListener: fn => {
            electron_1.default.remote.getCurrentWebContents().addListener("new-window", fn);
        },
        removeListener: fn => {
            electron_1.default.remote.getCurrentWebContents().removeListener("new-window", fn);
        },
    },
    openOauthPopup: async (args) => {
        notionIpc.sendToMainListeners("notion:create-popup", args);
        return new Promise(resolve => {
            const handlePopupCallback = (sender, url) => {
                notionIpc.receiveNotionFromMain.removeListener("notion:popup-callback", handlePopupCallback);
                resolve(url);
            };
            notionIpc.receiveNotionFromMain.addListener("notion:popup-callback", handlePopupCallback);
        });
    },
    openGoogleDrivePickerPopup: async (args) => {
        notionIpc.sendToMainListeners("notion:create-google-drive-picker", args);
        return new Promise(resolve => {
            const handlePopupCallback = (sender, file) => {
                notionIpc.receiveNotionFromMain.removeListener("notion:google-drive-picker-callback", handlePopupCallback);
                resolve(file);
            };
            notionIpc.receiveNotionFromMain.addListener("notion:google-drive-picker-callback", handlePopupCallback);
        });
    },
    getCookie: (cookieName) => {
        return notionIpc.invokeMainHandler("notion:get-cookie", cookieName);
    },
    setCookie: (args) => {
        notionIpc.sendToMainListeners("notion:set-cookie", args);
    },
    setLogglyData: data => {
        notionIpc.sendToMainListeners("notion:set-loggly-data", data);
    },
    clearCookies: () => {
        notionIpc.sendToMainListeners("notion:clear-cookies");
    },
    resetAppCache() {
        notionIpc.sendToMainListeners("notion:reset-app-cache");
    },
    appUpdateReload: {
        emit: info => {
            notionIpc.broadcast.emit("notion:app-update-reload", info);
        },
        addListener(fn) {
            notionIpc.broadcast.addListener("notion:app-update-reload", fn);
        },
        removeListener(fn) {
            notionIpc.broadcast.removeListener("notion:app-update-reload", fn);
        },
    },
    getAppPath() {
        return electron_1.default.remote.app.getAppPath();
    },
    clearAllCookies: () => {
        notionIpc.sendToMainListeners("notion:clear-all-cookies");
    },
    downloadUrl(url) {
        electron_1.default.remote.getCurrentWebContents().downloadURL(url);
    },
    onNavigate: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:navigate-to-url", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:navigate-to-url", fn);
        },
    },
    getSqliteMeta: () => {
        return notionIpc.invokeMainHandler("notion:get-sqlite-meta");
    },
    refreshAll: includeFocusedWindow => {
        return notionIpc.invokeMainHandler("notion:refresh-all", includeFocusedWindow);
    },
    ready() {
        const currentWindow = electron_1.default.remote.getCurrentWindow();
        return notionIpc.invokeMainHandler("notion:ready", currentWindow.id);
    },
    sqliteServerEnabled: true,
};
window["__electronApi"] = electronApi;
window["__isElectron"] = true;
window["__platform"] = process_1.default.platform;
//# sourceMappingURL=preload.js.map

// Mizari fait des bêtises :D

const RPC = require('discord-rpc');


const client = new RPC.Client({ transport: 'ipc' });
const rpcOpt = {
  details: `Actually working (I think ?)`,
  state: `Presence dev by Mizari`,
  startTimestamp: new Date(),
  largeImageKey: `logo`,
  largeImageText: `notion.so`,
  buttons:[
    {
      label: "notion.so",
      url: "https://www.notion.so/"
    },
    {
      label: "Contact Mizari",
      url: "https://discord.gg/N49Gxsu"
    }
  ]
};

client.on('ready', () => {
  client.setActivity(rpcOpt);
});

window.addEventListener('DOMContentLoaded', () => {
  client.login({ clientId: "928952870374621194" });
});

var oldTitle = document.title;
window.setInterval(function(){
    if (document.title !== oldTitle){
        rpcOpt.details = `Actually working on ${document.title}`;
        client.setActivity(rpcOpt);
    }
    oldTitle = document.title;
}, 100);
