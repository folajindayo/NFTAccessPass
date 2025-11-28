import React, { useState, createContext, useContext } from 'react';

/**
 * Accordion item type
 */
interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

/**
 * Props for the Accordion component
 */
interface AccordionProps {
  /** Accordion items */
  items: AccordionItem[];
  /** Allow multiple items to be open */
  allowMultiple?: boolean;
  /** Default open item IDs */
  defaultOpen?: string[];
  /** Additional CSS classes */
  className?: string;
  /** Variant style */
  variant?: 'default' | 'bordered' | 'separated';
}

/**
 * Accordion context
 */
interface AccordionContextType {
  openItems: Set<string>;
  toggleItem: (id: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

/**
 * Chevron icon component
 */
const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

/**
 * Accordion component with multiple variants
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = '',
  variant = 'default',
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const variantClasses = {
    default: 'divide-y divide-gray-200 dark:divide-gray-700',
    bordered: 'border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700',
    separated: 'space-y-2',
  };

  const itemClasses = {
    default: '',
    bordered: '',
    separated: 'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, allowMultiple }}>
      <div className={`${variantClasses[variant]} ${className}`}>
        {items.map(item => (
          <AccordionItemComponent
            key={item.id}
            item={item}
            variant={variant}
            itemClassName={itemClasses[variant]}
          />
        ))}
      </div>
    </AccordionContext.Provider>
  );
};

/**
 * Individual accordion item component
 */
const AccordionItemComponent: React.FC<{
  item: AccordionItem;
  variant: string;
  itemClassName: string;
}> = ({ item, itemClassName }) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionItem must be used within Accordion');

  const { openItems, toggleItem } = context;
  const isOpen = openItems.has(item.id);

  return (
    <div className={itemClassName}>
      <button
        type="button"
        onClick={() => !item.disabled && toggleItem(item.id)}
        disabled={item.disabled}
        aria-expanded={isOpen}
        aria-controls={`content-${item.id}`}
        className={`
          w-full flex items-center justify-between px-4 py-4 text-left
          font-medium text-gray-900 dark:text-white
          hover:bg-gray-50 dark:hover:bg-gray-800/50
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
          ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span>{item.title}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      
      <div
        id={`content-${item.id}`}
        role="region"
        aria-labelledby={item.id}
        className={`
          overflow-hidden transition-all duration-200 ease-in-out
          ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
          {item.content}
        </div>
      </div>
    </div>
  );
};

/**
 * Simple FAQ accordion
 */
export const FAQAccordion: React.FC<{
  items: Array<{ question: string; answer: string }>;
  className?: string;
}> = ({ items, className = '' }) => {
  const accordionItems: AccordionItem[] = items.map((item, index) => ({
    id: `faq-${index}`,
    title: item.question,
    content: <p>{item.answer}</p>,
  }));

  return (
    <Accordion
      items={accordionItems}
      variant="bordered"
      className={className}
    />
  );
};

/**
 * Collapsible panel (single item accordion)
 */
export const Collapsible: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}> = ({ title, children, defaultOpen = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 py-3 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-t-lg"
      >
        <span>{title}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;

