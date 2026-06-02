#!/usr/bin/env node
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const BINARY_NAME = "erp-cli";

function getBinaryPath() {
  const binDir = path.join(__dirname, "..", "bin");

  // 按优先级查找二进制
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

function main() {
  const binary = getBinaryPath();
  const args = process.argv.slice(2);

  try {
    execFileSync(binary, args, {
      stdio: "inherit",
      env: { ...process.env },
    });
  } catch (err) {
    // execFileSync throws on non-zero exit codes; the binary already
    // wrote its output to stdout/stderr, so just exit with same code.
    process.exitCode = err.status || 1;
  }
}

main();