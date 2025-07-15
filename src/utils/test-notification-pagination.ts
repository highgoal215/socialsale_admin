// Test file for notification pagination logic
export const testPaginationLogic = () => {
  const ITEMS_PER_PAGE = 10;
  
  // Test scenarios
  const testCases = [
    { totalItems: 5, expectedPages: 1 },
    { totalItems: 10, expectedPages: 1 },
    { totalItems: 15, expectedPages: 2 },
    { totalItems: 25, expectedPages: 3 },
    { totalItems: 100, expectedPages: 10 },
  ];

  // console.log('Testing pagination logic:');
  // 
  testCases.forEach(({ totalItems, expectedPages }) => {
    const calculatedPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const isCorrect = calculatedPages === expectedPages;
    
    // console.log(`Total items: ${totalItems} | Expected pages: ${expectedPages} | Calculated: ${calculatedPages} | ${isCorrect ? '✅' : '❌'}`);
  });

  // Test page calculation
  const testPageCalculation = (totalItems: number, currentPage: number) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = Math.min(endIndex, totalItems) - startIndex;
    // 
    // console.log(`Page ${currentPage}: Items ${startIndex + 1}-${Math.min(endIndex, totalItems)} (${currentItems} items)`);
  };

  // console.log('\nTesting page calculations for 25 items:');
  testPageCalculation(25, 1);
  testPageCalculation(25, 2);
  testPageCalculation(25, 3);
};

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testPaginationLogic();
} 