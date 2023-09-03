import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import TreasuryDaoFactory from "./typedContract/constructors/treasury_dao";
import TreasuryDao from "./typedContract/contracts/treasury_dao";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

use(chaiAsPromised);

// Create a new instance of contract
const wsProvider = new WsProvider("ws://127.0.0.1:9944");
// Create a keyring instance
const keyring = new Keyring({ type: "sr25519" });

describe("treasury_dao test", () => {
  let treasury_daoFactory: TreasuryDaoFactory;
  let api: ApiPromise;
  let deployer: KeyringPair;
  
  let contract: TreasuryDao;
  const initialState = true;

  before(async function setup(): Promise<void> {
    api = await ApiPromise.create({ provider: wsProvider });
    deployer = keyring.addFromUri("//Alice");

    treasury_daoFactory = new TreasuryDaoFactory(api, deployer);

    contract = new TreasuryDao(
      (await treasury_daoFactory.new(initialState)).address,
      deployer,
      api
    );
  });

  after(async function tearDown() {
    await api.disconnect();
  });
});
