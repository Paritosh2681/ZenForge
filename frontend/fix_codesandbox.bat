@echo off
cd /d "c:\Users\Abhishek\Downloads\ZenForge\frontend\components"
echo Backing up CodeSandbox.tsx to CodeSandbox.tsx.bak...
ren CodeSandbox.tsx CodeSandbox.tsx.bak
echo Copying CodeSandboxNew.tsx to CodeSandbox.tsx...
copy CodeSandboxNew.tsx CodeSandbox.tsx
echo File operations completed!
echo.
dir CodeSandbox.tsx* 
echo.
cd /d "c:\Users\Abhishek\Downloads\ZenForge\frontend"
echo Running npm run build...
call npm run build
