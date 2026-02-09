@echo off
echo ========================================
echo   Test JavaScript File Integrity
echo ========================================
echo.

cd /d "%~dp0dist\assets"

if not exist "index-*.js" (
    echo ERROR: JavaScript file not found!
    pause
    exit /b 1
)

echo Checking JavaScript file integrity...
echo.

for %%F in (index-*.js) do (
    echo File: %%~nxF
    echo Size: %%~zA bytes
    echo.
    
    echo Checking file ending...
    REM Read last 100 characters of file
    powershell -Command "Get-Content '%%F' -Tail 5"
    echo.
    
    echo Checking if file ends properly...
    powershell -Command "$content = Get-Content '%%F' -Raw; if ($content -match '\);?\s*$') { Write-Host '✅ File ends with closing statement' } else { Write-Host '❌ File does not end properly' }"
    echo.
)

echo ========================================
echo   Test: Try to parse the file
echo ========================================
echo.

echo Attempting to validate JavaScript syntax...
echo (This will show if file is corrupted)
echo.

for %%F in (index-*.js) do (
    node --check "%%F" 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ File syntax is valid!
    ) else (
        echo ❌ File syntax is INVALID - file is corrupted!
        echo.
        echo This means the build created a corrupted file.
        echo Solution: Rebuild with different settings
    )
)

echo.
pause
