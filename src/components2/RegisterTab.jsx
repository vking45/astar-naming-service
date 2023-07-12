import React, { useState, useEffect } from 'react';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import ABI from '../artifacts/naming_service.json';
import { BN } from '@polkadot/util/bn'
import { Abi, ContractPromise } from '@polkadot/api-contract'

const address = 'bD5Bj1czhW6tsGaiAbzBbE8vh3BVUzhahPRGC6YeEPvfZzb';
const decimals = new BN('100000000000000')
const RegisterTab = ({name}) => {
  const [duration, setDuration] = useState(1);
  const [image, setImage] = useState("ipfs://");
  const [api, setApi] = useState();
  const [apiReady, setApiReady] = useState(false);
  const [signer, setSigner] = useState();
  const [contract, setContract] = useState();
  const [account, setAccount] = useState();

  const getGasLimit = (api) =>
  api.registry.createType(
    'WeightV2',
    api.consts.system.blockWeights['maxBlock']
  )

  const onRegister = async (_api, _apiReady, _account, _contract) => {
    if (!_api || !_apiReady || !_account || !_contract) {
      return
    }
    
    let suf = 0;
    if(name.endsWith(".kbtc")){
      suf = new BN(0);
    } else {
      suf = new BN(1);
    }

    const gasLimit = getGasLimit(_api)

    const { gasRequired, result, output } = await _contract.query.registerDomain(
      _account.address,
      {
        gasLimit : gasLimit,
        storageDepositLimit: null,
        value: (new BN(duration)).mul(decimals)
      },
      name.slice(0, name.length-5), suf, new BN(duration), image
    )

    if (result.isErr) {
      let error = ''
      if (result.asErr.isModule) {
        const dispatchError = api.registry.findMetaError(result.asErr.asModule)
        console.log('error', dispatchError.name)
        error = dispatchError.docs.length ? dispatchError.docs.concat().toString() : dispatchError.name
      } else {
        error = result.asErr.toString()
      }
      return
    }

    if (result.isOk) {
      const flags = result.asOk.flags.toHuman()
      if (flags.includes('Revert')) {
        console.log('Revert')
        console.log(result.toHuman())
        const type = contract.abi.messages[5].returnType
        const typeName = type?.lookupName || type?.type || ''
        const error = contract.abi.registry.createTypeUnsafe(typeName, [result.asOk.data]).toHuman()
        console.log(error);
      }
    }    

    console.log( name.slice(0, name.length-5), suf, new BN(duration), image);
    await contract.tx
    .registerDomain({
      gasLimit: gasRequired,
      storageDepositLimit: null,
      value: (new BN(duration)).mul(decimals),
    }, name.slice(0, name.length-5), suf, new BN(duration), image)
    .signAndSend(account.address, (res) => {
      if (res.status.isInBlock) {
        console.log('in a block')
      }
      if (res.status.isFinalized) {
        console.log('finalized')
        alert('Domain Name Successfully Registered!')
      }
    })

    return [gasRequired.toString(), result.toHuman().Ok, output?.toHuman().Ok]
  }

  const connectWalletHandler = async (_api, _apiReady) => {
    if (!_api || !_apiReady) {
      return
    }
    const extensions = await web3Enable('KNS')
    /* check if wallet is installed */
    if (extensions.length === 0) {
      return
    }
    // set the first wallet as the signer (we assume there is only one wallet)
    _api.setSigner(extensions[0].signer)
    const injectedAccounts = await web3Accounts()
    const abi = new Abi(ABI, _api.registry.getChainProperties())
    const contract = new ContractPromise(_api, abi, address)
    setContract(contract)
    setAccount(injectedAccounts[0])
    console.log(contract);
    return [injectedAccounts[0], contract]
  }

  const handleDurationIncrease = () => {
    setDuration(prevDuration => prevDuration + 1);
  };

  const handleDurationDecrease = () => {
    setDuration(prevDuration => (prevDuration > 1 ? prevDuration - 1 : prevDuration));
  };

  const handleRegister = async () => {
    const res2 = await onRegister(api, apiReady, account, contract);
    console.log(res2);
  } 

  useEffect(() => {
    (async () => {
      const provider = new WsProvider('wss://rpc.shibuya.astar.network');
      let temp = new ApiPromise({ provider });
      setApi(temp);
      await temp.isReady;
      setApiReady(true);
      const res = await connectWalletHandler(temp, true);
      console.log(res);
    })();
  }, []);

  return (
    <div className="flex flex-col space-y-5 bg-gray-900 p-4 rounded-lg">
      <div className="relative">
        <input
          type="number"
          className="block w-full px-4 py-3 rounded-lg bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-3xl text-gray-100 placeholder-transparent placeholder-opacity-50"
          placeholder="Duration"
          value={duration}
          onChange={event => setDuration(Number(event.target.value))}
          min={1}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            type="button"
            className="inline-flex justify-center items-center w-10 h-10 text-gray-400 hover:text-gray-500"
            onClick={handleDurationIncrease}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>

          </button>
          <button
            type="button"
            className="inline-flex justify-center items-center w-10 h-10 text-gray-400 hover:text-gray-500"
            onClick={handleDurationDecrease}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>

          </button>
          
        </div>
        
      </div>
      <div className="text-gray-400 text-sm">
        <p>Minimum duration: 1 day</p>
      </div>
      <div className="relative">
        <input
          type="number"
          className="block w-full px-4 py-3 rounded-lg bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-3xl text-gray-100 placeholder-transparent placeholder-opacity-50"
          placeholder="Amount"
          value={duration * 0.0000010}
          readOnly
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <span className="text-lg font-medium text-gray-500"></span>
        </div>
      </div>
      <div className="text-gray-400 text-sm">
        <p>Price Payable</p>
      </div>
      <div className="relative">
        <input
          type="text"
          className="block w-full px-4 py-3 rounded-lg bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-
          3xl text-gray-100 placeholder-transparent placeholder-opacity-50"
          placeholder="IPFS Image Link"
          value={image}
          onChange={event => setImage(event.target.value)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <span className="text-lg font-medium text-gray-500"></span>
        </div>
      </div>
      <div className="text-gray-400 text-sm">
        <p>Paste you IPFS Link</p>
      </div>
      <div className='block text-center'>
      <button onClick={handleRegister} type="button" class=" text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Register</button>
      </div>
    </div>
  );
};

export default RegisterTab;
