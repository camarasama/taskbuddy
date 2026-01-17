#!/bin/bash

# ============================================================================
# Fix authorizeRoles Function Name Issue
# Replaces incorrect authorizeRoles with requireRole
# Author: Souleymane Camara - BIT1007326
# ============================================================================

echo "================================================"
echo "TaskBuddy Backend - Role Middleware Fix"
echo "================================================"
echo ""

cd ~/taskbuddy/backend || exit 1

echo "Step 1: Checking Analytics.routes.js..."
if [ ! -f "routes/Analytics.routes.js" ]; then
    echo "❌ Error: Analytics.routes.js not found!"
    exit 1
fi
echo "✓ File found"
echo ""

echo "Step 2: Checking current import statement..."
grep "requireRole\|authorizeRoles" routes/Analytics.routes.js | head -3
echo ""

echo "Step 3: Fixing the issue..."
echo ""

# Fix the import statement
echo "  → Fixing import statement..."
sed -i "s/const { authorizeRoles }/const { requireRole }/g" routes/Analytics.routes.js
echo "    ✓ Import statement fixed"

# Fix all function calls
echo "  → Fixing function calls..."
sed -i "s/authorizeRoles(/requireRole(/g" routes/Analytics.routes.js
echo "    ✓ Function calls fixed"

echo ""
echo "Step 4: Verification..."
echo ""
echo "Checking updated imports:"
grep "require.*role.*middleware" routes/Analytics.routes.js
echo ""
echo "Checking if authorizeRoles still exists:"
REMAINING=$(grep "authorizeRoles" routes/Analytics.routes.js 2>/dev/null || echo "None found")

if [ "$REMAINING" = "None found" ]; then
    echo "✓ All instances of 'authorizeRoles' have been replaced with 'requireRole'"
else
    echo "⚠ Warning: Some instances of 'authorizeRoles' still remain:"
    echo "$REMAINING"
fi
echo ""

echo "Step 5: Checking other route files for similar issues..."
echo ""
OTHER_FILES=$(grep -l "authorizeRoles" routes/*.js 2>/dev/null || echo "")

if [ -z "$OTHER_FILES" ]; then
    echo "✓ No other files have this issue"
else
    echo "⚠ The following files also use 'authorizeRoles':"
    echo "$OTHER_FILES"
    echo ""
    echo "Fixing them now..."
    
    for file in $OTHER_FILES; do
        echo "  → Fixing $file..."
        sed -i "s/const { authorizeRoles }/const { requireRole }/g" "$file"
        sed -i "s/authorizeRoles(/requireRole(/g" "$file"
        echo "    ✓ Fixed"
    done
fi
echo ""

echo "================================================"
echo "Fix completed!"
echo "================================================"
echo ""
echo "Next step: Run 'npm run dev' to test the server"
echo ""
