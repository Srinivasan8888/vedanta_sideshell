import React from "react";
// import "../../miscellaneous/Scrollbar.css";
import "../../components/miscellaneous/Scrollbar.css"

const Table = ({ 
  headers, 
  data, 
  isLoading, 
  error, 
  emptyMessage = "No data available",
  onActionClick,
  actionIcon,
  actionLabel = "Action",
  showActionColumn = true,
  customRowRender,
  className = "",
  headerClassName = "bg-[#101010]/90",
  rowClassName = "border-b border-gray-700 overflow-y-auto",
  cellClassName = "px-4 py-4 ",
  headerCellClassName = "px-4 py-3 text-center whitespace-nowrap",
  actions = [] // New prop for multiple actions
}) => {
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <div className={`rounded-2xl ${className}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="scrollbar-customd overflow-y-auto flex-1">
          <div className="min-w-[30px] h-full">
            <table className="w-full text-white">
              <thead className={`sticky top-0 ${headerClassName} text-base backdrop-blur-sm`}>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} scope="col" className={headerCellClassName}>
                      {header.label || header}
                    </th>
                  ))}
                  {showActionColumn && actions.length > 0 && (
                    <th scope="col" className={headerCellClassName}>
                      {actionLabel}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={headers.length + (showActionColumn && actions.length > 0 ? 1 : 0)} className="text-center py-8">
                    {emptyMessage}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl ${className}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scrollbar-customd overflow-y-auto flex-1">
        <div className="min-w-[30px] h-full">
          <table className="w-full text-white">
          <thead className={`sticky top-0 ${headerClassName} text-base backdrop-blur-sm`}>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className={headerCellClassName}
                >
                  {header.label || header}
                </th>
              ))}
              {showActionColumn && (
                <th
                  scope="col"
                  className={headerCellClassName}
                >
                  {actionLabel}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="overflow-y-scroll">
            {customRowRender ? (
              customRowRender(data)
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowClassName}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className={cellClassName}>
                      {row[header.id || header] || ""}
                    </td>
                  ))}
                  {showActionColumn && (
                    <td className={cellClassName}>
                      {actions.length > 0 ? (
                        // Render multiple action buttons
                        <div className="flex items-center justify-center space-x-1">
                          {actions.map((action, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => action.onClick?.(row)}
                              className="p-2 rounded-full hover:bg-gray-700"
                              title={action.label || ''}
                            >
                              {action.icon}
                            </button>
                          ))}
                        </div>
                      ) : (
                        actionIcon && (
                          <button
                            type="button"
                            onClick={() => onActionClick?.(row)}
                            className="p-2 rounded-full hover:bg-gray-700"
                          >
                            {actionIcon}
                          </button>
                        )
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default Table; 