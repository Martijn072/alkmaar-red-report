
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

// Fixed categories in the specified order
const FIXED_CATEGORIES = [
  "Alles",
  "Elftal en Technische staf",
  "Wedstrijden", 
  "Transfergeruchten",
  "Europees Voetbal",
  "AZ Jeugd",
  "Fotoreportages",
  "Columns",
  "Memory Lane",
  "Overig nieuws"
];

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="mb-8">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {FIXED_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-az-red text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-premium-gray-600 dark:text-gray-300 hover:bg-premium-gray-100 dark:hover:bg-gray-700 border border-premium-gray-200 dark:border-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};
