import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Tv, 
  Users, 
  Group,
  HeartPulse,
  Medal,
  ShoppingBag,
  Globe,
  Building2,
  Pencil,
  MapPin,
  X
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useExperience } from '@/hooks/useExperience';
import { useDomain } from '@/hooks/useDomain';
import { useRKS } from '@/hooks/useRKS';

const ExperienceStep1 = () => {
  const { state, updateStep } = useExperience();
  const { state: domainState } = useDomain();
  const { calculateRKSAllocation } = useRKS();
  
  const [selectedType, setSelectedType] = useState(state.step1?.experienceType || 'educational');
  const [capacity, setCapacity] = useState(state.step1?.capacity || '2');
  const [hostCount, setHostCount] = useState(state.step1?.hostCount || '1');
  const [country, setCountry] = useState(state.step1?.country || 'uk');
  const [city, setCity] = useState(state.step1?.city || 'oxford');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(state.step1?.experienceSetting || null);

  // Settings based on selected type
  const getTypeSettings = (type) => {
    const settingsMap = {
      'educational': [
        'Tutorial',
        'Lecture/Presentation',
        'Laboratory',
        'Seminar',
        'Classroom, 0-3 Years',
        'Classroom, 3-5 Years',
        'Classroom, 5-7 Years',
        'Classroom, 7-11 Years',
        'Classroom, 11-15 Years',
        'Classroom, 15-18 Years'
      ],
      'arts': [
        'Theatre',
        'Music',
        'Exhibition',
        'Dance',
        'Poetry Reading',
        'Film Screening'
      ],
      'community': [
        'Hustings',
        'Meeting',
        'Workshop',
        'Fundraiser',
        'Volunteer Activity'
      ],
      'sports': [
        'Coaching',
        'Training',
        'Match',
        'Tournament',
        'Class'
      ],
      'retail': [
        'Book Launch',
        'Product Demo',
        'Tasting',
        'Workshop',
        'Sale Event'
      ],
      'health': [
        'Home Care',
        'Wellness',
        'Support',
        'Therapy',
        'Consultation'
      ]
    };
    
    return settingsMap[type] || [];
  };

  const experienceTypes = [
    {
      id: 'educational',
      icon: GraduationCap,
      label: 'Educational',
      subTypes: ['Tutorial', 'Seminar', 'Lecture']
    },
    {
      id: 'arts',
      icon: Tv,
      label: 'Arts & Culture',
      subTypes: ['Theatre', 'Music', 'Exhibition']
    },
    {
      id: 'community',
      icon: Group,
      label: 'Community',
      subTypes: ['Hustings', 'Meeting', 'Workshop']
    },
    {
      id: 'sports',
      icon: Medal,
      label: 'Sports',
      subTypes: ['Coaching', 'Training', 'Match']
    },
    {
      id: 'retail',
      icon: ShoppingBag,
      label: 'High Street Retail',
      subTypes: ['Book Launch', 'Product Demo', 'Tasting']
    },
    {
      id: 'health',
      icon: HeartPulse,
      label: 'Health',
      subTypes: ['Home Care', 'Wellness', 'Support']
    }
  ];

  const capacityOptions = [1, 2, 3, 5, 7, 10, 15, 20, 30, 40, 50, 75, 100, 250, 500, 1500];

  // Calculate RKS based on selections
  const rks = calculateRKSAllocation({
    experienceType: selectedType,
    experienceSetting: selectedSetting,
    capacity: parseInt(capacity),
    hostCount: parseInt(hostCount),
    domain: domainState.currentDomain
  });

  useEffect(() => {
    // Update the step data whenever relevant values change
    updateStep('step1', {
      experienceType: selectedType,
      experienceSetting: selectedSetting,
      capacity,
      hostCount,
      country,
      city
    });
  }, [selectedType, selectedSetting, capacity, hostCount, country, city, updateStep]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedSetting(null); // Reset selected setting when type changes
    
    // Show bottom sheet for settings when a type is selected
    setIsBottomSheetOpen(true);
  };

  const handleSettingSelect = (setting) => {
    setSelectedSetting(setting);
    setIsBottomSheetOpen(false);
  };

  const handleContinue = () => {
    // Navigate to the next step
    // This would typically be done via the experience context's navigation functionality
    // For now, we'll just log that we're ready to continue
    console.log('Continuing to Step 2');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-6">Create New ROCKR Experience</h1>

      {/* ROCKRCOIN Mining Summary Block */}
      <Card className="bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="font-semibold">ROCKRCOIN (RKS) Mining</h3>
          <Badge variant="secondary">Based on Current Selection</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold">{rks.total.toLocaleString()} RKS Total</p>
              <p className="text-sm text-muted-foreground">
                {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                {selectedSetting && ` • ${selectedSetting}`} • {capacity} Attendees • {hostCount} Host
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Host (20%)</span>
                <span className="font-medium">{rks.breakdown.host.toLocaleString()} RKS</span>
              </div>
              <div className="flex justify-between">
                <span>Attendees (50%)</span>
                <span className="font-medium">{rks.breakdown.attendees.toLocaleString()} RKS</span>
              </div>
              <div className="flex justify-between">
                <span>Curator (5%)</span>
                <span className="font-medium">{rks.breakdown.curator.toLocaleString()} RKS</span>
              </div>
              <div className="flex justify-between">
                <span>Venue (10%)</span>
                <span className="font-medium">{rks.breakdown.venue.toLocaleString()} RKS</span>
              </div>
              <div className="flex justify-between">
                <span>Production (10%)</span>
                <span className="font-medium">{rks.breakdown.production.toLocaleString()} RKS</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>AI Components (5%)</span>
                <span>{rks.breakdown.ai.toLocaleString()} RKS</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Type Block */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="font-semibold">Experience Type</h3>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {experienceTypes.map((type) => (
              <div
                key={type.id}
                className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                  selectedType === type.id 
                    ? 'border-primary bg-blue-50' 
                    : 'hover:border-primary'
                }`}
                onClick={() => handleTypeSelect(type.id)}
              >
                <type.icon className="h-8 w-8 mb-2" />
                <span className="text-sm text-center font-medium">
                  {type.label}
                  {type.id === selectedType && selectedSetting && (
                    <span className="block text-xs text-blue-600">
                      {selectedSetting}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Using Dialog component as bottom sheet */}
      <Dialog open={isBottomSheetOpen} onOpenChange={setIsBottomSheetOpen}>
        <DialogContent className="fixed bottom-0 left-0 right-0 p-0 rounded-t-xl sm:rounded-xl">
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 my-4" />
          
          <DialogHeader className="px-6">
            <DialogTitle>Select {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Setting</DialogTitle>
            <DialogDescription>
              Choose the specific type of {selectedType} experience
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {getTypeSettings(selectedType).map((setting) => (
              <button
                key={setting}
                className="w-full rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50"
                onClick={() => handleSettingSelect(setting)}
              >
                {setting}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Capacity Block */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="font-semibold">Target Attendance</h3>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Select value={capacity} onValueChange={setCapacity}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Common Sizes</SelectLabel>
                {capacityOptions.map((cap) => (
                  <SelectItem key={cap} value={cap.toString()}>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{cap} {cap === 1 ? 'Attendee' : 'Attendees'}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Host Count Block */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="font-semibold">Number of Hosts</h3>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Select value={hostCount} onValueChange={setHostCount}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[1, 2, 3, 4, 5].map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{count} {count === 1 ? 'Host' : 'Hosts'}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Country Block */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="font-semibold">Country</h3>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>European Union</SelectLabel>
                {['France', 'Germany', 'Italy', 'Spain', 'Netherlands'].map((c) => (
                  <SelectItem key={c.toLowerCase()} value={c.toLowerCase()}>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>{c}</span>
                    </div>
                  </SelectItem>
                ))}
                <SelectLabel>Other Regions</SelectLabel>
                {[
                  { code: 'uk', name: 'United Kingdom' },
                  { code: 'usa', name: 'United States' },
                  { code: 'aus', name: 'Australia' }
                ].map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* City Block */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <h3 className="font-semibold">City</h3>
            <Badge variant="secondary">
              {country === 'uk' ? 'United Kingdom' : country.toUpperCase()} Selected
            </Badge>
          </div>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>University Cities</SelectLabel>
                {['Oxford', 'Cambridge', 'London', 'Edinburgh', 'Manchester'].map((c) => (
                  <SelectItem key={c.toLowerCase()} value={c.toLowerCase()}>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{c}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <Button 
        className="w-full h-10"
        onClick={handleContinue}
      >
        Continue to Experience Details
      </Button>
    </div>
  );
};

export default ExperienceStep1;