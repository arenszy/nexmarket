@echo off
echo ============================================
echo  Nexmarket - Push to GitHub
echo ============================================
echo.

set /p GITHUB_USER="Masukkan GitHub username kamu: "

echo.
echo Langkah:
echo 1. Buka https://github.com/new
echo 2. Nama repo: nexmarket
echo 3. Visibility: Public
echo 4. JANGAN centang "Initialize this repository"
echo 5. Klik Create repository
echo.
pause

git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/nexmarket.git
git branch -M main
git push -u origin main

echo.
echo ============================================
echo  BERHASIL!
echo  https://github.com/%GITHUB_USER%/nexmarket
echo ============================================
echo.
echo Langkah selanjutnya:
echo 1. Deploy backend ke Render: https://render.com
echo 2. Deploy frontend ke Vercel: https://vercel.com
echo 3. Baca DEPLOYMENT.md untuk panduan lengkap
echo.
pause
