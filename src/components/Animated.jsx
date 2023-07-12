import React from 'react';
import ParticlesBg from 'particles-bg';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 animate-gradient-rotation"></div>
      <ParticlesBg type="cobweb" color="#ffffff" num={30} bg={true} />
    </div>
  );
};

export default AnimatedBackground;