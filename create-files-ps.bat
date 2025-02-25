@echo off 
echo Creating core files using PowerShell... 
 
echo Creating directories... 
mkdir -p src\interfaces\domain 
mkdir -p src\interfaces\evolution 
mkdir -p src\utils 
 
echo Creating PowerShell script... 
# Create domain types file 
Write-Host 'Creating domain types file...' 
$domainTypes = @' 
// src/interfaces/domain/types.ts 
import { Version } from '../evolution/types'; 
import { MigrationStrategy } from '../evolution/types'; 
 
export interface DomainState { 
  domains: string[]; 
  loading: boolean; 
  features: FeatureMap; 
  restrictions: string[]; 
  version: Version; 
} 
 
export interface DomainConfig { 
  id: string; 
  name: string; 
  emailPattern: string; 
  features: FeatureMap; 
  restrictions: string[]; 
  rks: { 
    weeklyUimaCredit: number; 
    targetSeatPrice: number; 
    roleAllocations: RoleAllocation[]; 
  }; 
} 
'@ 
Set-Content -Path 'src\interfaces\domain\types.ts' -Value $domainTypes 
 
# Create evolution types file 
Write-Host 'Creating evolution types file...' 
$evolutionTypes = @' 
// src/interfaces/evolution/types.ts 
export interface Version { 
  major: number; 
  minor: number; 
  patch: number; 
  timestamp: number; 
} 
 
export interface MigrationStrategy { 
  id: string; 
  version: Version; 
  steps: MigrationStep[]; 
  validation: ValidationStep[]; 
  rollback: RollbackStep[]; 
} 
'@ 
Set-Content -Path 'src\interfaces\evolution\types.ts' -Value $evolutionTypes 
 
# Create utility files 
Write-Host 'Creating utility files...' 
$domainUtils = @' 
// src/utils/domain.ts 
import type { DomainConfig, Permission, User } from '../interfaces/domain/types'; 
 
export const validateDomainAccess = (domain: string, user?: User): boolean =
  if (!domain) return false; 
  if (!user) return false; 
  return user.domains.includes(domain); 
}; 
'@ 
Set-Content -Path 'src\utils\domain.ts' -Value $domainUtils 
 
$evolutionUtils = @' 
// src/utils/evolution.ts 
import type { Version, MigrationStrategy } from '../interfaces/evolution/types'; 
 
export const validateVersion = (version: Version): boolean =
  return ( 
    typeof version.timestamp === 'number' 
  ); 
}; 
'@ 
Set-Content -Path 'src\utils\evolution.ts' -Value $evolutionUtils 
 
Write-Host 'Core files created successfully.' 
'@ 
 
echo Running PowerShell script... 
powershell -File create-files.ps1 
 
echo Process completed. 
