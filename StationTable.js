'use client';

import { useState, useEffect } from 'react';
import ImageComponent from './ImageComponent';

export default function StationTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({
    TrainLine: ''
  });
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

  // Filter data
  const filteredData = data.filter(item => {
    // Search filter
    const searchMatch = Object.values(item).some(
      value => value && value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Column filters
    const trainLineMatch = !filterConfig.TrainLine || 
      item.TrainLine.toLowerCase().includes(filterConfig.TrainLine.toLowerCase());
    
    return searchMatch && trainLineMatch;
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

  // Handle filter change
  const handleFilterChange = (column, value) => {
    setFilterConfig(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
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
      <h1 className="text-2xl font-bold mb-6 text-black">Train Stations Directory</h1>
      
      {/* Search and filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search any field..."
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-black mb-1">Filter by Train Line</label>
          <input
            type="text"
            value={filterConfig.TrainLine}
            onChange={(e) => handleFilterChange('TrainLine', e.target.value)}
            placeholder="Enter train line..."
            className="w-full p-2 border border-gray-300 rounded-md"
          />
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
                onClick={() => requestSort('TrainLine')}
              >
                Train Line
                {sortConfig.key === 'TrainLine' && (
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
                onClick={() => requestSort('StationEN')}
              >
                Station (English)
                {sortConfig.key === 'StationEN' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Image
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
                <td className="px-6 py-4 whitespace-nowrap text-black">{station.TrainLine}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{station.StationJA}</td>
                <td className="px-6 py-4 whitespace-nowrap text-black">{station.StationEN}</td>
                <td className="px-6 py-4 whitespace-nowrap">
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
      
      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
        <div className="mb-4 sm:mb-0">
          <label className="mr-2 text-sm text-black">Items per page:</label>
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md p-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md mr-2 disabled:opacity-50 text-black"
          >
            Previous
          </button>
          
          <span className="text-sm text-black mx-2">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md ml-2 disabled:opacity-50 text-black"
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Modal for image popup */}
      {selectedStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 relative">
            <button 
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold mb-2 text-black">{selectedStation.StationEN}</h2>
            <h3 className="text-lg mb-4 text-black">{selectedStation.StationJA}</h3>
            
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 mb-4 md:mb-0 md:pr-4">
                <p className="text-black"><strong>Train Line:</strong> {selectedStation.TrainLine}</p>
              </div>
              
              <div className="md:w-1/2 flex justify-center">
                {selectedStation.imgurURL2 && (
                  <img 
                    src={selectedStation.imgurURL2} 
                    alt={selectedStation.StationEN}
                    className="max-w-full max-h-[500px] object-contain rounded-md"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
