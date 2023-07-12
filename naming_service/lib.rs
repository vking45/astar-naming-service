#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
pub mod naming_service {

    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;

    const MAX_DAYS: u64 = 365 * 5;

    #[ink(event)]
    pub struct DomainRegistered {
        #[ink(topic)]
        name: Vec<u8>,
        #[ink(topic)]
        owner: AccountId,
    }

    #[ink(event)]
    pub struct DomainDeregistered {
        #[ink(topic)]
        name: Vec<u8>,
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
        image: Vec<u8>,
        expiration: Timestamp,
    }
    
    #[derive(scale::Decode, scale::Encode, Clone)]
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
    pub struct Auction {
    	seller: AccountId,
        highest_bidder: AccountId,
        highest_bid: Balance,
        starting_bid: Balance,
        tick_price: Balance,
        buyout_price: Balance,
        end_time: Timestamp,
    }

    #[ink(event)]
    pub struct AuctionCreated {
        #[ink(topic)]
        name: Vec<u8>,
        #[ink(topic)]
        end_time: Timestamp,
    }
    
    #[ink(event)]
    pub struct NewBid {
        #[ink(topic)]
        name: Vec<u8>,
        #[ink(topic)]
        bidder: AccountId,
        #[ink(topic)]
        bid: Balance,
    }
 
    #[ink(event)]
    pub struct AuctionEnded {
        #[ink(topic)]
        name: Vec<u8>,
        #[ink(topic)]
        winner: AccountId,
        #[ink(topic)]
        winning_bid: Balance,
    }

    #[ink(storage)]
    pub struct NamingService {
        domains: Mapping<Vec<u8>, DomainInfo>,
        auctions: Mapping<Vec<u8>, Auction>,
        suffixes: Vec<Vec<u8>>,
        dao_treasury: AccountId,
    }

    impl NamingService {
        #[ink(constructor)]
        pub fn new(dao_treasury: AccountId) -> Self {
            let mut suffixes = Vec::new();
            suffixes.push(".kbtc".as_bytes().to_vec());
            suffixes.push(".kint".as_bytes().to_vec());
            let domains = Mapping::default();
            let auctions = Mapping::default();
            Self {
                domains,
                auctions,
                suffixes,
                dao_treasury,
            }
        }

        #[ink(message, payable)]
        pub fn register_domain(&mut self, name: Vec<u8>, suffix_idx: u32, days: u64, image: Vec<u8>) -> bool {
            let base = 100000000;
            if suffix_idx >= self.suffixes.len() as u32 {
                return false;
            }
            
            let value = self.env().transferred_value(); 
            let fee = days as Balance;
            
            if days > MAX_DAYS || days < 1 {
                return false;
            }

            if !Self::is_valid_domain_name(&name) || name.len() < 3 {
                return false;
            }

            let suffix = self.suffixes.get(suffix_idx as usize).unwrap().clone();
            let full_name = [&name[..], &suffix[..]].concat();
            let caller = self.env().caller();
            

            if self.domains.contains(&full_name) || value < fee * base
            {
                return false;
            }

            let expiration = self.env().block_timestamp() + (days * 86_400_000);

            self.domains.insert(
                full_name.clone(),
                &DomainInfo {
                    owner : caller,
                    image,
                    expiration,
                },
            );  

            self.env().emit_event(DomainRegistered { name: full_name, owner: caller });            

	    if let Err(_) = self.env().transfer(self.dao_treasury, value) {
                return false;
            }

            true            
        }

        #[ink(message, payable)]
        pub fn renew_domain(&mut self, name: Vec<u8>, days: u64) -> bool {
	    let base = 100000000;
            if days > MAX_DAYS || days < 1 {
                return false;
            }
            
            let value = self.env().transferred_value(); 
            let fee = days as Balance;
            
            if value  < fee * base {
            	return false;
            }
            
            if let Err(_) = self.env().transfer(self.dao_treasury, value) {
                return false;
            }                    
                   

	    if let Some(mut domain_info) = self.domains.take(&name) {
                if domain_info.owner == self.env().caller() {                  
                    domain_info.expiration += (days * 86_400_000);                   
                    self.domains.insert(name, &domain_info); 
                    return true;
                }
                
                return false;
                
            } 
            else {
            
            	return false;
            }
        }

