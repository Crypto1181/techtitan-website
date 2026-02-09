@echo off
echo ========================================
echo   Rebuild with Fixed Configuration
echo ========================================
echo.

cd /d "%~dp0"

echo Current directory: %CD%
echo.

if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Make sure you're in the "Tecttian source" folder.
    pause
    exit /b 1
)

echo This will:
echo 1. Clean old build
echo 2. Rebuild with fixed configuration
echo 3. Verify file integrity
echo.

set /p CONFIRM="Continue? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================
echo   Step 1: Cleaning old build
echo ========================================
echo.

if exist "dist" (
    echo Deleting old dist folder...
    rd /s /q dist 2>nul
    timeout /t 1 /nobreak >nul
    echo ✅ Old build removed
)

echo.
echo ========================================
echo   Step 2: Installing dependencies
echo ========================================
echo.

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Step 3: Building with fixed config
echo ========================================
echo.

echo Building production bundle...
echo This may take 2-3 minutes...
echo.

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Step 4: Verifying build files
echo ========================================
echo.

if not exist "dist\assets" (
    echo ERROR: dist\assets folder not created!
    pause
    exit /b 1
)

cd dist\assets

echo Checking JavaScript file...
for %%F in (index-*.js) do (
    if exist "%%F" (
        echo ✅ File: %%~nxF
        echo    Size: %%~zA bytes
        echo    Size: %%~zA / 1024 KB
        echo    Size: %%~zA / 1024 / 1024 MB
        echo.
        
        REM Check if Node.js is available to validate
        where node >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo    Validating syntax...
            node --check "%%F" 2>nul
            if %ERRORLEVEL% EQU 0 (
                echo    ✅ File syntax is VALID!
            ) else (
                echo    ❌ File syntax is INVALID - corrupted!
            )
        )
    )
)

cd ..\..

echo.
echo ========================================
echo   Step 5: Creating .htaccess
echo ========================================
echo.

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
echo.
echo # Disable compression for JavaScript files
echo ^<IfModule mod_deflate.c^>
echo   SetEnvIfNoCase Request_URI \.\(?:js\|mjs\)$ no-gzip
echo ^</IfModule^>
echo.
echo # Set correct MIME types
echo ^<IfModule mod_mime.c^>
echo   AddType application/javascript .js
echo   AddType application/javascript .mjs
echo ^</IfModule^>
) > .htaccess
cd ..

echo ✅ .htaccess created
echo.

echo ========================================
echo   ✅ BUILD COMPLETE!
echo ========================================
echo.
echo Files ready in: %CD%\dist
echo.
echo Next steps:
echo 1. Test file integrity: test-js-file.bat
echo 2. Upload via FileZilla
echo 3. Delete old files from server first
echo 4. Clear browser cache
echo.
pause
