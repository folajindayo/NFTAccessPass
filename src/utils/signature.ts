/**
 * Signature Utilities
 * Handle cryptographic signatures for NFT operations
 */

import { keccak256, encodePacked, type Address, type Hex } from 'viem';

export interface SignatureData {
  v: number;
  r: Hex;
  s: Hex;
}

export interface TypedDataDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: Address;
}

export interface MintPermit {
  minter: Address;
  tokenId: bigint;
  amount: bigint;
  nonce: bigint;
  deadline: bigint;
}

/**
 * Split signature into components
 */
export function splitSignature(signature: Hex): SignatureData {
  const sig = signature.slice(2); // Remove 0x prefix
  
  if (sig.length !== 130) {
    throw new Error('Invalid signature length');
  }

  const r = `0x${sig.slice(0, 64)}` as Hex;
  const s = `0x${sig.slice(64, 128)}` as Hex;
  const v = parseInt(sig.slice(128, 130), 16);

  // Handle EIP-2 vs legacy v values
  const normalizedV = v < 27 ? v + 27 : v;

  return { r, s, v: normalizedV };
}

/**
 * Join signature components
 */
export function joinSignature(sig: SignatureData): Hex {
  const r = sig.r.slice(2).padStart(64, '0');
  const s = sig.s.slice(2).padStart(64, '0');
  const v = (sig.v < 27 ? sig.v + 27 : sig.v).toString(16).padStart(2, '0');
  
  return `0x${r}${s}${v}` as Hex;
}

/**
 * Create mint permit hash
 */
export function createMintPermitHash(
  permit: MintPermit,
  domain: TypedDataDomain
): Hex {
  const PERMIT_TYPEHASH = keccak256(
    encodePacked(
      ['string'],
      ['MintPermit(address minter,uint256 tokenId,uint256 amount,uint256 nonce,uint256 deadline)']
    )
  );

  const DOMAIN_SEPARATOR = keccak256(
    encodePacked(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        keccak256(encodePacked(['string'], ['EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'])),
        keccak256(encodePacked(['string'], [domain.name])),
        keccak256(encodePacked(['string'], [domain.version])),
        BigInt(domain.chainId),
        domain.verifyingContract,
      ]
    )
  );

  const structHash = keccak256(
    encodePacked(
      ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
      [
        PERMIT_TYPEHASH,
        permit.minter,
        permit.tokenId,
        permit.amount,
        permit.nonce,
        permit.deadline,
      ]
    )
  );

  return keccak256(
    encodePacked(
      ['string', 'bytes32', 'bytes32'],
      ['\x19\x01', DOMAIN_SEPARATOR, structHash]
    )
  );
}

/**
 * Create access proof hash
 */
export function createAccessProofHash(
  user: Address,
  resource: string,
  expiry: bigint,
  nonce: bigint
): Hex {
  return keccak256(
    encodePacked(
      ['address', 'string', 'uint256', 'uint256'],
      [user, resource, expiry, nonce]
    )
  );
}

/**
 * Hash message according to EIP-191
 */
export function hashMessage(message: string): Hex {
  const prefix = '\x19Ethereum Signed Message:\n';
  const messageBytes = new TextEncoder().encode(message);
  
  return keccak256(
    encodePacked(
      ['string', 'uint256', 'bytes'],
      [prefix, BigInt(messageBytes.length), message]
    )
  );
}

/**
 * Verify signature matches expected signer
 * Note: For production use, consider using viem's verifyMessage
 */
export function verifySignatureFormat(signature: Hex): boolean {
  try {
    const sig = splitSignature(signature);
    
    // Check v is valid
    if (sig.v !== 27 && sig.v !== 28) {
      return false;
    }
    
    // Check r and s are valid hex
    if (!/^0x[0-9a-fA-F]{64}$/.test(sig.r)) {
      return false;
    }
    
    if (!/^0x[0-9a-fA-F]{64}$/.test(sig.s)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Create merkle leaf for allowlist
 */
export function createAllowlistLeaf(address: Address, maxAmount: bigint): Hex {
  return keccak256(
    encodePacked(['address', 'uint256'], [address, maxAmount])
  );
}

/**
 * Verify merkle proof
 */
export function verifyMerkleProof(
  leaf: Hex,
  proof: Hex[],
  root: Hex
): boolean {
  let computedHash = leaf;

  for (const proofElement of proof) {
    if (computedHash < proofElement) {
      computedHash = keccak256(
        encodePacked(['bytes32', 'bytes32'], [computedHash, proofElement])
      );
    } else {
      computedHash = keccak256(
        encodePacked(['bytes32', 'bytes32'], [proofElement, computedHash])
      );
    }
  }

  return computedHash === root;
}

/**
 * Generate random nonce
 */
export function generateNonce(): bigint {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return BigInt('0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join(''));
}

/**
 * Check if deadline has passed
 */
export function isDeadlineValid(deadline: bigint): boolean {
  return deadline > BigInt(Math.floor(Date.now() / 1000));
}

/**
 * Create deadline from duration
 */
export function createDeadline(durationSeconds: number): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + durationSeconds);
}

/**
 * Format signature for display
 */
export function formatSignature(signature: Hex, truncate: boolean = true): string {
  if (!truncate) return signature;
  return `${signature.slice(0, 10)}...${signature.slice(-8)}`;
}

/**
 * Type guard for valid hex string
 */
export function isHex(value: unknown): value is Hex {
  return typeof value === 'string' && /^0x[0-9a-fA-F]*$/.test(value);
}

