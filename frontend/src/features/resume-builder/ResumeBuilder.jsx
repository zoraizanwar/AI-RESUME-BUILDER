import React from 'react';
import { ResumeBuilderProvider } from './ResumeBuilderContext';
import ResumeEditor from './ResumeEditor';

export default function ResumeBuilder() {
  return (
    <ResumeBuilderProvider>
      <ResumeEditor />
    </ResumeBuilderProvider>
  );
}
