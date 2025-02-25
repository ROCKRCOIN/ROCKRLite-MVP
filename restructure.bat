@echo off 
echo Restructuring repository to match specification... 
 
REM Create config directory if it doesn't exist 
if not exist config mkdir config 
 
REM Move configuration files to config directory 
if exist tailwind.config.js move tailwind.config.js config\ 
if exist auth.config.js move auth.config.js config\ 
if exist database.config.js move database.config.js config\ 
if exist domain.config.js move domain.config.js config\ 
if exist evolution.config.js move evolution.config.js config\ 
if exist rks.config.js move rks.config.js config\ 
 
REM Create empty theme config file if it doesn't exist 
if not exist config\theme.config.js type nul 
 
echo Repository restructuring complete. 
