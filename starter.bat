@echo off

@echo loading..

if not exist node_modules (
    call npm install
)

:: check for updates
for /f %%a in ('git ls-remote origin refs/heads/%BRANCH%') do set REMOTE=%%a
for /f %%a in ('git rev-parse %BRANCH%') do set LOCAL=%%a

if not "%LOCAL%" == "%REMOTE%" (
    git pull
    call npm install
)

cls

call npm start

pause