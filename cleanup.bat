@echo off 
echo Cleaning up repository structure to match specification... 
 
REM Move any useful content from sub-projects to main structure 
if exist ROCKRLite-Core\src\* xcopy /E /I /Y ROCKRLite-Core\src\* src\ 
if exist ROCKRLite-Domain\src\* xcopy /E /I /Y ROCKRLite-Domain\src\* src\ 
if exist ROCKRLite-Experience\src\* xcopy /E /I /Y ROCKRLite-Experience\src\* src\ 
if exist ROCKRLite-Transaction\src\* xcopy /E /I /Y ROCKRLite-Transaction\src\* src\ 
 
echo Finished moving content. 
pause 
echo Removing unnecessary directories... 
 
REM Remove directories not in specification 
rmdir /S /Q ROCKRLite-Core 
rmdir /S /Q ROCKRLite-Domain 
rmdir /S /Q ROCKRLite-Experience 
rmdir /S /Q ROCKRLite-Transaction 
 
echo Repository cleanup complete. 
