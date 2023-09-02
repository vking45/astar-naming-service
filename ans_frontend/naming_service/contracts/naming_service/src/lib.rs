#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
pub mod naming_service {

    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;

    #[ink(event)]
    pub struct DomainRegistered {
        #[ink(topic)]
        name: Vec<u8>,
        #[ink(topic)]
        owner: AccountId,
    }

    #[ink(event)]
    pub struct DomainTransferred {
        #[ink(topic)]
        name: Vec<u8>,
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
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
    pub struct DomainInfo {
        owner: AccountId,
        url: Option<Vec<u8>>,
        eth_address: Option<AccountId>,
    }

    #[ink(storage)]
    pub struct NamingService {
        domains: Mapping<Vec<u8>, DomainInfo>,
        dao_treasury: AccountId,
        reverse_domains : Mapping<AccountId, Vec<Vec<u8>>>,
    }

    impl NamingService {
        #[ink(constructor)]
        pub fn new(dao_treasury: AccountId) -> Self {
            let domains = Mapping::default();
            let reverse_domains = Mapping::default(); 
            Self {
                domains,
                dao_treasury,
                reverse_domains,
            }
        }

        #[ink(message, payable)]
        pub fn register_domain(&mut self, name: Vec<u8>) -> bool {
            
            let base = 200_000_000_000_000_000_000;
            
            let value = self.env().transferred_value(); 

            if !Self::is_valid_domain_name(&name) || name.len() < 3 {
                return false;
            }

            let suffix = ".star".as_bytes().to_vec();
            let full_name = [&name[..], &suffix[..]].concat();
            let caller = self.env().caller();
            

            if self.domains.contains(&full_name) || value < base
            {
                return false;
            }

            self.domains.insert(
                full_name.clone(),
                &DomainInfo {
                    owner : caller,
                    url : None,
                    eth_address : None,
                },
            );

            let domain_list = self.reverse_domains.get(&caller).unwrap_or(Vec::new()).clone();
            let mut updated_list = domain_list.clone();
            updated_list.push(full_name.clone());
            self.reverse_domains.insert(caller, &updated_list);

            self.env().emit_event(DomainRegistered { name: full_name, owner: caller });            

	        if let Err(_) = self.env().transfer(self.dao_treasury, value) {
                return false;
            }

            true            
        }

        #[ink(message)]
        pub fn transfer_domain(&mut self, name: Vec<u8>, new_owner: AccountId) -> bool {
        
            if let Some(mut domain_info) = self.domains.take(&name) {
                let caller = self.env().caller();
                if domain_info.owner == caller {
                    domain_info.owner = new_owner;
                    self.domains.insert(name.clone(), &domain_info);

                    let mut current_owner_domains = self.reverse_domains.get(&caller).unwrap_or(Vec::new()).clone();
                    current_owner_domains.retain(|domain| domain != &name);
                    if current_owner_domains.is_empty() {
                        self.reverse_domains.remove(&caller);
                    } else {
                        self.reverse_domains.insert(caller, &current_owner_domains);
                    }

                    let mut new_owner_domains = self.reverse_domains.get(&new_owner).unwrap_or(Vec::new()).clone();
                    new_owner_domains.push(name.clone());
                    self.reverse_domains.insert(new_owner, &new_owner_domains);

                    self.env().emit_event(DomainTransferred {
                        name: name.clone(),
                        from: caller,
                        to: new_owner,
                    });
                    return true;
                }
            }
            false
        }     
        
        #[ink(message)]
        pub fn get_domain_info(&self, name: Vec<u8>) -> Option<DomainInfo> {
            self.domains.get(name)
        }

        #[ink(message)]
        pub fn get_domains_by_owner(&self, owner : AccountId) -> Vec<Vec<u8>> {
            self.reverse_domains.get(&owner).unwrap_or(Vec::new()).clone()
        }

        #[ink(message)]
        pub fn set_domain_url(&mut self, name: Vec<u8>, url: Vec<u8>) -> bool {
            if let Some(mut domain_info) = self.domains.get(&name) {
                if domain_info.owner == self.env().caller() {
                    domain_info.url = Some(url);
                    self.domains.insert(name, &domain_info);
                    return true;
                }
            }
            false
        }

        #[ink(message)]
        pub fn get_domain_url(&self, name: Vec<u8>) -> Option<Vec<u8>> {
            if let Some(domain_info) = self.domains.get(&name) {
                return domain_info.url.clone();
            }
            None
        }

        #[ink(message)]
        pub fn set_domain_eth_address(&mut self, name: Vec<u8>, eth_address: AccountId) -> bool {
            if let Some(mut domain_info) = self.domains.take(&name) {
                if domain_info.owner == self.env().caller() {
                    domain_info.eth_address = Some(eth_address);
                    self.domains.insert(name, &domain_info);
                    return true;
                }
            }
            false
        }

        #[ink(message)]
        pub fn get_domain_eth_address(&self, name: Vec<u8>) -> Option<AccountId> {
            if let Some(domain_info) = self.domains.get(&name) {
                return domain_info.eth_address;
            }
            None
        }

        pub fn is_valid_domain_name(name: &[u8]) -> bool {
            let max_length: usize = 25;
            let allowed_chars: &[u8] = b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
        
            // Check if the domain name exceeds the maximum allowed length
            if name.len() > max_length {
                return false;
            }
        
            for &byte in name {
                // Check for whitespace characters
                if byte.is_ascii_whitespace() {
                    return false;
                }
        
                // Check for special characters
                if !allowed_chars.contains(&byte) {
                    return false;
                }
            }
        
            true
        }        
    }
}