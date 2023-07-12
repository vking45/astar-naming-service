import React, { useState, useEffect } from 'react';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { web3Accounts } from '@polkadot/extension-dapp';

const FixedSearchBar = () => {
  const [address, setAddress] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const provider = new WsProvider('wss://rpc.shibuya.astar.network');
      let temp = new ApiPromise({ provider });
      await temp.isReady;
      const injectedAccounts = await web3Accounts()
      setAddress(injectedAccounts[0].address);
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="fixed w-full bg-gray-800 p-4 z-50">
      <div className="container mx-auto">
        <div className="flex items-between">
          {/* Logo */}
          <div className="flex-shrink-0 mr-16">
            <img
              src="https://via.placeholder.com/100x30"
              alt="Logo"
              className="w-32"
            />
          </div>

          {/* Button on the right side */}
          <button className="ml-16 px-6 py-3 poppins bg-blue-500 text-white font-bold rounded-lg transition duration-300 ease-in-out hover:bg-blue-600" disabled>
            { loaded ? address : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixedSearchBar;
