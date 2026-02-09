@echo off
echo ========================================
echo   Create Final .htaccess File
echo ========================================
echo.

cd /d "%~dp0dist"

if not exist "." (
    echo ERROR: dist folder not found!
    echo Please run 'npm run build' first.
    pause
    exit /b 1
)

echo Creating .htaccess with server fix settings...
echo.

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
echo # CRITICAL: Disable ALL compression for JavaScript files
echo ^<IfModule mod_deflate.c^>
echo   SetEnvIfNoCase Request_URI \.\(js\|mjs\)$ no-gzip dont-vary
echo   SetEnvIfNoCase Request_URI \.\(js\|mjs\)$ no-gzip
echo ^</IfModule^>
echo.
echo # Disable output buffering completely
echo php_flag output_buffering Off
echo php_value output_buffering 0
echo.
echo # Set correct MIME types
echo ^<IfModule mod_mime.c^>
echo   AddType application/javascript .js
echo   AddType application/javascript .mjs
echo   AddType text/css .css
echo ^</IfModule^>
echo.
echo # Disable compression headers
echo ^<IfModule mod_headers.c^>
echo   ^<FilesMatch "\.\(js\|mjs\)$"^>
echo     Header unset Content-Encoding
echo     Header unset Vary
echo   ^</FilesMatch^>
echo ^</IfModule^>
) > .htaccess

if %ERRORLEVEL% EQU 0 (
    echo ✅ .htaccess file created successfully!
    echo.
    echo Location: %CD%\.htaccess
    echo.
    echo This file includes:
    echo   - Disables compression for JS files
    echo   - Disables output buffering
    echo   - Removes compression headers
    echo   - Sets correct MIME types
    echo.
    echo Upload this file to public_html on your server!
    echo.
) else (
    echo ❌ Failed to create .htaccess file!
)

pause
