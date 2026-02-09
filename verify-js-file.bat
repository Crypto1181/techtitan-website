@echo off
echo ========================================
echo   Verify JavaScript File Size
echo ========================================
echo.

cd /d "%~dp0dist\assets"

if not exist "." (
    echo ERROR: dist\assets folder not found!
    echo Please run 'npm run build' first.
    pause
    exit /b 1
)

echo Checking JavaScript file...
echo.

for %%F in (index-*.js) do (
    echo File: %%~nxF
    for %%A in ("%%F") do (
        set /a size=%%~zA
        set /a sizeKB=%%~zA/1024
        set /a sizeMB=%%~zA/1024/1024
        echo    Size: %%~zA bytes
        echo    Size: !sizeKB! KB
        echo    Size: !sizeMB! MB
        echo.
        if %%~zA LSS 1000000 (
            echo    ❌ ERROR: File is TOO SMALL!
            echo    Expected: ~1,400,000 bytes (~1.4 MB)
            echo    Actual: %%~zA bytes
            echo.
            echo    This file is corrupted or incomplete.
            echo    Solution: Rebuild the frontend.
        ) else if %%~zA GTR 2000000 (
            echo    ⚠️  File is larger than expected, but should be OK.
        ) else (
            echo    ✅ File size looks correct!
            echo    This file should work when uploaded properly.
        )
    )
)

echo.
echo ========================================
echo   Upload Instructions:
echo ========================================
echo.
echo 1. Make sure FileZilla shows "Transfer successful" for the JS file
echo 2. After upload, verify file size on server matches local size
echo 3. Clear browser cache (Ctrl+Shift+Delete)
echo 4. Test in Incognito/Private mode
echo.
pause