        #[ink(message)]
        pub fn transfer_domain(&mut self, name: Vec<u8>, new_owner: AccountId) -> bool {
        
            if self.auctions.contains(&name) {
            	return false;
            }
        
        
            if let Some(mut domain_info) = self.domains.take(&name) {
                let caller = self.env().caller();
                if domain_info.owner == caller {
                    domain_info.owner = new_owner;
                    self.domains.insert(name.clone(), &domain_info);
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
        pub fn deregister_domain(&mut self, name: Vec<u8>) -> bool {
            if let Some(domain_info) = self.domains.take(&name) {
                let current_time = self.env().block_timestamp();
                if domain_info.expiration <= current_time {
                    self.domains.remove(&name);
                    self.env().emit_event(DomainDeregistered { name: name.clone() });
                    return true;
                }
            }
            false
        }        
        
        #[ink(message)]
        pub fn get_domain_info(&self, name: Vec<u8>) -> Option<DomainInfo> {
            self.domains.get(name)
        }
        
	#[ink(message, payable)]
	pub fn create_auction(&mut self, name: Vec<u8>, duration: Timestamp, starting_bid: Balance, tick_price: Balance, buyout_price: Balance) -> bool {

	    if self.auctions.contains(&name) {
		return false;
	    }

	    if let Some(domain_info) = self.domains.get(&name) {
		let caller = self.env().caller();
		if domain_info.owner == caller {
		    let current_time = self.env().block_timestamp();
		    let end_time = current_time + duration;
		    self.auctions.insert(
		        name.clone(),
		        &Auction {
		            seller: caller,
		            highest_bidder: caller,
		            highest_bid: starting_bid,
		            starting_bid: starting_bid,
		            tick_price: tick_price,
		            buyout_price: buyout_price,
		            end_time,
		        },
		    );
		    self.env().emit_event(AuctionCreated { name, end_time });
		    return true;
		}
	    }
	    false
	}
	
	#[ink(message, payable)]
        pub fn bid(&mut self, name: Vec<u8>) -> bool {
            let caller = self.env().caller();
            let value = self.env().transferred_value();
            if let Some(mut auction) = self.auctions.take(&name) {
                let current_time = self.env().block_timestamp();
                if auction.end_time > current_time && value > auction.highest_bid && (value - auction.starting_bid) % auction.tick_price == 0 {
                
                    if auction.highest_bid > 0 {
                        if let Err(_) = self.env().transfer(auction.highest_bidder, auction.highest_bid) {
                            return false;
                        }
                    }
                    
                    if value >= auction.buyout_price {
                    	auction.end_time = current_time
                    }

                    auction.highest_bidder = caller;
                    auction.highest_bid = value;
                    self.auctions.insert(name.clone(), &auction);
                    self.env().emit_event(NewBid {
                        name: name.clone(),
                        bidder: caller,
                        bid: value,
                    });
                    return true;
                }
            }
            false
        }
        
	#[ink(message)]
        pub fn finalize_auction(&mut self, name: Vec<u8>) -> bool {
            if let Some(auction) = self.auctions.take(&name) {
                let current_time = self.env().block_timestamp();
                if auction.end_time < current_time {

                    if let Some(mut domain_info) = self.domains.take(&name) {
                        domain_info.owner = auction.highest_bidder;
                        self.domains.insert(name.clone(), &domain_info);
                    }

                    if let Err(_) = self.env().transfer(auction.seller, auction.highest_bid) {
                        return false;
                    }

                    self.env().emit_event(AuctionEnded {
                        name: name.clone(),
                        winner: auction.highest_bidder,
                        winning_bid: auction.highest_bid,
                    });

                    self.auctions.remove(&name);
                    return true;
                }
            }
            false
        }
        
	#[ink(message)]
	pub fn update_image(&mut self, name: Vec<u8>, new_image: Vec<u8>) -> bool {
	    if let Some(mut domain_info) = self.domains.take(&name) {
		let caller = self.env().caller();
		if domain_info.owner == caller {
		    domain_info.image = new_image;
		    self.domains.insert(name, &domain_info);
		    return true;
		}
	    }
	    false
	}
	
        #[ink(message)]
        pub fn get_auction_info(&self, name: Vec<u8>) -> Option<Auction> {
            self.auctions.get(name)
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
