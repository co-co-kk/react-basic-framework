import { useState } from 'react';
import Dnd from '@/components/Dnd';
// import EnhancedDnd from '@/components/Dnd/EnhancedDnd';
import DragLayout from '@/components/Dnd/DragLayout';


export default function About() {

  return (
    <div className="h-full w-full flex flex-col">
          {/* <Dnd></Dnd> */}
          {/* <EnhancedDnd></EnhancedDnd> */}
          <DragLayout></DragLayout>
    </div>
  );
}
