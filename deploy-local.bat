@echo off
title Restaurant Management System - Local Deployment

echo.
echo ================================================================
echo ^🍽️  Restaurant Management System - Local Deployment
echo ================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v14 or higher.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
)

REM Display Node.js and npm versions
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] Node.js is installed: %NODE_VERSION%
echo [SUCCESS] npm is installed: %NPM_VERSION%
echo.

REM Handle command line arguments
if "%1"=="install" goto install
if "%1"=="start" goto start
if "%1"=="backend" goto backend
if "%1"=="frontend" goto frontend
if "%1"=="check" goto check
if "%1"=="help" goto help
if "%1"=="" goto full_install

echo [ERROR] Unknown option: %1
goto help

:install
echo [INFO] Installing Restaurant Management System...
echo.
goto install_deps

:full_install
echo [INFO] Starting full installation and deployment...
echo.

:install_deps
echo [INFO] Creating necessary directories...
if not exist "server\uploads" mkdir server\uploads
if not exist "server\database" mkdir server\database
echo [SUCCESS] Directories created!
echo.

echo [INFO] Installing dependencies...
echo.

echo [INFO] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

echo [INFO] Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)

echo [INFO] Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)

cd ..
echo [SUCCESS] All dependencies installed successfully!
echo.

if "%1"=="install" (
    echo To start the application, run: %0 start
    pause
    exit /b 0
)

:start
echo [INFO] Starting the Restaurant Management System...
echo [INFO] Backend will run on: http://localhost:5000
echo [INFO] Frontend will run on: http://localhost:3000
echo [WARNING] Press Ctrl+C to stop the application
echo.
call npm run dev
goto end

:backend
echo [INFO] Starting backend server only...
echo [INFO] Backend will run on: http://localhost:5000
cd server
call npm start
goto end

:frontend
echo [INFO] Starting frontend only...
echo [INFO] Frontend will run on: http://localhost:3000
cd client
call npm start
goto end

:check
echo [INFO] Checking system requirements...
echo [SUCCESS] Node.js is installed: %NODE_VERSION%
echo [SUCCESS] npm is installed: %NPM_VERSION%
echo.
echo [INFO] Checking if ports 3000 and 5000 are available...
netstat -an | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 3000 is already in use
) else (
    echo [SUCCESS] Port 3000 is available
)
netstat -an | findstr ":5000" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 5000 is already in use
) else (
    echo [SUCCESS] Port 5000 is available
)
pause
goto end

:help
echo.
echo Restaurant Management System - Deployment Options:
echo.
echo Usage: %0 [OPTION]
echo.
echo Options:
echo   install     Install all dependencies
echo   start       Start both frontend and backend
echo   backend     Start backend server only
echo   frontend    Start frontend only
echo   check       Check system requirements and ports
echo   help        Show this help message
echo.
echo Examples:
echo   %0 install    # Install dependencies
echo   %0 start      # Start the full application
echo   %0 backend    # Start only the backend
echo.
pause
goto end

:end
echo.
echo Goodbye!