// src/components/ui/dialog.tsx
import React, { useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ 
  open, 
  onOpenChange, 
  children 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  
  return (
    <RadixDialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      {children}
    </RadixDialog.Root>
  );
};

export interface DialogTriggerProps {
  children: React.ReactNode;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ 
  children 
}) => {
  return <RadixDialog.Trigger asChild>{children}</RadixDialog.Trigger>;
};

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      <RadixDialog.Content 
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg ${className}`}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
};

export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-left ${className}`}>
      {children}
    </div>
  );
};

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <RadixDialog.Title className={`text-lg font-semibold leading-none ${className}`}>
      {children}
    </RadixDialog.Title>
  );
};

export interface DialogCloseProps {
  children: React.ReactNode;
}

export const DialogClose: React.FC<DialogCloseProps> = ({ 
  children 
}) => {
  return <RadixDialog.Close asChild>{children}</RadixDialog.Close>;
};