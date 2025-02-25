@echo off 
echo Fixing contexts directory structure... 
 
REM Create contexts directories if they don't exist 
if not exist src\contexts\ProfileContext mkdir src\contexts\ProfileContext 
if not exist src\contexts\ExperienceContext mkdir src\contexts\ExperienceContext 
if not exist src\contexts\DomainContext mkdir src\contexts\DomainContext 
 
REM Ensure contexts have the correct structure 
if exist src\contexts\ProfileContext.tsx move src\contexts\ProfileContext.tsx src\contexts\ProfileContext\ 
if exist src\contexts\ExperienceContext.tsx move src\contexts\ExperienceContext.tsx src\contexts\ExperienceContext\ 
if exist src\contexts\DomainContext.tsx move src\contexts\DomainContext.tsx src\contexts\DomainContext\ 
 
echo Contexts directory structure fixed. 
