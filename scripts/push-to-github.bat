@echo off
echo ============================================
echo  ShopeeClone - Push to GitHub
echo ============================================
echo.

set /p GITHUB_USER="Masukkan GitHub username kamu: "
set /p REPO_NAME="Nama repo (default: shopeeclone): "

if "%REPO_NAME%"=="" set REPO_NAME=shopeeclone

echo.
echo Membuat repo di GitHub...
echo Buka: https://github.com/new
echo Nama repo: %REPO_NAME%
echo Visibility: Public
echo JANGAN centang "Initialize this repository"
echo.
pause

git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
git branch -M main
git push -u origin main

echo.
echo ============================================
echo  BERHASIL! Repo tersedia di:
echo  https://github.com/%GITHUB_USER%/%REPO_NAME%
echo ============================================
echo.
echo Langkah selanjutnya:
echo 1. Deploy backend ke Render: https://render.com
echo 2. Deploy frontend ke Vercel: https://vercel.com
echo 3. Baca DEPLOYMENT.md untuk panduan lengkap
echo.
pause
