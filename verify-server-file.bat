@echo off
echo ========================================
echo   Verify Server File vs Local File
echo ========================================
echo.

echo This will help you verify if the server file matches local file.
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
        echo   Size: %%~zA / 1024 / 1024 MB
        echo.
        set LOCAL_FILE=%%~nxF
        set LOCAL_SIZE=%%~zA
    )
) else (
    echo ERROR: Local JavaScript file not found!
    pause
    exit /b 1
)

echo ========================================
echo   Step 2: Instructions for FileZilla
echo ========================================
echo.

echo 1. Open FileZilla
echo 2. Connect to Hostinger
echo 3. Navigate to: public_html/assets
echo 4. Find the JavaScript file: %LOCAL_FILE%
echo 5. Right-click → Download
echo 6. Download to your Desktop
echo 7. Right-click downloaded file → Properties
echo 8. Check file size
echo.
echo Expected size: %LOCAL_SIZE% bytes
echo.
echo If downloaded file size matches:
echo   ✅ File is correct on server
echo   ✅ Problem is server serving it truncated
echo   ✅ Solution: Updated .htaccess should fix it
echo.
echo If downloaded file size is smaller:
echo   ❌ File is corrupted on server
echo   ❌ Solution: Delete and re-upload
echo.

echo ========================================
echo   Step 3: Test Direct File Access
echo ========================================
echo.

echo After uploading .htaccess, test:
echo.
echo 1. Visit: https://yourdomain.com/assets/%LOCAL_FILE%
echo 2. Right-click → Save As
echo 3. Check saved file size
echo 4. Should match local file size
echo.

pause
