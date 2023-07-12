import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <div className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="w-1/2">
            <img
              src="https://storage.googleapis.com/unstoppable-client-assets/images/landing/new/use_case_2.png" // Replace with the desired image URL
              alt="Hero Illustration"
              className="w-full h-auto"
            />
          </div>
          <div className="w-1/2">
            <h1 className="text-5xl font-bold mb-4 mx-6 bebas-neue text-center">
              A name for your{' '}
              <span className="text-blue-500">Web3</span> website
            </h1>
            <p className="text-lg poppins m-6 text-center">
              Polkadot Naming Service enables you to claim a domain name for
              your blockchain identity, which can be used for secure and
              seamless authentication across the decentralized web.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
