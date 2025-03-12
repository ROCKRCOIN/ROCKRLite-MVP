// src/components/domain/CrossDomainManager.tsx

import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle, Loader2, Check, Link, LinkOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDomain } from '@/hooks/useDomain';
import { useEvolution } from '@/hooks/useEvolution';
import { Domain } from '@/interfaces/domain/types';
import { CrossDomainManagerProps, DomainRelationship } from '@/interfaces/domain/domain-component-types';

/**
 * CrossDomainManager component manages relationships between domains,
 * allowing users to control which domains can interact with each other.
 * 
 * This component is evolution-ready and fully implements cross-domain compatibility.
 */
const CrossDomainManager: React.FC<CrossDomainManagerProps> = ({
  primaryDomain,
  availableDomains,
  allowedDomains: initialAllowedDomains = [],
  onAllowedDomainsChange,
  onSave,
  onCancel,
  className = ''
}) => {
  const { operations, crossDomain } = useDomain();
  const { version } = useEvolution();
  
  const [relationships, setRelationships] = useState<DomainRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Initialize domain relationships
  useEffect(() => {
    const initializeRelationships = async () => {
      try {
        setIsLoading(true);
        
        // Create relationships for all available domains except the primary one
        const rels: DomainRelationship[] = availableDomains
          .filter(domain => domain.id !== primaryDomain.id)
          .map(domain => ({
            sourceDomain: primaryDomain,
            targetDomain: domain,
            allowed: initialAllowedDomains.includes(domain.id),
            restrictions: [],
            version: version.current
          }));
          
        setRelationships(rels);
      } catch (err) {
        setError('Failed to load domain relationships');
        console.error('Error loading domain relationships:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRelationships();
  }, [primaryDomain, availableDomains, initialAllowedDomains, version]);
  
  // Toggle domain relationship
  const toggleRelationship = (targetDomainId: string) => {
    setRelationships(prevRelationships => 
      prevRelationships.map(rel => 
        rel.targetDomain.id === targetDomainId
          ? { ...rel, allowed: !rel.allowed }
          : rel
      )
    );
  };
  
  // Get current allowed domains
  const getCurrentAllowedDomains = (): string[] => {
    return relationships
      .filter(rel => rel.allowed)
      .map(rel => rel.targetDomain.id);
  };
  
  // Handle save
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const allowedDomains = getCurrentAllowedDomains();
      
      // Use provided callback if available
      if (onAllowedDomainsChange) {
        onAllowedDomainsChange(allowedDomains);
      }
      
      if (onSave) {
        onSave();
      } else if (crossDomain && crossDomain.syncDomainData) {
        // Use context to save cross-domain settings
        await crossDomain.syncDomainData(
          relationships.filter(rel => rel.allowed).map(rel => rel.targetDomain)
        );
      }
      
      setSuccess('Cross-domain settings saved successfully');
    } catch (err) {
      setError('Failed to save cross-domain settings');
      console.error('Error saving cross-domain settings:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Check if cross-domain operations are supported
  const isCrossDomainSupported = (): boolean => {
    return !!(crossDomain && crossDomain.validateCrossDomain);
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!isCrossDomainSupported()) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Cross-domain functionality is not supported in the current version.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Cross-Domain Management</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
            className="h-10"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Configure which domains can interact with your primary domain ({primaryDomain.name}).
          Enabling a domain allows sharing experiences and resources between domains.
        </p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Email Pattern</TableHead>
              <TableHead className="w-24">Allow</TableHead>
              <TableHead className="w-32">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relationships.map((rel) => {
              const { targetDomain, allowed } = rel;
              
              return (
                <TableRow key={targetDomain.id}>
                  <TableCell className="font-medium">{targetDomain.name}</TableCell>
                  <TableCell>{targetDomain.emailPattern}</TableCell>
                  <TableCell>
                    <Switch
                      checked={allowed}
                      onCheckedChange={() => toggleRelationship(targetDomain.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {allowed ? (
                        <>
                          <Link className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <LinkOff className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Disconnected</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            
            {relationships.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  No domains available for cross-domain operations
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CrossDomainManager;

