@echo off
echo ========================================
echo   Clean Rebuild - Fix Corrupted Build
echo ========================================
echo.

REM Change to the directory where this script is located
cd /d "%~dp0"

echo Current directory: %CD%
echo.

REM Verify we're in the correct directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo.
    echo Expected location: %CD%\package.json
    echo.
    echo Please make sure you're running this script from the
    echo "Tecttian source" folder.
    echo.
    pause
    exit /b 1
)

echo ✅ Found package.json - we're in the correct directory!
echo.

echo This will:
echo 1. Delete old dist folder
echo 2. Rebuild frontend
echo 3. Verify all files are complete
echo.

set /p CONFIRM="Continue? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================
echo   Step 1: Removing old build
echo ========================================
echo.

if exist "dist" (
    echo Deleting old dist folder...
    REM Try to close any processes that might be using files
    timeout /t 1 /nobreak >nul
    rd /s /q dist 2>nul
    if exist "dist" (
        echo ⚠️  Warning: Could not fully delete dist folder
        echo Some files may be in use. Continuing anyway...
    ) else (
        echo ✅ Old build removed
    )
) else (
    echo No old build found
)

echo.
echo ========================================
echo   Step 2: Installing dependencies
echo ========================================
echo.

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed!
    echo.
    echo Please check:
    echo 1. You're in the correct directory (Tecttian source)
    echo 2. package.json exists
    echo 3. Node.js is installed
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Step 3: Building frontend
echo ========================================
echo.

echo Building production bundle...
echo This may take 2-3 minutes...
echo.

call npm run build
echo.

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo   ❌ BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Step 4: Verifying build files
echo ========================================
echo.

if not exist "dist" (
    echo ERROR: dist folder not created!
    pause
    exit /b 1
)

cd dist

echo Checking files...
echo.

if exist "index.html" (
    echo ✅ index.html
) else (
    echo ❌ index.html MISSING!
)

if exist "assets" (
    echo ✅ assets folder
    
    cd assets
    for %%F in (index-*.js) do (
        echo ✅ JavaScript: %%~nxF
        for %%A in ("%%F") do (
            echo    Size: %%~zA bytes
            set /a sizeMB=%%~zA/1024/1024
            if %%~zA LSS 1000000 (
                echo    ⚠️  WARNING: File seems too small! Should be ~1.4 MB
            ) else (
                echo    ✅ File size looks good! (~%%~zA bytes)
            )
        )
    )
    for %%F in (index-*.css) do (
        echo ✅ CSS: %%~nxF
        for %%A in ("%%F") do echo    Size: %%~zA bytes
    )
    cd ..
) else (
    echo ❌ assets folder MISSING!
)

if exist ".htaccess" (
    echo ✅ .htaccess
) else (
    echo ⚠️  .htaccess not found, creating it...
    (
    echo # Enable Rewrite Engine
    echo ^<IfModule mod_rewrite.c^>
    echo   RewriteEngine On
    echo   RewriteBase /
    echo.
    echo   # Handle React Router
    echo   RewriteCond %%{REQUEST_FILENAME} !-f
    echo   RewriteCond %%{REQUEST_FILENAME} !-d
    echo   RewriteRule ^ index.html [L]
    echo ^</IfModule^>
    ) > .htaccess
    echo ✅ .htaccess created
)

cd ..

echo.
echo ========================================
echo   ✅ BUILD COMPLETE!
echo ========================================
echo.
echo Files are ready in: %CD%\dist
echo.
echo IMPORTANT: Upload using FTP (FileZilla)!
echo Web file managers often truncate large files.
echo.
echo Next steps:
echo 1. Download FileZilla (free FTP client)
echo 2. Connect to Hostinger
echo 3. Upload ALL files from dist folder
echo 4. Verify file sizes match after upload
echo.
pause
