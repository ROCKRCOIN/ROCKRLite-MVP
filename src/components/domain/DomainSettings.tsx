// src/components/domain/DomainSettings.tsx

import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDomain } from '@/hooks/useDomain';
import { useEvolution } from '@/hooks/useEvolution';
import { DomainConfig } from '@/interfaces/domain/types';
import { DomainSettingsProps, SettingsSection, SettingsField } from '@/interfaces/domain/domain-component-types';

/**
 * DomainSettings component provides an interface for configuring domain-specific settings.
 * It allows editing RKS/UIMA settings, cross-domain permissions, and other domain configuration.
 * 
 * This component is evolution-ready and supports cross-domain compatibility.
 */
const DomainSettings: React.FC<DomainSettingsProps> = ({
  domain,
  onSave,
  onCancel,
  className = ''
}) => {
  const { operations, state } = useDomain();
  const { features, versions } = useEvolution();
  
  const [config, setConfig] = useState<Partial<DomainConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Load domain configuration
  useEffect(() => {
    const loadDomainConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get domain configuration from context
        const domainConfig = operations.getDomainConfig 
          ? operations.getDomainConfig(domain.id) 
          : null;
          
        if (domainConfig) {
          setConfig(domainConfig);
        } else {
          // Fallback to default configuration
          setConfig({
            id: domain.id,
            name: domain.name,
            emailPattern: domain.emailPattern || `@${domain.id}`,
            features: {},
            restrictions: [],
            rks: {
              weeklyUimaCredit: 18000,
              targetSeatPrice: 3000,
              roleAllocations: []
            }
          });
        }
      } catch (err) {
        setError('Failed to load domain configuration');
        console.error('Error loading domain configuration:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDomainConfig();
  }, [domain, operations]);
  
  // Handle field changes
  const handleChange = (field: string, value: any) => {
    setConfig(prev => {
      const updatedConfig = { ...prev };
      
      // Handle nested fields with dot notation (e.g. "rks.weeklyUimaCredit")
      if (field.includes('.')) {
        const parts = field.split('.');
        const parent = parts[0];
        const child = parts[1];
        
        updatedConfig[parent] = {
          ...updatedConfig[parent],
          [child]: value
        };
      } else {
        updatedConfig[field] = value;
      }
      
      return updatedConfig;
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // If onSave callback is provided, use it
      if (onSave) {
        onSave(config);
        setSuccess('Domain settings saved successfully');
        return;
      }
      
      // Otherwise, use context to update domain settings
      if (operations.updateSettings) {
        await operations.updateSettings(domain.id, config);
        setSuccess('Domain settings saved successfully');
      } else {
        throw new Error('Update operation not available');
      }
    } catch (err) {
      setError('Failed to save domain settings');
      console.error('Error saving domain settings:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Define settings sections and fields
  const settingsSections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Configure basic domain settings',
      fields: [
        {
          id: 'name',
          label: 'Domain Name',
          type: 'text',
          value: config.name || '',
          onChange: (value) => handleChange('name', value)
        },
        {
          id: 'emailPattern',
          label: 'Email Pattern',
          type: 'text',
          value: config.emailPattern || '',
          onChange: (value) => handleChange('emailPattern', value)
        }
      ]
    },
    {
      id: 'rks',
      title: 'RKS/UIMA Settings',
      description: 'Configure domain-specific RKS settings',
      fields: [
        {
          id: 'rks.weeklyUimaCredit',
          label: 'Weekly UIMA Credit',
          type: 'number',
          value: config.rks?.weeklyUimaCredit || 18000,
          onChange: (value) => handleChange('rks.weeklyUimaCredit', parseInt(value))
        },
        {
          id: 'rks.targetSeatPrice',
          label: 'Target Seat Price',
          type: 'number',
          value: config.rks?.targetSeatPrice || 3000,
          onChange: (value) => handleChange('rks.targetSeatPrice', parseInt(value))
        }
      ]
    },
    {
      id: 'cross-domain',
      title: 'Cross-Domain Settings',
      description: 'Configure how this domain interacts with others',
      fields: [
        {
          id: 'crossDomain.allowSharing',
          label: 'Allow Cross-Domain Sharing',
          type: 'toggle',
          value: config.crossDomain?.allowSharing || false,
          onChange: (value) => handleChange('crossDomain.allowSharing', value)
        },
        {
          id: 'crossDomain.experienceVisibility',
          label: 'Experience Visibility',
          type: 'select',
          value: config.crossDomain?.experienceVisibility || 'private',
          options: [
            { label: 'Private', value: 'private' },
            { label: 'Public', value: 'public' },
            { label: 'Selective', value: 'selective' }
          ],
          onChange: (value) => handleChange('crossDomain.experienceVisibility', value)
        }
      ]
    }
  ];
  
  // Add evolution section if feature is enabled
  if (features.isEnabled && features.isEnabled('domain-evolution')) {
    settingsSections.push({
      id: 'evolution',
      title: 'Evolution Settings',
      description: 'Configure domain evolution settings',
      fields: [
        {
          id: 'evolution.version',
          label: 'Version',
          type: 'select',
          value: config.evolution?.version?.toString() || versions.current.toString(),
          options: versions.supported.map(v => ({ 
            label: `v${v.major}.${v.minor}.${v.patch}`, 
            value: `${v.major}.${v.minor}.${v.patch}` 
          })),
          onChange: (value) => handleChange('evolution.version', value)
        },
        {
          id: 'evolution.autoUpdate',
          label: 'Auto-Update',
          type: 'toggle',
          value: config.evolution?.autoUpdate || false,
          onChange: (value) => handleChange('evolution.autoUpdate', value)
        }
      ]
    });
  }
  
  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Domain Settings</h2>
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
            type="submit"
            size="sm"
            onClick={handleSubmit}
            disabled={isSaving}
            className="h-10"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Settings
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
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {settingsSections.map((section) => (
          <div key={section.id} className="space-y-4">
            <div>
              <h3 className="text-md font-medium">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-gray-500">{section.description}</p>
              )}
            </div>
            
            <div className="grid gap-4">
              {section.fields.map((field) => (
                <div key={field.id} className="grid gap-2">
                  <label className="text-sm font-medium">{field.label}</label>
                  
                  {field.type === 'text' && (
                    <Input
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-10"
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-10"
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {field.type === 'toggle' && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm text-gray-600">
                        {field.value ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  )}
                  
                  {field.type === 'checkbox' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm text-gray-600">
                        {field.value ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </form>
    </div>
  );
};

export default DomainSettings;