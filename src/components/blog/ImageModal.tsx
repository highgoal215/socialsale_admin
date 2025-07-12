import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

interface ImageModalProps {
  imageUrl: string;
  altText: string;
  children: React.ReactNode;
}

export const ImageModal: React.FC<ImageModalProps> = ({ 
  imageUrl, 
  altText, 
  children 
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-0 bg-transparent">
        <DialogTitle className="sr-only">
          {altText}
        </DialogTitle>
        <DialogDescription className="sr-only">
          View full size image: {altText}
        </DialogDescription>
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}; 