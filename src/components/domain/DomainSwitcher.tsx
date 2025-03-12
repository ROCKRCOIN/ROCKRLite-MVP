// src/components/domain/DomainSwitcher.tsx

import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, Settings, LogOut, AlertCircle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { useDomain } from '@/hooks/useDomain';
import { useEvolution } from '@/hooks/useEvolution';
import { Domain } from '@/interfaces/domain/types';
import { DomainSwitcherProps } from '@/interfaces/domain/domain-component-types';

/**
 * DomainSwitcher component allows the user to switch between available domains
 * and provides options to access domain settings.
 * 
 * This component is evolution-ready and supports cross-domain operations.
 */
const DomainSwitcher: React.FC<DomainSwitcherProps> = ({
  currentDomain,
  availableDomains,
  onDomainChange,
  onSettingsClick,
  className = '',
  disabled = false
}) => {
  const { state, operations } = useDomain();
  const { features } = useEvolution();
  
  const [domains, setDomains] = useState<Domain[] | null>(null);
  const [selected, setSelected] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize domains from props or context
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // If domains are provided via props, use them
        if (availableDomains) {
          setDomains(availableDomains);
          setSelected(currentDomain || availableDomains[0]);
        } else {
          // Otherwise, use the domain context state
          const contextDomains = state.domains || [];
          setDomains(contextDomains.map(d => ({ 
            id: d, 
            name: d,
            emailPattern: `@${d}`,
            features: state.features || {},
            restrictions: state.restrictions || []
          })));
          
          setSelected(state.currentDomain ? {
            id: state.currentDomain,
            name: state.currentDomain,
            emailPattern: `@${state.currentDomain}`,
            features: state.features || {},
            restrictions: state.restrictions || []
          } : null);
        }
      } catch (err) {
        setError('Failed to load domains');
        console.error('Error loading domains:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomains();
  }, [availableDomains, currentDomain, state]);

  // Handle domain selection
  const handleDomainSelect = async (domain: Domain) => {
    if (disabled) return;
    
    try {
      setIsLoading(true);
      
      // Validate domain access before switching
      const isValidDomain = operations?.validateDomain ? 
        operations.validateDomain(domain.id) : true;
      
      if (!isValidDomain) {
        setError(`Access to domain ${domain.id} is not allowed`);
        return;
      }
      
      setSelected(domain);
      
      // Notify parent component if callback is provided
      if (onDomainChange) {
        onDomainChange(domain);
      } else {
        // Otherwise, use context to switch domains
        if (operations?.switchDomain) {
          await operations.switchDomain(domain.id);
        }
      }
    } catch (err) {
      setError('Failed to switch domains');
      console.error('Error switching domains:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && !selected) {
    return (
      <div className="h-10 flex items-center">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  // Error state
  if (error && !selected) {
    return (
      <Alert variant="destructive" className="h-10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Check if cross-domain features are enabled
  const isCrossDomainEnabled = features?.isEnabled ? 
    features.isEnabled('cross-domain') : false;

  return (
    <div className={`relative ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button 
            variant="outline" 
            className="h-10 px-3 w-full justify-between"
            disabled={disabled || isLoading}
          >
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {selected?.name || 'Select Domain'}
              </span>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end"></DropdownMenuContent>