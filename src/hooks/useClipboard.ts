import { useState, useCallback } from 'react';

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  error: Error | null;
}

/**
 * Hook for copying text to clipboard
 * @param resetDelay - Time in ms before copied state resets
 * @returns { copied, copy, error }
 */
export function useClipboard(resetDelay: number = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    setError(null);
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Modern approach using Clipboard API
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Failed to copy text');
        }
      }

      setCopied(true);
      
      if (resetDelay > 0) {
        setTimeout(() => setCopied(false), resetDelay);
      }
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Copy failed');
      setError(error);
      setCopied(false);
      return false;
    }
  }, [resetDelay]);

  return { copied, copy, error };
}

/**
 * Hook for reading from clipboard
 * @returns { text, read, error }
 */
export function useClipboardRead(): {
  text: string | null;
  read: () => Promise<string | null>;
  error: Error | null;
} {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const read = useCallback(async (): Promise<string | null> => {
    setError(null);
    
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
      }
      
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      return clipboardText;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Read failed');
      setError(error);
      return null;
    }
  }, []);

  return { text, read, error };
}

/**
 * Simple copy function (no React state)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  } catch {
    return false;
  }
}

export default useClipboard;

