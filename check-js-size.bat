@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Check JavaScript File Size
echo ========================================
echo.

cd /d "%~dp0"

if not exist "dist\assets" (
    echo ERROR: dist\assets folder not found!
    echo Please run 'npm run build' first.
    echo.
    pause
    exit /b 1
)

cd dist\assets

echo Checking JavaScript files in assets folder...
echo.

for %%F in (index-*.js) do (
    if exist "%%F" (
        echo File: %%~nxF
        for %%A in ("%%F") do (
            set size=%%~zA
            set /a sizeKB=!size!/1024
            set /a sizeMB=!size!/1024/1024
            echo    Size: !size! bytes
            echo    Size: !sizeKB! KB
            echo    Size: !sizeMB! MB
            echo.
            if !size! LSS 1000000 (
                echo    ❌ ERROR: File is TOO SMALL!
                echo    Expected: ~1,400,000 bytes (~1.4 MB)
                echo    Actual: !size! bytes
                echo.
                echo    This file is corrupted or incomplete.
                echo    Solution: Rebuild the frontend with 'npm run build'
            ) else if !size! GTR 2000000 (
                echo    ⚠️  File is larger than expected, but should be OK.
            ) else (
                echo    ✅ File size looks CORRECT!
                echo    This file should work when uploaded properly.
            )
        )
    )
)

echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo If file size is correct (~1.4 MB):
echo   1. Upload via FileZilla
echo   2. Delete old files from server first
echo   3. Verify file size on server matches above
echo   4. Clear browser cache
echo.
echo If file size is too small:
echo   1. Rebuild: npm run build
echo   2. Check size again
echo.
pause
