import React from 'react';
import LoadingComponent from "@/components/LoadingComponent";

const LoadingPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        fontSize: '18px',
      }}
    >
      <LoadingComponent remSize={8} />
    </div>
  );
};

export default LoadingPage;
