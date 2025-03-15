import React, { useState } from 'react';
import { Link, AlertCircle, X, Plus } from 'lucide-react';
import { useExperience } from '@/hooks/useExperience';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Resource {
  type: 'url' | 'file';
  name: string;
  value: string;
}

// These would be imported from external files in a real implementation
// For now we're including them directly as per the specification
const SUBJECTS = {
  'Economics': ['Monetary Policy'],
  'Physics': ['Quantum Mechanics']
};

const GENRES = [
  'Academic', 'Exercise', 'Teaching', 'Drama', 'Comedy',
  'Tragedy', 'Crime', 'Thriller', 'Documentary', 'Competition/Quiz'
];

const ExperienceDetailsStep = () => {
  const { state, updateStep } = useExperience();
  const [showSubjectSheet, setShowSubjectSheet] = useState(false);
  const [showGenreSheet, setShowGenreSheet] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newResourceUrl, setNewResourceUrl] = useState('');
  
  // Form state
  const [selectedMainSubject, setSelectedMainSubject] = useState<string>('');
  
  const handleInputChange = (field: string, value: any) => {
    updateStep('step2', { ...state.step2, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };
  
  const handleResourceAdd = () => {
    if (!newResourceUrl) return;
    try {
      new URL(newResourceUrl);
      const newResources = [...(state.step2?.resources || []), {
        type: 'url',
        name: newResourceUrl,
        value: newResourceUrl
      }];
      updateStep('step2', { ...state.step2, resources: newResources });
      setNewResourceUrl('');
    } catch (e) {
      setErrors({ ...errors, resourceUrl: 'Please enter a valid URL' });
    }
  };
  
  const handleResourceRemove = (index: number) => {
    const newResources = state.step2?.resources.filter((_, i) => i !== index);
    updateStep('step2', { ...state.step2, resources: newResources });
  };
  
  // Bottom Sheet Content Components
  const SubjectSelector = () => (
    <div className="space-y-4 p-4">
      {Object.entries(SUBJECTS).map(([subject, levels]) => (
        <div key={subject} className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-between h-10"
            onClick={() => {
              setSelectedMainSubject(subject);
              if (levels.length === 1) {
                handleInputChange('subject', subject);
                handleInputChange('subjectLevel', levels[0]);
                setShowSubjectSheet(false);
              }
            }}
          >
            {subject}
          </Button>
          {selectedMainSubject === subject && levels.length > 1 && (
            <div className="pl-4 space-y-2">
              {levels.map(level => (
                <Button
                  key={level}
                  variant="ghost"
                  className="w-full text-left h-10"
                  onClick={() => {
                    handleInputChange('subject', subject);
                    handleInputChange('subjectLevel', level);
                    setShowSubjectSheet(false);
                  }}
                >
                  {level}
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
  
  const GenreSelector = () => (
    <div className="space-y-2 p-4">
      {GENRES.map(genre => (
        <Button
          key={genre}
          variant="outline"
          className="w-full justify-between h-10"
          onClick={() => {
            handleInputChange('genre', genre);
            setShowGenreSheet(false);
          }}
        >
          {genre}
        </Button>
      ))}
    </div>
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Experience Details</CardTitle>
        <CardDescription>Enter the basic details for your new experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Step 1 Selections */}
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
          <Badge variant="secondary">
            {state.step1?.experienceType || 'Educational'}
          </Badge>
          <Badge variant="secondary">
            {state.step1?.experienceSetting || 'Tutorial'}
          </Badge>
          <Badge variant="secondary">
            {state.step1?.capacity} Attendees
          </Badge>
        </div>
        
        {/* Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Experience Title *
            </label>
            <Input
              value={state.step2?.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
              placeholder="Enter a title for your experience"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Description *
            </label>
            <Textarea
              value={state.step2?.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
              placeholder="Describe your experience"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>
        </div>
        
        {/* Subject Selection */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Subject *
          </label>
          <Button
            variant="outline"
            className="w-full justify-between h-10"
            onClick={() => setShowSubjectSheet(true)}
          >
            {state.step2?.subject ? (
              <span>{state.step2.subject} - {state.step2.subjectLevel}</span>
            ) : (
              "Select Subject"
            )}
          </Button>
        </div>
        
        {/* Genre Selection */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Genre *
          </label>
          <Button
            variant="outline"
            className="w-full justify-between h-10"
            onClick={() => setShowGenreSheet(true)}
          >
            {state.step2?.genre || "Select Genre"}
          </Button>
        </div>
        
        {/* Experience Resources */}
        <div className="space-y-4">
          <label className="text-sm font-medium mb-1.5 block">
            Experience Resources
          </label>
          <div className="flex gap-2">
            <Input
              type="url"
              value={newResourceUrl}
              onChange={(e) => setNewResourceUrl(e.target.value)}
              placeholder="Add a resource URL"
              className={errors.resourceUrl ? 'border-red-500' : ''}
            />
            <Button
              variant="outline"
              onClick={handleResourceAdd}
              className="h-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.resourceUrl && (
            <p className="text-sm text-red-500">{errors.resourceUrl}</p>
          )}
          {state.step2?.resources?.length > 0 && (
            <div className="space-y-2">
              {state.step2.resources.map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <a
                    href={resource.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {resource.name}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResourceRemove(index)}
                    className="h-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Bottom Sheets */}
      <Dialog open={showSubjectSheet} onOpenChange={setShowSubjectSheet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Subject</DialogTitle>
          </DialogHeader>
          <SubjectSelector />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showGenreSheet} onOpenChange={setShowGenreSheet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Genre</DialogTitle>
          </DialogHeader>
          <GenreSelector />
        </DialogContent>
      </Dialog>
      
      {/* Navigation Buttons */}
      <CardFooter className="flex justify-between space-x-4 pt-6">
        <Button 
          variant="outline"
          className="h-10 w-full"
          onClick={() => {
            // Navigate back to step 1
            // This would typically be done via the experience context's navigation functionality
            console.log('Navigating back to Step 1');
          }}
        >
          Back
        </Button>
        <Button 
          className="h-10 w-full"
          onClick={() => {
            // Navigate to the next step (step 3)
            // This would typically be done via the experience context's navigation functionality
            console.log('Continuing to Step 3');
          }}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExperienceDetailsStep;