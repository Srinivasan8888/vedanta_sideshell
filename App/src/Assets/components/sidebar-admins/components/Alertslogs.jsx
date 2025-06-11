import React, { useState, useEffect } from "react";
import API from '../../Axios/AxiosInterceptor';
import { Toaster, toast } from 'sonner';
import moment from 'moment';
import * as XLSX from 'xlsx';

const Alertslogs = () => {
  const [alerts, setAlerts] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAlerts = async () => {
    try {
      const response = await API.get(
        `${process.env.REACT_APP_SERVER_URL}api/admin/getAllAlerts`
      );
      if (response.data && response.data.data) {
        // Only update if data has changed
        const newData = response.data.data;
        if (JSON.stringify(newData) !== JSON.stringify(alerts)) {
          setAlerts(newData);
        }
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast.error("Failed to load alerts");
    }
  };

  const fetchAlertsByDateRange = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      const response = await API.get(
        `${process.env.REACT_APP_SERVER_URL}api/admin/getAlertsByDateRange?startDate=${startDate}&endDate=${endDate}`
      );

      if (response.data && response.data.data) {
        setAlerts(response.data.data);
      } else {
        toast.error('No alerts found in the specified date range');
      }
    } catch (error) {
      console.error('Error fetching alerts by date range:', error);
      toast.error('Error fetching alerts');
    }
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      const response = await API.get(
        `${process.env.REACT_APP_SERVER_URL}api/admin/getAlertsByDateRange?startDate=${startDate}&endDate=${endDate}`
      );

      if (response.data && response.data.data) {
        const alertsData = response.data.data;
        
        // Prepare data for Excel
        const worksheetData = alertsData.map(alert => ({
          Sensor: alert.sensor,
          Model: alert.model,
          Severity: alert.severity,
          Message: alert.message,
          Value: alert.value,
          Timestamp: new Date(alert.timestamp).toLocaleString()
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(worksheetData);
        
        // Create workbook and add worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Alerts');

        // Generate Excel file
        const wbout = XLSX.write(wb, { 
          bookType: 'xlsx', 
          type: 'array'
        });

        // Create blob and trigger download
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `alerts_${moment(startDate).format('YYYY-MM-DD')}_${moment(endDate).format('YYYY-MM-DD')}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Excel file downloaded successfully');
      } else {
        toast.error('No alerts found in the specified date range');
      }
    } catch (error) {
      console.error('Error exporting alerts:', error);
      toast.error('Error exporting alerts');
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAlerts();
    
    // Set up interval for every 2 seconds
    const interval = setInterval(fetchAlerts, 2000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col flex-1 gap-4 px-4 py-4">
        <div className="h-full rounded-2xl border-2 border-white bg-[rgba(16,16,16,0.75)] backdrop-blur-sm">
          <div className="lg:flex md:h-[10%] items-center justify-between px-6">
            <div className="flex gap-10">
              <button
                type="button"
                onClick={fetchAlerts}
                className="inline-flex items-center rounded-full border border-blue-700 p-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              
             
            </div>
            <div className="items-center justify-start font-['Poppins'] text-3xl font-semibold text-white">
              Alert Logs
            </div>
      
            <div className="gap-10 lg:flex justify-evenly">
              <div className="flex h-14 w-full items-center justify-center gap-5 rounded-lg bg-[#101010] px-4 text-white">
                <p className="font-['Poppins'] text-lg font-semibold">From</p>
                <div className="rounded bg-[#3b3b3b]">
                  <input 
                    type="Date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 text-white bg-transparent border-none outline-none"
                  />
                </div>
                <p className="font-['Poppins'] text-lg font-semibold">To</p>
                <div className="rounded bg-[#3b3b3b]">
                  <input 
                    type="Date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 text-white bg-transparent border-none outline-none"
                  />
                </div>
                <button
                  onClick={fetchAlertsByDateRange}
                  className="p-2 rounded-full hover:bg-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="size-10"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-center">
                {" "}
                <button
                onClick={handleExport}
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-center text-sm text-black backdrop-blur-sm md:mt-0 h-11 w-28 md:font-medium"
                >
                  <span className="justify-start font-['Poppins'] text-lg font-medium text-black">
                    Export
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="scrollbar-customd m-4 md:h-[86%] overflow-x-auto rounded-2xl bg-[#101010]/90 backdrop-blur-sm">
            <div className="min-w-[30px] overflow-x-auto">
              <table className="w-full text-white">
                <thead className="sticky top-0 bg-[#101010]/90 text-base backdrop-blur-sm">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Sensor</th>
                    <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Model</th>
                    <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Severity</th>
                    <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Message</th>
                    <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Value</th>
                    <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                        No alerts found
                      </td>
                    </tr>
                  ) : (
                    alerts.map((alert) => (
                      <tr key={alert._id} className="border-b border-gray-700">
                        <td className="px-4 py-4">{alert.sensor}</td>
                        <td className="px-4 py-4">{alert.model}</td>
                        <td className="px-4 py-4">{alert.severity}</td>
                        <td className="px-4 py-4">{alert.message}</td>
                        <td className="px-4 py-4">{alert.value}</td>
                        <td className="px-4 py-4">
                          {new Date(alert.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alertslogs;
