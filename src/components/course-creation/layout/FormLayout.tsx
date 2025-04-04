
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FormLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Reusable layout component for forms in the course creation flow
 */
export const FormLayout = ({ title, description, children }: FormLayoutProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
