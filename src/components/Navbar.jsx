import React, { useState } from "react";
import { useEffect } from "react";
import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import { WsProvider, ApiPromise } from "@polkadot/api";

const Navbar = () => {
    
    const [isOpen, setIsOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [account, setAccount] = useState('');
    const [connected, setConnected] = useState(false);
  
    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };

    const onConnect = async (_api) => {
      const extensions = await web3Enable('KNS');
      if(extensions) {
        _api.setSigner(extensions[0].signer)
        const injectedAccounts = await web3Accounts()
        console.log(injectedAccounts[0].address);
        setAccount(injectedAccounts[0].address);
        setConnected(true);
      }
    }
  
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100) {
        setShowSearch(true);
      } else {
        setShowSearch(false);
      }
    };

    useEffect(() => {
      (async () => {
        const provider = new WsProvider('wss://rpc.shibuya.astar.network');
        let temp = new ApiPromise({ provider });
        await temp.isReady;
        await onConnect(temp);
      })();
    }, []);
  
    useEffect(() => {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="text-xl font-bold text-white font-mono transition duration-300 ease-in-out hover:text-blue-500">
          KNS
        </a>

        {/* Links and Button */}
        <div className="flex items-center">
          {/* Links */}
          <div className="hidden md:flex items-center space-x-4 font-mono">

            {/* Dropdown */}
            {/* Search bar */}
{showSearch && (
  <form className="hidden md:flex w-1/3">
    <input
      type="text"
      placeholder="Search for your domain"
      className="w-full px-4 py-2 rounded-l-lg focus:outline-none bg-gray-900 text-white"
    />
    <button className="bg-blue-500 text-white px-4 py-2 rounded-r-lg font-mono transition duration-300 ease-in-out hover:bg-blue-600">
      Search
    </button>
  </form>
)}

          </div>

          {/* Button */}
          <button onClick={ connected ? () => {} : onConnect} className="rounded-md bg-blue-500 text-white px-4 py-2 font-mono transition duration-300 ease-in-out hover:bg-blue-600">
            { connected ? account : "Connect"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
