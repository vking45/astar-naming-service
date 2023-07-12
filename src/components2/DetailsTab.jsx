import React, { useState, useEffect } from 'react';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { Abi, ContractPromise } from '@polkadot/api-contract'
import ABI from '../artifacts/naming_service.json';
import { BN } from '@polkadot/util/bn'

const address = 'bD5Bj1czhW6tsGaiAbzBbE8vh3BVUzhahPRGC6YeEPvfZzb';
const decimals = new BN('100000000000000')

const DetailRow = ({ label, value, actionButton, avatar }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center justify-start mb-4">
      <div className="text-gray-400 text-lg mr-2">{label}:</div>
      <div className="flex items-center">
        {avatar && <img src={avatar} alt="avatar" className="w-6 h-6 rounded-full mr-2" />}
        <div className="text-gray-100 font-semibold text-lg mr-4">{value}</div>
      </div>
    </div>
    {actionButton}
  </div>
);

const RecordRow = ({ recordType, value }) => (
  <tr className="hover:bg-gray-700">
    <td className="border-t border-gray-600 px-4 py-2 text-base text-gray-400">{recordType}</td>
    <td className="border-t border-gray-600 px-4 py-2 text-base font-semibold text-gray-100">{value}</td>
  </tr>
);

const DomainDetails = ({name}) => {
  // Replace the data in this object with your domain details
  const domainDetails = {
    name: 'shubh.eth',
    owner: '0x1234...',
    resolver: '0x5678...',
    content: 'Not set',
    expires: '2024-05-22',
  };

  // Replace the data in this object with your records
  const records = [
    { recordType: 'Address', value: '0x1234...' },
    { recordType: 'Content', value: 'Not set' },
  ];

  // Replace with the actual avatar URL
  const avatarUrl = 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT2jUdKJhKnlEf2FXJYiIT9JAFxUZs6rrSvmxOpQAIEmH5LPaL4';

  const [showTransferFields, setShowTransferFields] = useState(false);
  const [extend, setExtend] = useState(0);
  const [newOwner, setNewOwner] = useState("");
  const [account, setAccount] = useState();
  const [contract, setContract] = useState();
  const [api, setApi] = useState();
  const [loaded, setLoaded] = useState(false);
  const [domain, setDomain] = useState({owner : "", image : "", expiration : ""});

  useEffect(() => {
    (async () => {
      const provider = new WsProvider('wss://rpc.shibuya.astar.network');
      let temp = new ApiPromise({ provider });
      await temp.isReady;
      const res = await connectWalletHandler(temp, true);
      setAccount(res[0])
      setContract(res[1])
      setApi(temp);
      const res2 = await getDomainInfo(temp, true, res[0], res[1]);
      setDomain(res2[2]);
      setLoaded(true);
    })();
  }, []);

  const getDomainInfo = async (_api, _apiReady, _account, _contract) => {
    if (!_api || !_apiReady || !_account || !_contract) {
      return
    }
    const gasLimit = getGasLimit(_api)

    const { gasRequired, result, output } = await _contract.query.getDomainInfo(
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

  const getGasLimit = (api) =>
  api.registry.createType(
    'WeightV2',
    api.consts.system.blockWeights['maxBlock']
  )

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
    return [injectedAccounts[0], contract]
  }

  const handleTransferClick = () => {
    setShowTransferFields(!showTransferFields);
  };

  const onClickTransfer = async () => {

    setLoaded(false);
    if (!api || !account || !contract) {
      return
    }

    const gasLimit = getGasLimit(api)

    const { gasRequired, result, output } = await contract.query.transferDomain(
      account.address,
      {
        gasLimit : gasLimit,
        storageDepositLimit: null,
        value: new BN(0)
      },
      name, newOwner
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
    await contract.tx
    .transferDomain({
      gasLimit: gasRequired,
      storageDepositLimit: null,
      value: new BN(0),
    }, name, newOwner)
    .signAndSend(account.address, (res) => {
      if (res.status.isInBlock) {
        console.log('in a block')
      }
      if (res.status.isFinalized) {
        console.log('finalized')
        alert('Domain Name Successfully Transferred!')
        setShowTransferFields(false);
        setLoaded(true);
      }
    })

    return [gasRequired.toString(), result.toHuman().Ok, output?.toHuman().Ok]

  }

  const handleCloseTransferClick = () => {
    setShowTransferFields(false);
  };
  const [showExtendFields, setShowExtendFields] = useState(false);

  const handleExtendClick = () => {
    setShowExtendFields(!showExtendFields);
  };

  const onClickExtend = async () => {
    setLoaded(false);
    if (!api || !account || !contract) {
      return
    }

    const gasLimit = getGasLimit(api)

    const { gasRequired, result, output } = await contract.query.renewDomain(
      account.address,
      {
        gasLimit : gasLimit,
        storageDepositLimit: null,
        value: (new BN(extend)).mul(decimals)
      },
      name, new BN(extend)
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
    await contract.tx
    .renewDomain({
      gasLimit: gasRequired,
      storageDepositLimit: null,
      value: (new BN(extend)).mul(decimals),
    }, name, new BN(extend))
    .signAndSend(account.address, (res) => {
      if (res.status.isInBlock) {
        console.log('in a block')
      }
      if (res.status.isFinalized) {
        console.log('finalized')
        alert('Expiration Successfully Extended!')
        setShowExtendFields(false);
        setLoaded(true);
      }
    })

    return [gasRequired.toString(), result.toHuman().Ok, output?.toHuman().Ok]
  }

  const handleCloseExtendClick = () => {
    setShowExtendFields(false);
  };
  return (
    <div className="bg-gray-700 text-gray-100 font-poppins">
      <div className="container mx-auto py-8">
        <div className="bg-gray-900 rounded-lg p-6 shadow-md mb-8">
          {showTransferFields ? 
          <DetailRow label="Owner" value={domain.owner} avatar={domain.image} 
          /> 
          : 
          <DetailRow label="Owner" value={domain.owner} avatar={domain.image} 
          actionButton={
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-thin py-1 px-6 rounded-lg" onClick={handleTransferClick}>
              Transfer
            </button>
          }
          /> 
          }
          {showTransferFields && (
            <div className="relative">
              <div className="w-full mt-4">
                <label htmlFor="newOwner" className="block text-sm font-medium text-gray-400">
                  New Owner
                </label>
                <input
                  type="text"
                  name="newOwner"
                  id="newOwner"
                  value={newOwner}
                  onChange={event => setNewOwner(event.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-600 rounded-md text-gray-100 bg-gray-700"
                  placeholder="Enter new owner address"
                />
              </div>
              <div className="absolute top-0 right-0 -mt-4 mr-2">
                <button
                  className="bg-red-600 hover
                  :bg-red-700 text-white font-thin py-1 px-2 rounded-lg"
                  onClick={handleCloseTransferClick}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-right mt-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-thin py-1 px-6 rounded-lg"
                  onClick={onClickTransfer}
                >
                  { loaded ? "Transfer" : "Loading..." }
                </button>
              </div>
            </div>
          )}
          <DetailRow label="Image Link" value={domain.image} />
          <DetailRow
            label="Expires"
            value={new Date(parseInt(domain.expiration.replaceAll(',', ''))).toString()}
            actionButton={
              showExtendFields ? 
                ""
              :
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-thin py-1 px-6 rounded-lg" onClick={handleExtendClick}>
                Extend
              </button>
            }
          />
          {showExtendFields && (
            <div className="relative">
              <div className="w-full mt-4">
                <label htmlFor="newExpiration" className="block text-sm font-medium text-gray-400">
                  Extend Expiration
                </label>
                <input
                  type="number"
                  value={extend}
                  min={1}
                  onChange={event => setExtend(event.target.value)}
                  name="newExpiration"
                  id="newExpiration"
                  className="mt-1 block w-full py-2 px-3 border border-gray-600 rounded-md text-gray-100 bg-gray-700"
                  placeholder="Enter number of days"
                />
              </div>
              <div className="absolute top-0 right-0 -mt-4 mr-2">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-thin py-1 px-2 rounded-lg"
                  onClick={handleCloseExtendClick}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-right mt-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-thin py-1 px-6 rounded-lg"
                  onClick={onClickExtend}
                >
                  { loaded ? "Extend" : "Loading.." }
                </button>
              </div>
            </div>
          )}
    </div>
  </div>
</div>
);
};

export default DomainDetails;
