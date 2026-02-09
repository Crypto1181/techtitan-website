@echo off
echo ========================================
echo   Simple File Size Check
echo ========================================
echo.

cd /d "%~dp0"

echo Current folder: %CD%
echo.

if not exist "dist\assets" (
    echo ERROR: dist\assets folder not found!
    echo Make sure you're in the "Tecttian source" folder.
    pause
    exit /b 1
)

echo Opening assets folder to check file sizes...
echo.

cd dist\assets

echo Files in assets folder:
dir /b
echo.

echo Checking JavaScript file size...
for %%F in (index-*.js) do (
    if exist "%%F" (
        echo.
        echo File: %%~nxF
        for %%A in ("%%F") do (
            echo    Size: %%~zA bytes
            set /a KB=%%~zA/1024
            set /a MB=%%~zA/1024/1024
            echo    Size: !KB! KB
            echo    Size: !MB! MB
            echo.
            if %%~zA LSS 1000000 (
                echo    ❌ TOO SMALL! File is corrupted.
                echo    Expected: ~1,400,000 bytes
                echo    Rebuild needed!
            ) else (
                echo    ✅ Size looks GOOD!
                echo    Ready to upload.
            )
        )
    )
)

echo.
echo You can also check manually:
echo   1. Open File Explorer
echo   2. Go to: dist\assets folder
echo   3. Right-click on index-*.js file
echo   4. Properties → Check file size
echo   5. Should be ~1.4 MB (1,400,000 bytes)
echo.
pause
