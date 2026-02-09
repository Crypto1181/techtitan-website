@echo off
echo Preparing deployment files...
cd /d "%~dp0"

REM Copy .htaccess to dist
if exist ".htaccess" (
    copy ".htaccess" "dist\.htaccess" >nul
    echo [OK] .htaccess copied to dist
) else (
    echo [WARN] .htaccess not found
)

REM Create catalogs folder in dist if it doesn't exist
if not exist "dist\catalogs" mkdir "dist\catalogs"

REM Copy catalogs folder from public to dist
if exist "public\catalogs" (
    xcopy "public\catalogs\*" "dist\catalogs\" /E /Y /I >nul
    echo [OK] Catalogs folder copied to dist
) else (
    echo [WARN] No catalogs folder found in public
)

echo.
echo ========================================
echo Deployment files ready in dist/ folder
echo ========================================
echo.
echo Next steps:
echo 1. Upload ALL contents of dist/ folder to Hostinger
echo 2. Make sure .htaccess is uploaded (it's a hidden file)
echo 3. Verify catalogs/ folder is uploaded
echo.
pause
