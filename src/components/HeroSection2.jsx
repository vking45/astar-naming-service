import React from 'react';
import './HeroSection.css';
import image from '../image.png';

const HeroSection = () => {
  return (
    <div className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="w-1/2">
            <h1 className="text-5xl font-bold mb-4 mx-6 bebas-neue text-center">
              A name to login in{' '}
              <span className="text-blue-500">WEB3</span>
            </h1>
            <p className="text-lg poppins m-6 text-center">
              Kintsugi Naming Service enables you to claim a domain name for
              your blockchain identity, which can be used for secure and
              seamless authentication across the decentralized web.
            </p>
          </div>
          <div className="w-1/2">
            <img
              src={image} // Replace with the desired image URL
              alt="Hero Illustration"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
