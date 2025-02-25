@echo off 
echo Creating directory structure to match specification... 
 
REM Ensure src directory structure matches specification 
if not exist src\components\ui mkdir src\components\ui 
if not exist src\components\profiles mkdir src\components\profiles 
if not exist src\components\experience mkdir src\components\experience 
if not exist src\components\auction mkdir src\components\auction 
if not exist src\components\shared mkdir src\components\shared 
 
if not exist src\contexts mkdir src\contexts 
if not exist src\contexts\ProfileContext mkdir src\contexts\ProfileContext 
if not exist src\contexts\ExperienceContext mkdir src\contexts\ExperienceContext 
if not exist src\contexts\DomainContext mkdir src\contexts\DomainContext 
 
if not exist src\hooks mkdir src\hooks 
if not exist src\utils mkdir src\utils 
if not exist src\types mkdir src\types 
if not exist src\styles mkdir src\styles 
 
REM Ensure public directory structure matches specification 
if not exist public\assets\icons mkdir public\assets\icons 
if not exist public\assets\images mkdir public\assets\images 
if not exist public\assets\fonts mkdir public\assets\fonts 
if not exist public\data\venues mkdir public\data\venues 
if not exist public\data\subjects mkdir public\data\subjects 
if not exist public\data\templates mkdir public\data\templates 
 
echo Directory structure creation complete. 
