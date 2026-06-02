#!/usr/bin/env node
const { execFileSync, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");

const BINARY_NAME = "erp-cli";
const VERSION = require("../package.json").version;
const GITHUB_REPO = "windaka-erp/erp-cli";

function getBinaryPath() {
  const binDir = path.join(__dirname, "..", "bin");

  const candidates = [
    path.join(binDir, `${BINARY_NAME}.exe`), // bin/erp-cli.exe (Windows)
    path.join(binDir, BINARY_NAME), // bin/erp-cli (macOS/Linux)
    path.join(__dirname, "..", `${BINARY_NAME}.exe`), // 根目录编译产物 (Windows)
    path.join(__dirname, "..", BINARY_NAME), // 根目录编译产物 (macOS/Linux)
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  console.error(`Error: ${BINARY_NAME} binary not found.`);
  console.error(`Please run: npm install`);
  process.exit(1);
}

// ── 静默自动更新 ──

function getPlatformInfo() {
  const platform = process.platform;
  const arch = process.arch;

  const map = {
    win32_x64: { target: "windows-amd64", ext: ".exe" },
    win32_arm64: { target: "windows-arm64", ext: ".exe" },
    darwin_x64: { target: "darwin-amd64", ext: "" },
    darwin_arm64: { target: "darwin-arm64", ext: "" },
    linux_x64: { target: "linux-amd64", ext: "" },
    linux_arm64: { target: "linux-arm64", ext: "" },
  };

  return map[`${platform}_${arch}`] || null;
}

function getInstalledVersion(binaryPath) {
  try {
    const output = execSync(`"${binaryPath}" --version`, {
      encoding: "utf8",
      timeout: 5000,
    });
    const match = output.match(/version\s+v?(\S+)/i);
    return match ? match[1].replace(/^v/, "") : null;
  } catch {
    return null;
  }
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { timeout: 5000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchJSON(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject)
      .on("timeout", function () {
        this.destroy();
        reject(new Error("timeout"));
      });
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadFile(res.headers.location, dest).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const stream = fs.createWriteStream(dest);
        res.pipe(stream);
        stream.on("finish", () => {
          stream.close();
          if (process.platform !== "win32") {
            fs.chmodSync(dest, 0o755);
          }
          resolve();
        });
        stream.on("error", reject);
      })
      .on("error", reject);
  });
}

async function silentAutoUpdate() {
  try {
    const binary = getBinaryPath();
    const installedVer = getInstalledVersion(binary);

    // 如果已安装版本和 package.json 一致，跳过
    if (installedVer === VERSION.replace(/^v/, "")) return;

    // 已安装版本比 package.json 新？跳过
    if (installedVer && installedVer > VERSION.replace(/^v/, "")) return;

    // 需要更新：查询 GitHub Release 获取最新版本号
    const release = await fetchJSON(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
    );

    const latestTag = release.tag_name; // e.g. "v0.3.0"
    const latestVer = latestTag.replace(/^v/, "");

    // 最新版和 package.json 版本不一致？等 npm update 后再说
    if (latestVer !== VERSION.replace(/^v/, "")) return;

    // 下载新版本
    const info = getPlatformInfo();
    if (!info) return;

    const filename = `${BINARY_NAME}-${info.target}${info.ext}`;
    const asset = release.assets.find((a) => a.name === filename);
    if (!asset) return;

    const binDir = path.join(__dirname, "..", "bin");
    const binaryPath = path.join(binDir, `${BINARY_NAME}${info.ext}`);

    // 下载到临时文件，完成后原子替换
    const tmpPath = binaryPath + ".tmp";
    await downloadFile(asset.browser_download_url, tmpPath);

    // 替换旧二进制
    fs.renameSync(tmpPath, binaryPath);
  } catch {
    // 静默失败，不影响正常使用
  }
}

function main() {
  // 后台静默更新，不阻塞主流程
  silentAutoUpdate().catch(() => {});

  const binary = getBinaryPath();
  const args = process.argv.slice(2);

  try {
    execFileSync(binary, args, {
      stdio: "inherit",
      env: { ...process.env },
    });
  } catch (err) {
    process.exitCode = err.status || 1;
  }
}

main();
