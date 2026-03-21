#!/bin/bash
# review.sh — 代码自审脚本
# 检查代码结构、命名规范、暗色适配、性能问题

cd /root/.openclaw/workspace/my_website

echo "========================================="
echo "🔍 代码自审"
echo "========================================="
echo ""

ISSUES=0
WARNINGS=0

# 1. 检查 "use client" 指令缺失
echo "📁 [1/6] 检查 'use client' 指令..."
for file in $(find components/layout components/sections -name "*.tsx" 2>/dev/null); do
  if ! head -1 "$file" | grep -q '"use client"'; then
    echo "  ❌ $file — 缺少 'use client'（使用了 React hooks）"
    ISSUES=$((ISSUES + 1))
  else
    echo "  ✅ $(basename $file)"
  fi
done

# 2. 检查暗色主题适配
echo ""
echo "🎨 [2/6] 检查暗色主题适配..."
LIGHT_VALUES=$(grep -rn "bg-white\|bg-gray-100\|bg-gray-200\|#ffffff\|#FFFFFF\|text-gray-900\|border-gray-200" components/ --include="*.tsx" 2>/dev/null | grep -v node_modules || true)
if [ -z "$LIGHT_VALUES" ]; then
  echo "  ✅ 无硬编码亮色值"
else
  echo "$LIGHT_VALUES" | while read -r line; do
    echo "  ⚠️ $(echo "$line" | cut -d: -f1):$(echo "$line" | cut -d: -f2) — 硬编码亮色值"
    WARNINGS=$((WARNINGS + 1))
  done
fi

# 3. 检查未使用的组件
echo ""
echo "🧹 [3/6] 检查未使用的组件..."
for file in $(find components/ui -name "*.tsx" 2>/dev/null); do
  COMP=$(basename "$file" .tsx)
  # 转换 kebab-case 到 camelCase
  CAMEL=$(echo "$COMP" | sed 's/-\(.\)/\U\1/g')
  IMPORTS=$(grep -r "$CAMEL\|$COMP" app/ components/layout/ components/sections/ --include="*.tsx" 2>/dev/null | grep -v "export default\|export function\|export const\|export {" | grep -v node_modules || true)
  if [ -z "$IMPORTS" ]; then
    echo "  ⚠️ $COMP — 可能未被使用"
    WARNINGS=$((WARNINGS + 1))
  fi
done

# 4. 检查文件大小（过大文件需要拆分）
echo ""
echo "📏 [4/6] 检查文件大小..."
find components app -name "*.tsx" -not -path "*/node_modules/*" -exec wc -l {} \; 2>/dev/null | sort -rn | head -5 | while read -r lines file; do
  if [ "$lines" -gt 200 ]; then
    echo "  ⚠️ $file — ${lines} 行（建议拆分）"
    WARNINGS=$((WARNINGS + 1))
  fi
done
echo "  ✅ 文件大小检查完成"

# 5. 检查 SEO 元数据
echo ""
echo "🔍 [5/6] 检查 SEO..."
if grep -q "description" app/layout.tsx 2>/dev/null && grep -q "keywords" app/layout.tsx 2>/dev/null; then
  echo "  ✅ layout.tsx 有 metadata"
else
  echo "  ❌ layout.tsx 缺少 metadata"
  ISSUES=$((ISSUES + 1))
fi

# 6. 检查依赖使用情况
echo ""
echo "📦 [6/6] 检查依赖使用..."
for dep in "framer-motion" "three" "lucide-react" "react-hook-form" "zod"; do
  IMPORTS=$(grep -r "from ['\"]$dep\|from ['\"]@/$dep" . --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | wc -l || true)
  if [ "$IMPORTS" -gt 0 ]; then
    echo "  ✅ $dep — 已使用 ($IMPORTS 处引用)"
  else
    echo "  ⚠️ $dep — 未使用（考虑移除）"
    WARNINGS=$((WARNINGS + 1))
  fi
done

echo ""
echo "========================================="
echo "📊 审查结果: $ISSUES 个问题, $WARNINGS 个警告"
echo "========================================="

if [ $ISSUES -gt 0 ]; then
  exit 1
fi
