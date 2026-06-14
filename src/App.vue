<template>
  <router-view />
</template>

<style>
:root {
  --ink: #1a1a2e;
  --ink-light: #2d2d44;
  --amber: #f0a500;
  --amber-glow: rgba(240, 165, 0, 0.15);
  --price-red: #e63946;
  --bg-warm: #f8f6f3;
  --card: #ffffff;
  --card-hover: #fefaf3;
  --text: #2d2d2d;
  --text-muted: #8b8b8b;
  --border: #ebe7e0;
  --shadow-sm: 0 1px 3px rgba(26, 26, 46, 0.06);
  --shadow-md: 0 4px 16px rgba(26, 26, 46, 0.08);
  --shadow-lg: 0 8px 32px rgba(26, 26, 46, 0.10);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --font-display: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  color: var(--text);
  background: var(--bg-warm);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
}

.el-button--primary {
  --el-button-bg-color: var(--ink);
  --el-button-border-color: var(--ink);
  --el-button-hover-bg-color: var(--ink-light);
  --el-button-hover-border-color: var(--ink-light);
}
</style>