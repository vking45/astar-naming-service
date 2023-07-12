import React from 'react';

const HowItWorks = () => {
  return (
    <div className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8 text-center font-mono transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          How it Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105">
            <div className="mb-6">
              <i className="fas fa-search text-6xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 font-mono">Search</h3>
            <p className="font-mono">
              Find and choose the perfect domain name for your blockchain
              project using our search tool.
            </p>
          </div>
          {/* Step 2 */}
          <div className="text-center transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105">
            <div className="mb-6">
              <i className="fas fa-cart-plus text-6xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 font-mono">Buy</h3>
            <p className="font-mono">
              Purchase the domain using your preferred cryptocurrency or
              payment method.
            </p>
          </div>
          {/* Step 3 */}
          <div className="text-center transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105">
            <div className="mb-6">
              <i className="fas fa-cogs text-6xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 font-mono">Setup</h3>
            <p className="font-mono">
              Set up your domain to work with your blockchain project using our
              easy-to-follow guides and tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
