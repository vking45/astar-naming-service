module NamingService

struct DomainInfo {
    owner: Address
}

struct Auction {
    seller: Address
    highestBidder: Address
    highestBid: Amount
    startingBid: Amount
    tickPrice: Amount
    buyoutPrice: Amount
    endTimeStamp: Timestamp
}

event DomainRegistered {
    name: String
    owner: Address
}
    
event DomainTransferred {
    name: String
    from: Address
    to: Address
}
    
event AuctionCreated {
    name: String
    endTimeStamp: Timestamp
}
    
event NewBid {
    name: String
    bidder: Address
    bid: Amount
}
    
event AuctionEnded {
    name: String
    winner: Address
    winningBid: Amount
}

contract NamingService {
    mapping(String, DomainInfo) domains
    mapping(String, Auction) auctions
    daoTreasury: Address

    function isValidDomainName(name: String) -> Boolean {
        let max_length: usize = 25;
        let allowed_chars: &[u8] = b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";

        if name.len() > max_length || name.len() < 1 {
            return False;
        }

        for &byte in name {
            if byte.isWhitespace() {
                return False;
            }

            if !allowed_chars.contains(&byte) {
                return False;
            }
        }
        return True;
    }

    function registerDomain(name: String, suffixIdx: u32) -> Boolean {
        if !isValidDomainName(name) {
            return False;
        }

        let name = name + ".star"
        let owner = caller()

        if domains[name] != Null {
            returnn False;
        }

        domains[Name] = DomainInfo(owner)
        emit DomainRegistered(name, owner)
        return True
    }

    function transferDomain(name: String, newOwner: Address) -> Boolean {
        if auctions[name] != Null || domains[name] != Null || domains[name].owner != caller() {
            return False
        }

        domains[name].owner = newOwner
        emit DomainTransferred(name, caller(), newOwner)
        return True
    }

    function getDomainInfo(String: name) -> DomainInfo? {
        return domains[name]
    }

    function createAuction(
        name: String,
        duration: Timestamp, 
        startingBid: Amount, 
        tickPrice: Amount, 
        buyoutPrice: Amount
    ) -> Boolean {
        if auctions[name] != Null || domains[name] != Null || domains[name].owner != caller() {
            return True
        }

        let currentTimeStamp = blockTimeStamp()
        let endTimeStamp = currentTimeStamp + duration

        auctions[name] = Auction(
            seller = caller(),
            highestBidder = caller(),
            highestBid = startingBid,
            startingBid = startingBid,
            tickPrice = tickPrice,
            buyoutPrice = buyoutPrice,
            endTimeStamp = endTimeStamp
        )

        emit AuctionCreated(name, endTimeStamp)
        return True
    }

    



}