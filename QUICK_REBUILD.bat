@echo off
echo ========================================
echo   Quick Rebuild
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo Current directory: %CD%
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: Cannot find package.json!
    echo.
    echo Make sure you're running this from the "Tecttian source" folder.
    echo.
    echo Current path: %CD%
    echo.
    pause
    exit /b 1
)

echo ✅ Found package.json
echo.

echo Cleaning old build...
if exist "dist" (
    rd /s /q dist 2>nul
)
echo.

echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

echo Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo Creating .htaccess...
cd dist
(
echo # Enable Rewrite Engine
echo ^<IfModule mod_rewrite.c^>
echo   RewriteEngine On
echo   RewriteBase /
echo   RewriteCond %%{REQUEST_FILENAME} !-f
echo   RewriteCond %%{REQUEST_FILENAME} !-d
echo   RewriteRule ^ index.html [L]
echo ^</IfModule^>
) > .htaccess
cd ..

echo.
echo ✅ BUILD COMPLETE!
echo.
echo Files ready in: %CD%\dist
echo.
echo Upload using FTP (FileZilla) for best results!
echo.
pause
