#!/bin/bash
# Development environment startup script for Personal Website
set -e

echo "🚀 Starting Personal Website development environment..."

# Navigate to project directory
cd /Users/damon/Documents/Projects/my_website

# Check if node_modules exists, install if not
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start dev server
echo "🌐 Starting Vite dev server..."
npm run dev &

# Wait for server to be ready
echo "⏳ Waiting for server..."
sleep 3

# Check if server started successfully
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Server running at http://localhost:5173"
elif curl -s http://localhost:5174 > /dev/null 2>&1; then
    echo "✅ Server running at http://localhost:5174"
elif curl -s http://localhost:5175 > /dev/null 2>&1; then
    echo "✅ Server running at http://localhost:5175"
elif curl -s http://localhost:5176 > /dev/null 2>&1; then
    echo "✅ Server running at http://localhost:5176"
else
    echo "⚠️  Server may be starting on a different port. Check the output above."
fi

echo ""
echo "📝 Development environment ready!"
echo "   - Edit files in src/ for live reload"
echo "   - Press Ctrl+C to stop the server"
echo ""

# Keep script running to maintain server
wait
