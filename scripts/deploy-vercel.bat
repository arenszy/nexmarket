@echo off
echo ============================================
echo  Deploy Frontend ke Vercel
echo ============================================
echo.

where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo.
echo Deploying frontend...
cd ..\frontend
vercel --prod

echo.
echo Deploy selesai! Cek URL di atas.
pause
