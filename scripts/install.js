const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// ── 配置 ──
const BINARY_NAME = "erp-cli";
const VERSION = require("../package.json").version;
const GITHUB_REPO = "windaka-erp/erp-cli";
const GITEE_REPO = "xing-wenkai/erp-cli";

// ── 平台映射 ──
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

  const key = `${platform}_${arch}`;
  const info = map[key];
  if (!info) {
    console.error(`Unsupported platform: ${platform}-${arch}`);
    process.exit(1);
  }
  return info;
}

// ── 下载地址（GitHub 优先，Gitee 回退）──
function getDownloadURLs(info) {
  const filename = `${BINARY_NAME}-${info.target}${info.ext}`;
  return [
    `https://github.com/${GITHUB_REPO}/releases/download/v${VERSION}/${filename}`,
    `https://gitee.com/${GITEE_REPO}/releases/download/v${VERSION}/${filename}`,
  ];
}

// ── 获取已安装二进制的版本号 ──
function getInstalledVersion(binaryPath) {
  try {
    const output = execSync(`"${binaryPath}" --version`, {
      encoding: "utf8",
      timeout: 5000,
    });
    // 输出格式: "erp-cli version v0.2.0" 或 "erp-cli version 0.2.0"
    const match = output.match(/version\s+v?(\S+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ── 比较版本号 ──
function isVersionOutdated(installed, expected) {
  if (!installed) return true;
  // 去掉 v 前缀统一比较
  const a = installed.replace(/^v/, "");
  const b = expected.replace(/^v/, "");
  return a !== b;
}

// ── 下载二进制 ──
function downloadBinary(url, binaryPath) {
  if (process.platform === "win32") {
    execSync(
      `powershell -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${binaryPath}'"`,
      { stdio: "inherit" }
    );
  } else {
    execSync(`curl -L -o "${binaryPath}" "${url}"`, {
      stdio: "inherit",
    });
  }

  // 设置可执行权限（非 Windows）
  if (process.platform !== "win32") {
    fs.chmodSync(binaryPath, 0o755);
  }
}

// ── 主流程 ──
function install() {
  const pkgDir = path.join(__dirname, "..");
  const binDir = path.join(pkgDir, "bin");
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const info = getPlatformInfo();
  const binaryPath = path.join(binDir, `${BINARY_NAME}${info.ext}`);

  // 1. 检查 bin/ 目录是否已有对应平台的二进制
  if (fs.existsSync(binaryPath)) {
    const installedVer = getInstalledVersion(binaryPath);
    if (!isVersionOutdated(installedVer, VERSION)) {
      console.log(`Found bundled binary: ${binaryPath} (v${installedVer})`);
      return;
    }
    // 版本不一致，需要更新
    console.log(
      `Binary version mismatch: installed v${installedVer}, expected v${VERSION}. Updating...`
    );
  }

  // 2. 检查项目根目录是否有本地编译产物（开发模式）
  const localBinary = path.join(pkgDir, `${BINARY_NAME}${info.ext}`);
  if (fs.existsSync(localBinary)) {
    console.log(`Found local binary, copying...`);
    fs.copyFileSync(localBinary, binaryPath);
    console.log(`Installed from local build: ${binaryPath}`);
    return;
  }

  // 3. 从 GitHub Releases 下载，失败回退 Gitee
  const urls = getDownloadURLs(info);
  console.log(`Downloading ${BINARY_NAME} v${VERSION} for ${info.target}...`);

  let downloaded = false;
  for (const url of urls) {
    console.log(`  Trying: ${url}`);
    try {
      downloadBinary(url, binaryPath);
      downloaded = true;
      console.log(`Successfully installed ${BINARY_NAME} v${VERSION}`);
      break;
    } catch (err) {
      console.warn(`  Failed: ${err.message}`);
    }
  }

  if (!downloaded) {
    console.error(`All download sources failed.`);
    console.error(`You can build from source:`);
    console.error(`  git clone https://github.com/${GITHUB_REPO}.git`);
    console.error(`  cd erp-cli && go build -o ${BINARY_NAME} .`);
    console.error(`  Then copy the binary to: ${binaryPath}`);
    process.exit(1);
  }
}

install();
