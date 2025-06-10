import React from "react";
import "./styles/PaginationBar.css"; // lub style module jeśli wolisz

const PaginationBar = ({
  currentPage,
  totalPages,
  nextPage,
  prevPage,
  goToPage,
}) => {
  const getVisiblePages = () => {
    const pages = [];

    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
      if (i > 0 && i <= totalPages) {
        pages.push(i);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="pagination-bar">
      <button onClick={() => goToPage(1)} disabled={currentPage === 1}>
        ⏮
      </button>
      <button onClick={prevPage} disabled={currentPage === 1}>
        ◀
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          className={currentPage === page ? "active" : ""}
          onClick={() => goToPage(page)}
        >
          {page}
        </button>
      ))}

      <button onClick={nextPage} disabled={currentPage === totalPages}>
        ▶
      </button>
      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
      >
        ⏭
      </button>
    </div>
  );
};

export default PaginationBar;
