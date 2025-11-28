/**
 * Input validation utilities
 */

import { isAddress } from 'viem';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates an Ethereum address
 */
export function validateAddress(address: string): ValidationResult {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }
  
  if (!address.startsWith('0x')) {
    return { isValid: false, error: 'Address must start with 0x' };
  }
  
  if (!isAddress(address)) {
    return { isValid: false, error: 'Invalid Ethereum address' };
  }
  
  return { isValid: true };
}

/**
 * Validates a transaction hash
 */
export function validateTxHash(hash: string): ValidationResult {
  if (!hash) {
    return { isValid: false, error: 'Transaction hash is required' };
  }
  
  if (!hash.startsWith('0x')) {
    return { isValid: false, error: 'Transaction hash must start with 0x' };
  }
  
  if (hash.length !== 66) {
    return { isValid: false, error: 'Invalid transaction hash length' };
  }
  
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return { isValid: false, error: 'Transaction hash contains invalid characters' };
  }
  
  return { isValid: true };
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

/**
 * Validates a URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validates a positive number
 */
export function validatePositiveNumber(
  value: string | number,
  fieldName = 'Value'
): ValidationResult {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }
  
  if (num <= 0) {
    return { isValid: false, error: `${fieldName} must be positive` };
  }
  
  return { isValid: true };
}

/**
 * Validates a number within range
 */
export function validateRange(
  value: string | number,
  min: number,
  max: number,
  fieldName = 'Value'
): ValidationResult {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }
  
  if (num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }
  
  if (num > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` };
  }
  
  return { isValid: true };
}

/**
 * Validates string length
 */
export function validateLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName = 'Value'
): ValidationResult {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  }
  
  return { isValid: true };
}

/**
 * Validates required field
 */
export function validateRequired(
  value: unknown,
  fieldName = 'Field'
): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
}

/**
 * Validates a hex string
 */
export function validateHex(value: string, fieldName = 'Value'): ValidationResult {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (!value.startsWith('0x')) {
    return { isValid: false, error: `${fieldName} must start with 0x` };
  }
  
  if (!/^0x[a-fA-F0-9]*$/.test(value)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }
  
  return { isValid: true };
}

/**
 * Validates ETH amount
 */
export function validateEthAmount(
  value: string,
  minAmount = 0,
  maxAmount = Number.MAX_SAFE_INTEGER
): ValidationResult {
  if (!value) {
    return { isValid: false, error: 'Amount is required' };
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Invalid amount format' };
  }
  
  if (num < minAmount) {
    return { isValid: false, error: `Minimum amount is ${minAmount} ETH` };
  }
  
  if (num > maxAmount) {
    return { isValid: false, error: `Maximum amount is ${maxAmount} ETH` };
  }
  
  // Check for too many decimals (ETH has 18 decimals)
  const decimals = value.split('.')[1]?.length || 0;
  if (decimals > 18) {
    return { isValid: false, error: 'Too many decimal places' };
  }
  
  return { isValid: true };
}

/**
 * Validates token ID
 */
export function validateTokenId(value: string | number): ValidationResult {
  const id = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(id)) {
    return { isValid: false, error: 'Token ID must be a number' };
  }
  
  if (id < 0) {
    return { isValid: false, error: 'Token ID cannot be negative' };
  }
  
  if (!Number.isInteger(id)) {
    return { isValid: false, error: 'Token ID must be an integer' };
  }
  
  return { isValid: true };
}

/**
 * Combines multiple validations
 */
export function combineValidations(
  ...validations: ValidationResult[]
): ValidationResult {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }
  return { isValid: true };
}

/**
 * Validates multiple fields and returns all errors
 */
export function validateAll(
  validations: Record<string, ValidationResult>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  Object.entries(validations).forEach(([field, result]) => {
    if (!result.isValid && result.error) {
      errors[field] = result.error;
      isValid = false;
    }
  });
  
  return { isValid, errors };
}

/**
 * Creates a validator with custom rules
 */
export function createValidator<T>(
  rules: Record<keyof T, (value: T[keyof T]) => ValidationResult>
) {
  return (data: T): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    (Object.keys(rules) as (keyof T)[]).forEach(key => {
      const result = rules[key](data[key]);
      if (!result.isValid && result.error) {
        errors[key] = result.error;
        isValid = false;
      }
    });
    
    return { isValid, errors };
  };
}

export default {
  validateAddress,
  validateTxHash,
  validateEmail,
  validateUrl,
  validatePositiveNumber,
  validateRange,
  validateLength,
  validateRequired,
  validateHex,
  validateEthAmount,
  validateTokenId,
  combineValidations,
  validateAll,
  createValidator,
};

