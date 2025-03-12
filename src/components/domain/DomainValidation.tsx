// src/components/domain/DomainValidation.tsx

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDomain } from '@/hooks/useDomain';
import { Domain } from '@/interfaces/domain/types';
import { DomainValidationProps, ValidationRule } from '@/interfaces/domain/domain-component-types';

/**
 * DomainValidation component validates a value against domain-specific rules.
 * It's used for email validation, permission checks, and other domain-specific validations.
 * 
 * This component is evolution-ready and supports cross-domain compatibility.
 */
const DomainValidation: React.FC<DomainValidationProps> = ({
  domain,
  rules = [],
  value,
  onValidationChange,
  className = ''
}) => {
  const { operations } = useDomain();
  const [validationResults, setValidationResults] = useState<{
    rule: ValidationRule;
    isValid: boolean;
  }[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  
  // Default email validation rule
  const defaultEmailRule: ValidationRule = {
    id: 'email-domain',
    name: 'Email Domain',
    description: 'Validates that an email belongs to the current domain',
    validate: (email: string, domain: Domain) => {
      if (!email || typeof email !== 'string') return false;
      return email.endsWith(domain.emailPattern);
    },
    errorMessage: `Email must end with ${domain.emailPattern}`
  };

  // Combine provided rules with defaults
  const allRules = rules.length > 0 ? rules : [defaultEmailRule];
  
  // Perform validation whenever value or domain changes
  useEffect(() => {
    if (value === undefined) {
      setIsValid(true);
      setValidationResults([]);
      onValidationChange && onValidationChange(true);
      return;
    }
    
    // Validate against domain context if needed
    const validateAgainstDomain = () => {
      if (!operations.validateDomain) return true;
      return operations.validateDomain(domain.id);
    };
    
    // Validate against each rule
    const results = allRules.map(rule => ({
      rule,
      isValid: rule.validate(value, domain) && validateAgainstDomain()
    }));
    
    const isAllValid = results.every(result => result.isValid);
    
    setValidationResults(results);
    setIsValid(isAllValid);
    
    // Notify parent of validation result
    onValidationChange && onValidationChange(isAllValid);
  }, [value, domain, allRules, operations, onValidationChange]);
  
  // If no value to validate, don't render anything
  if (value === undefined) {
    return null;
  }
  
  return (
    <div className={`mt-2 ${className}`}>
      {/* Only display validation messages when invalid */}
      {!isValid && (
        <div className="space-y-2">
          {validationResults
            .filter(result => !result.isValid)
            .map((result) => (
              <Alert key={result.rule.id} variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{result.rule.errorMessage}</AlertDescription>
              </Alert>
            ))}
        </div>
      )}
      
      {/* Success state when valid */}
      {isValid && value !== undefined && value !== '' && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>Valid for domain {domain.name}</span>
        </div>
      )}
    </div>
  );
};

export default DomainValidation;