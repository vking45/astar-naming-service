import React, { useState, useEffect } from 'react';
import { FiCopy } from 'react-icons/fi';
import { Abi, ContractPromise } from '@polkadot/api-contract'
import ABI from '../artifacts/naming_service.json';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util/bn'


const address = 'bD5Bj1czhW6tsGaiAbzBbE8vh3BVUzhahPRGC6YeEPvfZzb';

const AuctionTab = ({name}) => {
  const domain={name: 'example1.eth', currentBid: 500, wallet: '0xAbcD1234eFgh5678IjKl9mN0PQrStu12' };

  const [loaded, setLoaded] = useState(false);
  const [showAuctionForm, setShowAuctionForm] = useState(false);
  const [listed, setListed] = useState(false);
  const [contract, setContract] = useState();
  const [account, setAccount] = useState();
  const [api, setApi] = useState();
  const [auction, setAuction] = useState({buyoutPrice : "", endTime : "", highestBid : "", highestBidder : "", seller : "", startingBid : "", tickPrice : ""})

  // Auction Fields 
  const [starting, setStarting] = useState(0);
  const [tick, setTick] = useState(0);
  const [buyout, setBuyout] = useState(0);
  const [endTime, setEndTime] = useState(0);
  

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
    if (injectedAccounts.length > 0) {
      setAccount(injectedAccounts[0]);
    }
    const abi = new Abi(ABI, _api.registry.getChainProperties())
    const contract = new ContractPromise(_api, abi, address)
    setContract(contract)
    return [api, _apiReady, injectedAccounts[0], contract]
  }

  const getGasLimit = (api) =>
  api.registry.createType(
    'WeightV2',
    api.consts.system.blockWeights['maxBlock']
  )

  const getAuctionInfo = async (_api, _apiReady, _account, _contract) => {
    if (!_api || !_apiReady || !_account || !_contract) {
      return
    }

    const gasLimit = getGasLimit(_api)

    const { gasRequired, result, output } = await _contract.query.getAuctionInfo(
      _account.address,
      {
        gasLimit,
      },
      name
    )

    if (result.isErr) {
      return
    }

    return [gasRequired.toString(), result.toHuman().Ok, output?.toHuman().Ok]
  }

  const handleBuyout = async () => {
    setLoaded(false);

    if (!api || !account || !contract) {
      return
    }

    const gasLimit = getGasLimit(api)

    const { gasRequired, result, output } = await contract.query.bid(
      account.address,
      {
        gasLimit : gasLimit,
        storageDepositLimit: null,
        value: new BN(auction.buyoutPrice.replaceAll(',',''))
      },
      name,
    )
    console.log(gasRequired.toString(), result.toHuman().Ok, output?.toHuman().Ok)
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
    await contract.tx
    .bid({
      gasLimit: gasRequired,
      storageDepositLimit: null,
      value: new BN(auction.buyoutPrice.replaceAll(',',''))
    },name)
    .signAndSend(account.address, (res) => {
      if (res.status.isInBlock) {
        console.log('in a block')
      }
      if (res.status.isFinalized) {
        console.log('finalized')
        alert('Buyout Successfull!')
        setLoaded(true);
      }
    })
  }

  const handleFinalize = async () => {
    setLoaded(false);

    if (!api || !account || !contract) {
      return
    }

    const gasLimit = getGasLimit(api)

    const { gasRequired, result, output } = await contract.query.finalizeAuction(
      account.address,
      {
        gasLimit : gasLimit,
        storageDepositLimit: null,
        value: new BN(0)
      },
      name,
    )
    console.log(gasRequired.toString(), result.toHuman().Ok, output?.toHuman().Ok)
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
    await contract.tx
    .finalizeAuction({
      gasLimit: gasRequired,
      storageDepositLimit: null,
      value: new BN(0)
    },name)
    .signAndSend(account.address, (res) => {
      if (res.status.isInBlock) {
        console.log('in a block')
      }
      if (res.status.isFinalized) {
        console.log('finalized')
        alert('Auction Finalized!')
        setLoaded(true);
      }
    })
  }

  const handlePlaceBid = async () => {
    setLoaded(false);

    if (!api || !account || !contract) {
      return
    }

    const gasLimit = getGasLimit(api)

    const { gasRequired, result, output } = await contract.query.bid(
      account.address,
      {
        gasLimit : gasLimit,
        storageDepositLimit: null,
        value: new BN(parseInt(auction.highestBid.replaceAll(',','')) + parseInt(auction.tickPrice.replaceAll(',','')))
      },
      name,
    )
    console.log(gasRequired.toString(), result.toHuman().Ok, output?.toHuman().Ok)
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
    await contract.tx
    .bid({
      gasLimit: gasRequired,
      storageDepositLimit: null,
      value: new BN(parseInt(auction.highestBid.replaceAll(',','')) + parseInt(auction.tickPrice.replaceAll(',','')))
    },name)
    .signAndSend(account.address, (res) => {
      if (res.status.isInBlock) {
        console.log('in a block')
      }
      if (res.status.isFinalized) {
        console.log('finalized')
        alert('Bid Placed Successfully!')
        setLoaded(true);
      }
    })
  }

  const handleGenerateNewAuction = () => {
    // Toggle the visibility of the auction form
    setShowAuctionForm(!showAuctionForm);
  };

  const onCreate = async () => {

    setLoaded(false);

    if (!api || !account || !contract) {
      return
    }

    const gasLimit = getGasLimit(api)

    const { gasRequired, result, output } = await contract.query.createAuction(
      account.address,
      {
        gasLimit : gasLimit,
        storageDepositLimit: null,
        value: new BN(0)
      },
      name, new BN(endTime * 31536000), api.registry.createType('Balance', starting), api.registry.createType('Balance', tick), api.registry.createType('Balance', buyout)
    )
    console.log(gasRequired.toString(), result.toHuman().Ok, output?.toHuman().Ok)
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
    await contract.tx
    .createAuction({
      gasLimit: gasRequired,
      storageDepositLimit: null,
      value: new BN(0)
    },name, new BN(endTime * 31536000), api.registry.createType('Balance',starting), api.registry.createType('Balance',tick), api.registry.createType('Balance',buyout))
    .signAndSend(account.address, (res) => {
      if (res.status.isInBlock) {
        console.log('in a block')
      }
      if (res.status.isFinalized) {
        console.log('finalized')
        alert('Auction Created Successfully!')
        setLoaded(true);
      }
    })

    return [gasRequired.toString(), result.toHuman().Ok, output?.toHuman().Ok]
  }

  const handleCopyAddress = (address) => {
    // Handle copying the address to the clipboard
    console.log(`Copying address: ${address}`);
  };

  useEffect(() => {
    (async () => {
      const provider = new WsProvider('wss://rpc.shibuya.astar.network');
      let temp = new ApiPromise({ provider });
      setApi(temp);
      await temp.isReady;
      const res = await connectWalletHandler(temp, true);
      const res2 = await getAuctionInfo(temp, true, res[2], res[3]);
      if(res2[2] != null) {
        setListed(true);
        setAuction(res2[2]);
      } else {
        setListed(false);
      }
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="poppins">
      { listed ? 
            <ul>
            <li className="flex items-center justify-between py-4 space-x-4 border-b border-white">
              <div className="flex-grow flex flex-col items-start space-y-2">
                <div className="text-2xl font-semibold">Highest Bidder : {auction.highestBidder.slice(0,10)}..</div>
                <div className="text-base font-medium text-gray-400">
                  Current Bid: <span className="text-lg text-white">{auction.highestBid}</span>
                </div>
                { auction.highestBid == auction.buyoutPrice ? 
                <button
                className="px-4 py-1 text-base font-bold text-blue-600 bg-white rounded hover:bg-blue-600 hover:text-white transition duration-300"
                onClick={handleFinalize}
                >
                { loaded ? `Finalize` : "Loading.." }
                </button>
                : 
                <div>
                <button
                  className="px-4 py-1 text-base font-bold text-blue-600 bg-white rounded hover:bg-blue-600 hover:text-white transition duration-300"
                  onClick={handlePlaceBid}
                >
                 { loaded ? `Place Bid @ ${parseInt(auction.highestBid.replaceAll(',','')) + parseInt(auction.tickPrice.replaceAll(',',''))} ` : "Loading.." }
                </button> <br />
                <button
                  className="px-4 mt-2 py-1 text-base font-bold text-blue-600 bg-white rounded hover:bg-blue-600 hover:text-white transition duration-300"
                  onClick={handleBuyout}
                >
                 { loaded ?  `Buyout @ ${auction.buyoutPrice.replaceAll(',','')}` : "Loading.." }
                </button>
                </div>
                }
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-400">Seller : {auction.seller.slice(0,10)}..</div>
              </div>
            </li>
        </ul>
      : 
        <div className="mt-6">
          {showAuctionForm ? "" : 
          <button
            className="px-8 py-2 text-lg font-bold bg-blue-600 rounded hover:bg-blue-700 transition duration-300"
            onClick={handleGenerateNewAuction}
          >
            Create Auction
          </button>
          }
        </div>
      }
      {showAuctionForm && (
        <div className="mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-400">Starting Bid</label>
            <input type="number" min={1} value={starting} onChange={(e) => setStarting(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-600 rounded-md text-gray-100 bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Tick Price</label>
            <input type="number" min={1} value={tick} onChange={(e) => setTick(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-600 rounded-md text-gray-100 bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">BuyOut Price</label>
            <input type="number" min={1} value={buyout} onChange={(e) => setBuyout(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-600 rounded-md text-gray-100 bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Auction End Time In Days</label>
            <input type="number" min={1} value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-600 rounded-md text-gray-100 bg-gray-700" />
          </div>
          <button onClick={onCreate} className="px-8 py-2 text-lg font-bold bg-blue-600 rounded hover:bg-blue-700 transition duration-300 mt-6">
            { loaded ? "Submit" : "Loading.." }
          </button>
        </div>
      )}
    </div>
  );
};

export default AuctionTab;
