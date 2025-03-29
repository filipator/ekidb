// Modified StationTable.js with filter removed, pagination relocated, and centered modal

'use client';
import { useState, useEffect } from 'react';
import ImageComponent from './ImageComponent';

export default function StationTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  // Removed filterConfig state since we're removing the Train Line filter
  const [selectedStation, setSelectedStation] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.csv');
        const csvText = await response.text();

        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const parsedData = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i]) continue;
          const values = lines[i].split(',');
          const entry = {};
          headers.forEach((header, index) => {
            entry[header] = values[index];
          });
          parsedData.push(entry);
        }

        setData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data - removed trainLineMatch since we're removing the filter
  const filteredData = data.filter(item => {
    // Search filter
    const searchMatch = Object.values(item).some(
      value => value && value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return searchMatch;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle row click
  const handleRowClick = (station) => {
    setSelectedStation(station);
  };

  // Close modal
  const closeModal = () => {
    setSelectedStation(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Eki Stamps Directory</h1>
      
      {/* Search and Pagination - moved pagination to top */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search any field..."
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* Pagination moved to top where filter was */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <label className="mr-2 text-sm text-black">Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md p-1"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-gray-300 rounded-md mr-1 disabled:opacity-50 text-black text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-black mx-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-gray-300 rounded-md ml-1 disabled:opacity-50 text-black text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="mb-4 text-sm text-black">
        Showing {currentItems.length} of {filteredData.length} results
        {filteredData.length !== data.length && ` (filtered from ${data.length} total)`}
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('StationEN')}
              >
                Station (English)
                {sortConfig.key === 'StationEN' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('StationJA')}
              >
                Station (Japanese)
                {sortConfig.key === 'StationJA' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('TrainLine')}
              >
                Train Line
                {sortConfig.key === 'TrainLine' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Stamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((station, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(station)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-black">{station.StationEN}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{station.StationJA}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{station.TrainLine}</td>
                <td className="px-6 py-4 whitespace-nowrap station-image-cell">
                  {station.imgurURL2 && (
                    <ImageComponent
                      src={station.imgurURL2}
                      alt={station.StationEN}
                      width={150}
                      height={150}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal for image popup - centered on page */}
      {selectedStation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">
                {selectedStation.StationEN} ({selectedStation.StationJA})
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center">
              {selectedStation.imgurURL2 && (
                <img
                  src={selectedStation.imgurURL2}
                  alt={selectedStation.StationEN}
                  className="modal-image mb-4"
                />
              )}
              <div className="text-black">
                <p><strong>Train Line:</strong> {selectedStation.TrainLine}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
