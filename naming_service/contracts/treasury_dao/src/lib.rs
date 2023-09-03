#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
pub mod treasury_dao {
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    #[ink(storage)]
    pub struct TreasuryDao {
        dao_members: Vec<AccountId>,
        proposals: Mapping<u32, Proposal>,
        proposal_count: u32,
        dao_treasury: Balance,
    }

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(
            Debug,
            PartialEq,
            Eq,
            scale_info::TypeInfo,
            ink::storage::traits::StorageLayout
        )
    )]
    pub enum ProposalType {
        AddMember,
        TransferFunds,
    }

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(
            Debug,
            PartialEq,
            Eq,
            scale_info::TypeInfo,
            ink::storage::traits::StorageLayout
        )
    )]
    pub struct Proposal {
        proposal_type: ProposalType,
        target: AccountId,
        amount: Balance,
        votes: Vec<AccountId>,
        deadline: Timestamp,
    }

    impl TreasuryDao {
        #[ink(constructor)]
        pub fn new(initial_members: Vec<AccountId>, initial_funds: Balance) -> Self {
            Self {
                dao_members: initial_members,
                proposals: Mapping::default(),
                proposal_count: 0,
                dao_treasury: initial_funds,
            }
        }

        #[ink(message)]
        pub fn create_proposal(&mut self, proposal_type: ProposalType, target: AccountId, amount: Balance) -> bool {
            let caller = self.env().caller();
            if !self.is_member(&caller) {
                return false;
            }

            let deadline = self.env().block_timestamp() + 172_800_000; // 2 days in milliseconds

            let proposal = Proposal {
                proposal_type,
                target,
                amount,
                votes: Vec::new(),
                deadline,
            };

            self.proposals.insert(self.proposal_count, &proposal);
            self.proposal_count += 1;
            true
        }

        #[ink(message)]
        pub fn vote(&mut self, proposal_id: u32) -> bool {
            let caller = self.env().caller();
            if !self.is_member(&caller) {
                return false;
            }

            if let Some(mut proposal) = self.proposals.take(&proposal_id) {
                if proposal.deadline < self.env().block_timestamp() {
                    return false;
                }

                if proposal.votes.contains(&caller) {
                    return false;
                }

                proposal.votes.push(caller);
                true
            } else {
                false
            }
        }

        #[ink(message)]
        pub fn execute_proposal(&mut self, proposal_id: u32) -> bool {
            if let Some(proposal) = self.proposals.take(&proposal_id) {
                if proposal.deadline >= self.env().block_timestamp() {
                    return false;
                }

                let vote_count = proposal.votes.len() as u32;
                if vote_count * 2 >= self.dao_members.len() as u32 {
                    match proposal.proposal_type {
                        ProposalType::AddMember => {
                            self.dao_members.push(proposal.target);
                        },
                        ProposalType::TransferFunds => {
                            if self.dao_treasury < proposal.amount {
                                return false;
                            }
                            self.env().transfer(proposal.target, proposal.amount).expect("Failed to transfer");
                            self.dao_treasury -= proposal.amount;
                        }
                    }
                    true
                } else {
                    false
                }
            } else {
                false
            }
        }

        #[ink(message)]
        pub fn list_members(&self) -> Vec<AccountId> {
            self.dao_members.clone()
        }

        fn is_member(&self, account: &AccountId) -> bool {
            self.dao_members.contains(account)
        }
    }
}