import {
  web3Enable,
  isWeb3Injected,
  web3Accounts,
  web3FromSource
} from '@polkadot/extension-dapp';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { Abi, ContractPromise } from '@polkadot/api-contract'
import React,{ useEffect, useState} from 'react'
import FixedSearchBar from '../components2/FixedSearchBar';
import Navbar from '../components/Navbar';
import DomainBlock from '../components2/DomainBlock';
import DetailsTab from '../components2/DetailsTab';
import ABI from '../artifacts/naming_service.json';
import { useParams } from 'react-router-dom';

const address = 'bD5Bj1czhW6tsGaiAbzBbE8vh3BVUzhahPRGC6YeEPvfZzb';

function Dashboard() {

  const { name } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState({address : "Connect"});
  const [loaded, setLoaded] = useState(false);
  const [contract, setContract] = useState();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const connectWalletHandler = async (_api, _apiReady) => {
    setError('')
    setSuccessMsg('')
    if (!_api || !_apiReady) {
      setError('The API is not ready')
      return
    }
    const extensions = await web3Enable('KNS')
    /* check if wallet is installed */
    if (extensions.length === 0) {
      setError('The user does not have any Substrate wallet installed')
      return
    }
    // set the first wallet as the signer (we assume there is only one wallet)
    _api.setSigner(extensions[0].signer)
    const injectedAccounts = await web3Accounts()
    if (injectedAccounts.length > 0) {
      setAccounts(injectedAccounts);
      setAccount(injectedAccounts[0]);
    }
    const abi = new Abi(ABI, _api.registry.getChainProperties())
    const contract = new ContractPromise(_api, abi, address)
    setContract(contract)
  }

  useEffect(() => {
    (async () => {
      const provider = new WsProvider('wss://rpc.shibuya.astar.network');
      let temp = new ApiPromise({ provider });
      await temp.isReady;
      await connectWalletHandler(temp, true);
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="bg-gray-800 h-full">
      { loaded ? 
        <Navbar account={account} />
      :  "" }
      
      <div className="container mx-auto pt-40">
        <DomainBlock account={account} contract={contract} name={name} />
      </div>
    </div>
  )
}

export default Dashboard