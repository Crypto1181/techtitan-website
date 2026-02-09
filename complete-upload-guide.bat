@echo off
echo ========================================
echo   Complete Upload Guide
echo ========================================
echo.

cd /d "%~dp0dist"

if not exist "." (
    echo ERROR: dist folder not found!
    echo Please run 'npm run build' first.
    pause
    exit /b 1
)

echo ========================================
echo   Step 1: Verify Local Files
echo ========================================
echo.

echo Checking JavaScript file size...
cd assets
for %%F in (index-*.js) do (
    for %%A in ("%%F") do (
        echo File: %%~nxF
        echo Size: %%~zA bytes
        if %%~zA LSS 1000000 (
            echo ❌ ERROR: File is too small! Rebuild needed.
        ) else (
            echo ✅ File size looks good!
            echo    Expected on server: %%~zA bytes
        )
    )
)
cd ..

echo.
echo ========================================
echo   Step 2: FileZilla Upload Instructions
echo ========================================
echo.

echo IMPORTANT STEPS:
echo.
echo 1. DELETE OLD FILES FIRST:
echo    - In FileZilla, go to public_html on server
echo    - Select ALL files and folders
echo    - Right-click → Delete
echo    - Wait for deletion to complete
echo.
echo 2. UPLOAD NEW FILES:
echo    - Left side: Navigate to this folder: %CD%
echo    - Right side: Navigate to public_html on server
echo    - Select ALL files (Ctrl+A)
echo    - Drag and drop to server
echo    - Watch transfer queue - wait for ALL to show "Successful"
echo.
echo 3. VERIFY JAVASCRIPT FILE:
echo    - Right-click on index-*.js file on server
echo    - Properties → Check file size
echo    - Should match local size shown above
echo.
echo 4. CLEAR BROWSER CACHE:
echo    - Press Ctrl+Shift+Delete
echo    - Clear all cached files
echo    - OR use Incognito/Private mode
echo.
echo 5. TEST:
echo    - Visit your website
echo    - Press F12 → Check console for errors
echo    - Should see NO errors if file uploaded correctly
echo.
pause
