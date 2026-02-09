@echo off
echo ========================================
echo   Setup Frontend for Render Backend
echo ========================================
echo.

REM Change to the directory where this script is located
cd /d "%~dp0"

echo Current directory: %CD%
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
echo Please enter your Render backend URL.
echo Example: https://build-your-dream-pc-backend.onrender.com
echo.
set /p RENDER_URL="Enter your Render backend URL: "

if "%RENDER_URL%"=="" (
    echo ERROR: Render URL cannot be empty!
    pause
    exit /b 1
)

REM Remove trailing slash if present
if "%RENDER_URL:~-1%"=="/" set RENDER_URL=%RENDER_URL:~0,-1%

REM Add /api if not present
echo %RENDER_URL% | findstr /C:"/api" >nul
if errorlevel 1 (
    set FULL_URL=%RENDER_URL%/api
) else (
    set FULL_URL=%RENDER_URL%
)

echo.
echo Creating .env.production file...
echo.

(
echo # Production Environment Variables
echo # Backend API URL for production build
echo # Generated automatically
echo.
echo VITE_BACKEND_API_URL=%FULL_URL%
) > .env.production

echo ✅ File created successfully!
echo.
echo Content:
type .env.production
echo.

:build
echo ========================================
echo   Building Frontend for Production
echo ========================================
echo.

echo Step 1: Installing dependencies (if needed)...
call npm install
echo.

echo Step 2: Building production bundle...
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
    echo Next steps:
    echo 1. Test locally: npm run preview
    echo 2. Upload 'dist' folder contents to Hostinger
    echo 3. Make sure .htaccess is uploaded (show hidden files)
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
