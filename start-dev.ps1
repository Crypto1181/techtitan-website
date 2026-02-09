# Bypass execution policy for this script only
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
cd $PSScriptRoot
node node_modules\vite\bin\vite.js
