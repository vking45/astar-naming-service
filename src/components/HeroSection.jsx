import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [search, setSearch] = useState('');
  const [typedText, setTypedText] = useState('');
  const headingText = 'Kintsugi Naming Service';

  useEffect(() => {
    let typingTimer;
    if (typedText.length < headingText.length) {
      typingTimer = setTimeout(() => {
        setTypedText(headingText.slice(0, typedText.length + 1));
      }, 150);
    }
    return () => clearTimeout(typingTimer);
  }, [typedText]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Validation for search
    const isValidLength = search.length <= 28;
    let sliced = search.slice(0, search.length-5);
    console.log(sliced);
    const isValidChar = /^[a-zA-Z0-9-]*$/.test(sliced);
    const isValidSuffix = search.endsWith(".kbtc") || search.endsWith(".kint");
  
    if (isValidLength && isValidChar && isValidSuffix) {
      console.log('Search:', search);
      window.location.href = `/home/${search}`;
    } else {
      alert('Invalid input name!');
      // You might want to add more specific error messages or handle the error differently
    }
  };
  

  return (
    <div className="bg-gray-800 text-white py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          {/* Heading */}
          <h1 className="text-6xl font-bold mb-4 bebas-neue">
            {typedText}
          </h1>
          {/* Description */}
          <p className="text-lg mb-8 text-center poppins">
            Decentralized domain names for your blockchain project. Secure,
            censorship-resistant, and easily accessible.
          </p>
          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-3/4 md:w-1/2 mb-8 bg-gray-700 shadow-lg rounded-lg overflow-hidden"
          >
            <input
              type="text"
              placeholder="Search for your domain"
              className="w-full px-4 py-2 focus:outline-none poppins transition duration-300 ease-in-out focus:bg-gray-100 text-black bg-gray-50"
              value={search}
              onChange={handleSearchChange}
            />
            <button className="bg-blue-500 text-white px-6 py-2 rounded-r-lg poppins transition duration-300 ease-in-out hover:bg-blue-600">
              Search
            </button>
          </form>
          {/* Domain suggestions */}
          <div className="flex space-x-4 text-center mb-8 font-poppins">
            <span>All names should end with</span>
            <span>.kbtc</span>
            <span className="italic">/</span>
            <span>.kint</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
