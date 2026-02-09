@echo off
echo ========================================
echo   Setup Frontend for Render Backend
echo ========================================
echo.

REM Change to the directory where this script is located
cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo This script will:
echo 1. Create .env.production file with your Render backend URL
echo 2. Build the frontend for production
echo.

REM Check if .env.production exists
if exist ".env.production" (
    echo .env.production already exists!
    echo.
    echo Current content:
    type .env.production
    echo.
    set /p UPDATE="Do you want to update it? (y/n): "
    if /i not "%UPDATE%"=="y" (
        echo Keeping existing .env.production
        goto :build
    )
)

echo.
echo ========================================
echo   Step 1: Enter Render Backend URL
echo ========================================
echo.
echo Please enter your Render backend URL.
echo Example: https://build-your-dream-pc-backend.onrender.com
echo (Don't include /api at the end, we'll add it automatically)
echo.
set /p RENDER_URL="Enter your Render backend URL: "

if "%RENDER_URL%"=="" (
    echo ERROR: Render URL cannot be empty!
    pause
    exit /b 1
)

REM Remove trailing slash if present
if "%RENDER_URL:~-1%"=="/" set RENDER_URL=%RENDER_URL:~0,-1%

REM Remove /api if present (we'll add it)
echo %RENDER_URL% | findstr /C:"/api" >nul
if not errorlevel 1 (
    set RENDER_URL=%RENDER_URL:/api=%
)

REM Add /api
set FULL_URL=%RENDER_URL%/api

echo.
echo Creating .env.production file...
echo.

(
echo # Production Environment Variables
echo # Backend API URL for production build
echo # Generated automatically on %date% %time%
echo.
echo VITE_BACKEND_API_URL=%FULL_URL%
) > .env.production

echo ✅ File created successfully!
echo.
echo Content:
type .env.production
echo.
echo File location: %CD%\.env.production
echo.

:build
echo.
echo ========================================
echo   Step 2: Building Frontend
echo ========================================
echo.

echo Installing dependencies (if needed)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

echo Building production bundle...
echo This may take a few minutes...
echo.
call npm run build
echo.

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Your production files are in the 'dist' folder.
    echo.
    echo Location: %CD%\dist
    echo.
    echo Next steps:
    echo 1. Test locally: npm run preview
    echo 2. Upload ALL files from 'dist' folder to Hostinger
    echo 3. Make sure .htaccess is uploaded (enable "Show hidden files" in file manager)
    echo.
    echo Files to upload:
    echo   - index.html
    echo   - assets\ folder (all files)
    echo   - .htaccess (important!)
    echo   - Any other files in dist folder
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo - Missing dependencies: Run 'npm install' first
    echo - TypeScript errors: Check the error messages
    echo - Wrong .env.production: Check the URL is correct
    echo.
)

pause
