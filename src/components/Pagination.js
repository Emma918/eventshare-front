// src/components/Pagination.js
import React from 'react';
import { Box, Button } from '@mui/material';

const Pagination = ({ totalPages, currentPage, handlePageChange }) => {
  const handlePrevPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  const getDisplayedPages = () => {
    const pages = [];

    // 显示最多 5 个页码，且确保当前页在中间
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 1 }}>
      <Button onClick={handlePrevPage} disabled={currentPage === 1}>
        &lt;
      </Button>

      {/* 判断是否显示第一页及省略号 */}
      {currentPage > 3 && (
        <>
          <Button onClick={() => handlePageChange(1)} variant={currentPage === 1 ? 'contained' : 'outlined'}>
            1
          </Button>
          <span>...</span>
        </>
      )}

      {/* 显示当前页及附近的页码 */}
      {getDisplayedPages().map((pageNumber) => (
        <Button
          key={pageNumber}
          onClick={() => handlePageChange(pageNumber)}
          variant={currentPage === pageNumber ? 'contained' : 'outlined'}
        >
          {pageNumber}
        </Button>
      ))}

      {/* 判断是否显示最后一页及省略号 */}
      {currentPage < totalPages - 2 && (
        <>
          <span>...</span>
          <Button onClick={() => handlePageChange(totalPages)} variant={currentPage === totalPages ? 'contained' : 'outlined'}>
            {totalPages}
          </Button>
        </>
      )}

      <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
        &gt;
      </Button>
    </Box>
  );
};

export default Pagination;
