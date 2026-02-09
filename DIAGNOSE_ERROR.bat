@echo off
echo ========================================
echo   Diagnose JavaScript Error
echo ========================================
echo.

echo This will help identify the root cause of the error.
echo.

echo ========================================
echo   Step 1: Check Local File
echo ========================================
echo.

cd /d "%~dp0dist\assets"

if exist "index-*.js" (
    for %%F in (index-*.js) do (
        echo Local JavaScript file:
        echo   Name: %%~nxF
        echo   Size: %%~zA bytes
        echo   Size: %%~zA / 1024 KB
        echo.
    )
) else (
    echo ERROR: JavaScript file not found!
)

echo ========================================
echo   Step 2: Check Build Configuration
echo ========================================
echo.

cd /d "%~dp0"

if exist ".env.production" (
    echo ✅ .env.production exists
    echo.
    echo Content:
    type .env.production
    echo.
) else (
    echo ❌ .env.production NOT FOUND!
    echo.
    echo This means the build might be using localhost:3001
    echo instead of your Render backend URL.
    echo.
    echo Solution: Create .env.production with your Render URL
)

echo.
echo ========================================
echo   Step 3: Check index.html
echo ========================================
echo.

if exist "dist\index.html" (
    echo Checking how JavaScript is loaded...
    findstr /C:"index-" dist\index.html
    echo.
) else (
    echo ERROR: index.html not found!
)

echo.
echo ========================================
echo   Diagnosis Complete
echo ========================================
echo.
echo Common Issues:
echo   1. Server compression truncating file
echo   2. Missing .env.production (wrong backend URL)
echo   3. File upload incomplete
echo   4. Browser cache showing old file
echo.
echo Solutions:
echo   1. Upload NEW .htaccess file (disables compression)
echo   2. Create .env.production with Render URL
echo   3. Re-upload JavaScript file via FTP
echo   4. Clear browser cache completely
echo.
pause
