
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { TablePaginationProps } from './types';

export const TablePagination = ({ 
  currentPage, 
  totalPages, 
  setCurrentPage, 
  totalItems, 
  itemsPerPage,
  isMobile
}: TablePaginationProps) => {
  // Generate array of page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    // If fewer pages than max visible, show all
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Always include first page, last page, current page, and pages adjacent to current
    const firstPage = 1;
    const lastPage = totalPages;
    
    // Add current page and adjacent pages
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(lastPage - 1, currentPage + 1);
    
    // Adjust if at the beginning
    if (currentPage <= 2) {
      endPage = Math.min(lastPage - 1, maxVisiblePages - 1);
    }
    
    // Adjust if at the end
    if (currentPage >= lastPage - 1) {
      startPage = Math.max(2, lastPage - maxVisiblePages + 2);
    }
    
    // First page is always shown
    pages.push(firstPage);
    
    // Add ellipsis if there's a gap after first page
    if (startPage > 2) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if there's a gap before last page
    if (endPage < lastPage - 1) {
      pages.push(-2); // -2 represents ellipsis (different key from the first one)
    }
    
    // Last page is always shown if not already included
    if (lastPage !== firstPage) {
      pages.push(lastPage);
    }
    
    return pages;
  };

  return (
    <div className="p-4 border-t">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {Math.min(totalItems, 1 + (currentPage - 1) * itemsPerPage)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} orders
        </p>
        
        <Pagination className="order-1 sm:order-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, i) => (
              <PaginationItem key={`page-${page}-${i}`}>
                {page < 0 ? (
                  <span className="px-4">...</span>
                ) : (
                  <PaginationLink 
                    href="#" 
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
