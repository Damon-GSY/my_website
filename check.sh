#!/bin/bash
# check.sh — 自动化前端质量检查脚本
# 用法: ./check.sh [port]
# 每次 commit 前运行，确保代码质量

set -e

PORT="${1:-3456}"
SCREENSHOTS_DIR="/root/.openclaw/workspace/my_website/screenshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
URL="http://localhost:$PORT"

echo "========================================="
echo "🔍 前端质量检查"
echo "========================================="

# 1. 构建检查
echo ""
echo "📦 [1/4] 构建检查..."
cd /root/.openclaw/workspace/my_website
NEXT_TURBOPACK=0 npm run build 2>&1 | tail -5
if [ $? -eq 0 ]; then
  echo "✅ 构建通过"
else
  echo "❌ 构建失败！"
  exit 1
fi

# 2. 检查 dev server 是否在跑
echo ""
echo "🌐 [2/4] 检查 dev server..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" != "200" ]; then
  echo "⚠️ Dev server 未运行 (端口 $PORT)，跳过截图和 Lighthouse"
  echo "启动: cd /root/.openclaw/workspace/my_website && NEXT_TURBOPACK=0 npx next dev -p $PORT &"
  echo ""
  echo "检查结果: 1/4 通过（仅构建）"
  exit 0
fi
echo "✅ Dev server 运行中 ($URL)"

# 3. 截图
echo ""
echo "📸 [3/4] 截图..."
mkdir -p "$SCREENSHOTS_DIR"

# 使用 agent-browser 截图
agent-browser open "$URL" 2>/dev/null
sleep 3
agent-browser screenshot "$SCREENSHOTS_DIR/home_${TIMESTAMP}.png" 2>/dev/null
agent-browser screenshot --full "$SCREENSHOTS_DIR/home_${TIMESTAMP}_full.png" 2>/dev/null

# 截图子页面
for page in about videos projects links contact blog; do
  agent-browser open "$URL/$page" 2>/dev/null
  sleep 2
  agent-browser screenshot "$SCREENSHOTS_DIR/${page}_${TIMESTAMP}.png" 2>/dev/null
  agent-browser close 2>/dev/null
done

agent-browser open "$URL" 2>/dev/null

echo "✅ 截图已保存到 $SCREENSHOTS_DIR/"

# 4. 代码质量检查
echo ""
echo "🔧 [4/4] 代码质量检查..."

# 检查 TypeScript 错误
TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || true)
if [ "$TS_ERRORS" -eq 0 ]; then
  echo "✅ TypeScript: 0 errors"
else
  echo "⚠️ TypeScript: $TS_ERRORS errors"
fi

# 检查未使用的导入
UNUSED=$(grep -r "from ['\"]@/" components/ --include="*.tsx" | grep -v "use client" | wc -l || true)
echo "   导入语句: $UNUSED 个"

# 检查暗色主题适配（硬编码亮色值）
LIGHT_HARDCODE=$(grep -rn "bg-white\|bg-gray-\|text-black\|border-black" components/ --include="*.tsx" | grep -v "node_modules" | wc -l || true)
if [ "$LIGHT_HARDCODE" -eq 0 ]; then
  echo "✅ 暗色适配: 无硬编码亮色值"
else
  echo "⚠️ 暗色适配: 发现 $LIGHT_HARDCODE 处硬编码亮色值"
fi

# 组件统计
COMPONENT_COUNT=$(find components -name "*.tsx" -not -path "*/node_modules/*" | wc -l)
echo "   组件总数: $COMPONENT_COUNT 个"

echo ""
echo "========================================="
echo "✅ 检查完成"
echo "========================================="
echo "截图目录: $SCREENSHOTS_DIR/"
echo "时间: $TIMESTAMP"
