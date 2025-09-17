import React from 'react';
import { Button } from '@/components/ui/button';

const TestShadcn: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">shadcn/ui Test</h1>
      <div className="flex gap-4">
        <Button>Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="destructive">Destructive Button</Button>
        <Button variant="outline">Outline Button</Button>
      </div>
    </div>
  );
};

export default TestShadcn;