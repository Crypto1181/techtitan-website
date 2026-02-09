@echo off
echo ========================================
echo   Fix Build Error - Rebuild Now
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

echo I've fixed the vite.config.ts to use esbuild instead of terser.
echo.
echo Now rebuilding...
echo.

if exist "dist" (
    echo Cleaning old build...
    rd /s /q dist 2>nul
    timeout /t 1 /nobreak >nul
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
echo This may take 2-3 minutes...
echo.

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ BUILD SUCCESSFUL!
echo ========================================
echo.

cd dist\assets
for %%F in (index-*.js) do (
    if exist "%%F" (
        echo JavaScript file: %%~nxF
        echo    Size: %%~zA bytes
        echo    Size: %%~zA / 1024 KB
        echo    Size: %%~zA / 1024 / 1024 MB
    )
)
cd ..\..

echo.
echo Files ready in: %CD%\dist
echo.
echo Next: Upload via FileZilla and test!
echo.
pause
