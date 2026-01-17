#!/bin/bash

# ============================================================================
# Fix ALL Route Files - Comprehensive Solution
# Fixes middleware imports and function names across all route files
# Author: Souleymane Camara - BIT1007326
# ============================================================================

echo "========================================================"
echo "TaskBuddy Backend - Complete Route Files Fixer"
echo "========================================================"
echo ""

cd ~/taskbuddy/backend/routes || exit 1

echo "Step 1: Finding all route files..."
ROUTE_FILES=$(ls *.js 2>/dev/null)
if [ -z "$ROUTE_FILES" ]; then
    echo "❌ No route files found!"
    exit 1
fi

echo "Found route files:"
echo "$ROUTE_FILES"
echo ""

echo "Step 2: Fixing middleware imports..."
echo ""

for file in $ROUTE_FILES; do
    echo "Processing: $file"
    
    # Fix 1: Update auth middleware import path
    if grep -q "require('../middleware/auth')" "$file" 2>/dev/null; then
        sed -i "s|require('../middleware/auth')|require('../middleware/auth.middleware')|g" "$file"
        echo "  ✓ Fixed auth middleware import"
    fi
    
    # Fix 2: Update role middleware import path
    if grep -q "require('../middleware/role')" "$file" 2>/dev/null; then
        sed -i "s|require('../middleware/role')|require('../middleware/role.middleware')|g" "$file"
        echo "  ✓ Fixed role middleware import"
    fi
    
    # Fix 3: Update validation middleware import path
    if grep -q "require('../middleware/validation')" "$file" 2>/dev/null; then
        sed -i "s|require('../middleware/validation')|require('../middleware/validation.middleware')|g" "$file"
        echo "  ✓ Fixed validation middleware import"
    fi
done

echo ""
echo "Step 3: Fixing function names and imports..."
echo ""

for file in $ROUTE_FILES; do
    echo "Processing: $file"
    
    # Fix 4: Change authenticateToken to authenticate in imports
    if grep -q "authenticateToken" "$file" 2>/dev/null; then
        sed -i "s/const { authenticateToken/const { authenticate/g" "$file"
        sed -i "s/, authenticateToken/, authenticate/g" "$file"
        sed -i "s/authenticateToken,/authenticate,/g" "$file"
        echo "  ✓ Fixed authenticateToken in imports"
    fi
    
    # Fix 5: Change authenticateToken to authenticate in usage
    sed -i "s/^\s*authenticateToken,$/  authenticate,/g" "$file"
    sed -i "s/\s\s*authenticateToken,/  authenticate,/g" "$file"
    echo "  ✓ Fixed authenticateToken usage"
    
    # Fix 6: Change authorizeRoles to requireRole in imports
    if grep -q "authorizeRoles" "$file" 2>/dev/null; then
        sed -i "s/const { authorizeRoles/const { requireRole/g" "$file"
        sed -i "s/, authorizeRoles/, requireRole/g" "$file"
        sed -i "s/authorizeRoles,/requireRole,/g" "$file"
        echo "  ✓ Fixed authorizeRoles in imports"
    fi
    
    # Fix 7: Add missing requireRole import if needed
    if grep -q "requireRole(" "$file" 2>/dev/null; then
        if ! grep -q "const.*requireRole.*require" "$file" 2>/dev/null; then
            # Add import after auth.middleware import
            sed -i "/require.*auth\.middleware/a const { requireRole } = require('../middleware/role.middleware');" "$file"
            echo "  ✓ Added missing requireRole import"
        fi
    fi
done

echo ""
echo "Step 4: Fixing requireRole function calls syntax..."
echo ""

for file in $ROUTE_FILES; do
    # This is complex - we need to convert:
    # requireRole('parent', 'spouse', 'admin') 
    # to: requireRole(['parent', 'spouse', 'admin'])
    
    # Three roles pattern
    sed -i "s/requireRole('\([^']*\)', '\([^']*\)', '\([^']*\)')/requireRole(['\1', '\2', '\3'])/g" "$file"
    
    # Two roles pattern
    sed -i "s/requireRole('\([^']*\)', '\([^']*\)')/requireRole(['\1', '\2'])/g" "$file"
    
    # One role pattern (only if not already in array)
    sed -i "s/requireRole('\([^']*\)')/requireRole(['\1'])/g" "$file"
    
    echo "  ✓ Fixed requireRole syntax in $file"
done

echo ""
echo "Step 5: Verification..."
echo ""

echo "Checking for remaining issues:"
echo ""

# Check for incorrect imports
WRONG_IMPORTS=$(grep -n "require('../middleware/auth')" *.js 2>/dev/null | grep -v ".middleware" || echo "")
if [ -z "$WRONG_IMPORTS" ]; then
    echo "✓ All middleware imports are correct"
else
    echo "⚠ Warning: Some files still have incorrect imports:"
    echo "$WRONG_IMPORTS"
fi

# Check for authenticateToken
WRONG_TOKEN=$(grep -n "authenticateToken" *.js 2>/dev/null || echo "")
if [ -z "$WRONG_TOKEN" ]; then
    echo "✓ No authenticateToken found (correct)"
else
    echo "⚠ Warning: authenticateToken still exists in:"
    echo "$WRONG_TOKEN"
fi

# Check for authorizeRoles
WRONG_ROLES=$(grep -n "authorizeRoles" *.js 2>/dev/null || echo "")
if [ -z "$WRONG_ROLES" ]; then
    echo "✓ No authorizeRoles found (correct)"
else
    echo "⚠ Warning: authorizeRoles still exists in:"
    echo "$WRONG_ROLES"
fi

echo ""
echo "========================================================"
echo "Fix completed!"
echo "========================================================"
echo ""
echo "Summary of fixes applied:"
echo "  • Fixed middleware import paths (.middleware extension)"
echo "  • Changed authenticateToken → authenticate"
echo "  • Changed authorizeRoles → requireRole"
echo "  • Added missing requireRole imports"
echo "  • Fixed requireRole syntax (array parameters)"
echo ""
echo "Next step: Run 'npm run dev' from backend directory"
echo ""
