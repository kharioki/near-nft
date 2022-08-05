import { near, UnorderedSet } from "near-sdk-js";
import { Contract, NFT_METADATA_SPEC, NFT_STANDARD_NAME } from ".";
import { restoreOwners } from "./internals";
import { JsonToken } from "./metadata";
import { internal_nft_token } from "./nft_core";

//Query for the total supply of NFTs on the contract
export function internal_total_supply(
    contract: Contract
): number {
    //return the length of the token metadata by ID
    return contract.tokenMetadataById.len();
}

//Query for nft tokens on the contract regardless of the owner using pagination
export function internal_nft_tokens(
    contract: Contract, 
    fromIndex: number | null = 0, 
    limit: number | null = 50
): JsonToken[] {
    let tokens = [];
    let keys = contract.tokenMetadataById.toArray();
    near.log('keys: ', keys)
    // Paginate through the keys using the fromIndex and limit
    // for (let i = fromIndex; i < keys.length && i < fromIndex + limit; i++) {
    //     // get the token object from the keys
    //     let jsonToken = internal_nft_token(contract, keys[i][0]);
    //     near.log('jsonToken: ', jsonToken)
    //     tokens.push(jsonToken);
    // }
    return tokens;
}

//get the total supply of NFTs for a given owner
export function internal_supply_for_owner(contract, accountId): number {
    //get the set of tokens for the passed in owner
    let tokens = restoreOwners(contract.tokensPerOwner.get(accountId));
    near.log('tokens: ', tokens)
    //if there isn't a set of tokens for the passed in account ID, we'll return 0
    if (tokens == null) {
        return 0
    }

    //if there is some set of tokens, we'll return the length 
    return tokens.len();
}

//Query for all the tokens for an owner
export function internal_tokens_for_owner(contract: Contract, accountId: string, fromIndex, limit): JsonToken[] {
    //get the set of tokens for the passed in owner
    let tokenSet = restoreOwners(contract.tokensPerOwner.get(accountId));
    near.log('tokenSet: ', tokenSet)

    //if there isn't a set of tokens for the passed in account ID, we'll return 0
    if (tokenSet == null) {
        return [];
    }
    
    //where to start pagination - if we have a fromIndex, we'll use that - otherwise start from 0 index
    let start = fromIndex ? fromIndex : 0;
    //take the first "limit" elements in the array. If we didn't specify a limit, use 50
    let max = limit ? limit : 50;

    let keys = tokenSet.toArray();
    near.log('keys: ', keys)
    let tokens: JsonToken[] = []
    for(let i = start; i < max; i++) {
        if(i >= keys.length) {
            near.log(`reached the end of keys with length: ${keys.length}`);
            return;
        }
        let token = internal_nft_token(contract, keys[i]);
        near.log("token - ", token)
        tokens.push(token);
        near.log(`el: ${JSON.stringify(keys[i])}`);
    }
    return tokens;
}