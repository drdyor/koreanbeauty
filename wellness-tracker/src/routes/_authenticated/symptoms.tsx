import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SymptomsDashboard } from '@/components/pages/symptoms';

export const Route = createFileRoute('/_authenticated/symptoms')({
  component: SymptomsPage,
});

function SymptomsPage() {
  return <SymptomsDashboard />;
}