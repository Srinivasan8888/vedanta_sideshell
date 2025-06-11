import React, { useState, useEffect, useMemo, useRef } from "react";
import Switcher13 from "./miscellaneous/Switcher13.jsx";
import Chartline from "./miscellaneous/chartline.jsx";
import Chartbar from "./miscellaneous/chartbar.jsx";
import 'chartjs-plugin-annotation';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart as ChartJS, registerables } from 'chart.js';
import html2canvas from 'html2canvas';
import API from '../Axios/AxiosInterceptor';
// Register all necessary components and plugins
ChartJS.register(...registerables, annotationPlugin);

const DashboardChart = ({ socketData = [], onChartClick }) => {
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);
  
  const [potId, setPotId] = useState('');
  const [isBarChart, setIsBarChart] = useState(false);
  const [thresholds, setThresholds] = useState({ info: 240, critical: 300 }); // Default values
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      borderColor: "rgb(0, 119, 228)",
      backgroundColor: "rgba(0, 119, 228, 0.1)",
      tension: 0,
      fill: true,
      borderWidth: 4,
      // pointStyle: false,
    }]
  });
  
  const [previousSocketData, setPreviousSocketData] = useState(socketData);
  const [selectedButton, setSelectedButton] = useState(localStorage.getItem('selectedButton') || '1M');
  
  // console.log('chartsocket', socketData);
  
  useEffect(() => {    
    // Clear previous data when new data arrives
    setPreviousSocketData(null);
    if (socketData) {
      setPreviousSocketData(socketData);
    }
  }, [socketData]);

  useEffect(() => {
    try {
      // Start with empty chart data if no valid data
      if (!socketData?.averages || !socketData?.timestamps) {
        setChartData({
          labels: [],
          datasets: [{
            data: [],
            borderColor: "rgb(0, 119, 228)",
            backgroundColor: "rgba(0, 119, 228, 0.1)",
            tension: 0,
            fill: true,
            borderWidth: 4,
          }]
        });
        return;
      }

      // Process new data only if available
      const chartData = {
        labels: socketData.timestamps.map(date => 
          new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        ),
        datasets: [{
          data: socketData.averages.map(avg => parseFloat(avg).toFixed(2)),
          borderColor: "rgb(0, 119, 228)",
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;

            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, "rgba(0, 119, 228, 0.1)");
            gradient.addColorStop(0.5, "rgba(0, 119, 228, 0.3)");
            gradient.addColorStop(1, "rgba(0, 119, 228, 0.8)");

            return gradient;
          },
          tension: 0.4,
          fill: true,
          borderWidth: 4,
        }]
      };
      
      // console.log('Processed chart data:', chartData);
      setChartData(chartData);
      
      // console.log('Min Avg Temp:', socketData.minAvgTemp);
      // console.log('Max Avg Temp:', socketData.maxAvgTemp);
    } catch (error) {
      console.error('Error processing data:', error);
      setChartData({
        labels: [],
        datasets: [{
          data: [],
          borderColor: "rgb(0, 119, 228)",
          backgroundColor: "rgba(0, 119, 228, 0.1)",
          tension: 0,
          fill: true,
          borderWidth: 4,
        }]
      });
    }
  }, [socketData]);

  const handleClick = (event) => {
    const buttonId = event.target.id;
    setSelectedButton(buttonId);
    localStorage.setItem('selectedButton', buttonId); // Store the selected button in local storage
    onChartClick(buttonId);
  };

  
  // const userData = {
  //   labels: temp.map((data) => data.month),
  //   datasets: [
  //     {
  //       data: temp.map((data) => data.temp),
  //       borderColor: "rgb(0, 119, 228)",
  //       backgroundColor: (context) => {
  //         const chart = context.chart;
  //         const { ctx, chartArea } = chart;
  //         if (!chartArea) return null;

  //         const gradient = ctx.createLinearGradient(
  //           0,
  //           chartArea.bottom,
  //           0,
  //           chartArea.top
  //         );
  //         gradient.addColorStop(0, "rgba(0, 119, 228, 0.1)");
  //         gradient.addColorStop(0.5, "rgba(0, 119, 228, 0.3)");
  //         gradient.addColorStop(1, "rgba(0, 119, 228, 0.8)");

  //         return gradient;
  //       },
  //       tension: 0,
  //       fill: true,
  //       borderWidth: 4,
  //     },
  //   ],
  // };

const options = useMemo(() => ({
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: false, // Disable the default tooltip
      external: function (context) {
        // Get the tooltip element or create it if it doesn't exist
        let tooltipEl = document.getElementById("chartjs-tooltip");
        if (!tooltipEl) {
          tooltipEl = document.createElement("div");
          tooltipEl.id = "chartjs-tooltip";
          tooltipEl.style.position = "absolute";
          tooltipEl.style.pointerEvents = "none";
          tooltipEl.style.backgroundColor = "rgba(0, 119, 228, 0.9)";
          tooltipEl.style.color = "#fff";
          tooltipEl.style.borderRadius = "8px";
          tooltipEl.style.width = "130px"; // Fixed width
          tooltipEl.style.height = "65px"; // Fixed height
          tooltipEl.style.padding = "10px";
          tooltipEl.style.fontSize = "14px";
          tooltipEl.style.textAlign = "center";
          tooltipEl.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
          document.body.appendChild(tooltipEl);
        }

        // Hide if no tooltip is active
        const tooltipModel = context.tooltip;
        if (tooltipModel.opacity === 0) {
          tooltipEl.style.opacity = 0;
          return;
        }

        // Set tooltip content
        if (tooltipModel.body) {
          const title = tooltipModel.dataPoints[0].raw;
          const bodyLines = tooltipModel.title || [];

          let innerHtml = `<div style="font-size: 18px; font-weight: bold;">${title} °C</div>`;
          bodyLines.forEach((body) => {
            innerHtml += `<div style="font-size: 12px; margin-top: 5px;">${body}</div>`;
          });

          tooltipEl.innerHTML = innerHtml;
        }

        // Position the tooltip
        const { offsetLeft, offsetTop } = context.chart.canvas;
        tooltipEl.style.left = offsetLeft + tooltipModel.caretX + "px";
        tooltipEl.style.top = offsetTop + tooltipModel.caretY + "px";
        tooltipEl.style.opacity = 1;
      }
    },
    annotation: {
      annotations: {
        infoLine: {
          type: 'line',
          yMin: thresholds.info,
          yMax: thresholds.info,
          borderColor: '#4CAF50',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            content: `Info (${thresholds.info}°C)`,
            enabled: true,
            position: 'right',
            color: '#4CAF50',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            font: {
              weight: 'bold'
            }
          }
        },
        criticalLine: {
          type: 'line',
          yMin: thresholds.critical,
          yMax: thresholds.critical,
          borderColor: '#F44336',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            content: `Critical (${thresholds.critical}°C)`,
            enabled: true,
            position: 'right',
            color: '#F44336',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            font: {
              weight: 'bold'
            }
          }
        }
      }
    }
  },
  scales: {
    y: {
      position: "right",
      title: {
        display: true,
        text: "Temperature (°C)",
        color: "white",
        pointStyle: false
      },
      ticks: {
        padding: 20,
        color: "white",
        callback: function(value) {
          return value.toFixed(2) + " °C";
        }
      }
    },
    x: {
      title: {
        display: true,
        text: "Timestamp",
        color: "white"
      },
      ticks: {
        color: "white"
      }
    }
  },
  elements: {
    point: {
      radius: 1,
      hoverRadius: 7,
      pointStyle: 'circle',
      hoverPointStyle: 'circle'
    }
  }
}), [thresholds]);

useEffect(() => {
  // Fetch threshold values from API
  const fetchThresholds = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}api/admin/getUserAlertRange`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data) {
        setThresholds({
          info: parseInt(data.info, 10),
          critical: parseInt(data.critical, 10)
        });
      }
    } catch (error) {
      console.error('Error fetching thresholds:', error);
    }
  };

  fetchThresholds();
}, []);

  const toggleChartType = () => {
    setIsBarChart(!isBarChart);
  };

  const handleExport = async () => {
    if (!chartContainerRef.current) return;
    
    try {
      const canvas = await html2canvas(chartContainerRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: null,
        allowTaint: true
      });
      
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      const potName = potId || 'chart';
      link.download = `${potName}-${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };
  
// ... existing code ...

// Register tooltip plugin
const tooltipPlugin = {
  id: "hoverline",
  beforeDraw: (chart) => {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const ctx = chart.ctx;
      const tooltip = chart.tooltip._active[0];
      const x = tooltip.element.x;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, chart.scales.y.top);
      ctx.lineTo(x, chart.scales.y.bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.stroke();
      ctx.restore();
    }
  },
};
ChartJS.register(tooltipPlugin);

// Register danger line plugin
const dangerLinePlugin = {
  id: "dangerLine",
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    const yAxis = chart.scales.y;
    const xAxis = chart.scales.x;

    // Get the y-coordinate for value 800
    const yValue = yAxis.getPixelForValue(80);

    ctx.save();
    ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(xAxis.left, yValue);
    ctx.lineTo(xAxis.right, yValue);
    ctx.stroke();
    ctx.restore();
  },
};
ChartJS.register(dangerLinePlugin);

  useEffect(() => {
    setInterval(() => {
    const handleStorageChange = () => {
      const id = window.localStorage.getItem('id');
      setPotId(id);
    };

    // Initial load
    handleStorageChange();
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };}, [500]);
  }, []);

// ... existing code ...
  
  return (
    <div className="h-[490px] lg:w-[96.8%] pt-2 xl:pt-0 xl:h-[90%] 2xl:h-auto lg:mt-2 xl:w-[73%]  2xl:w-[73%] 2xl:pt-1 bg-[rgba(16,16,16,0.9)] m-4 rounded-xl text-white overflow-hidden">
      {/* <div className="w-full h-full backdrop-blur-sm"> */}
        <div className="h-[180px] md:h-[75%] w-[100%]">
          <div className="flex flex-col px-4 mt-4 xl:mt-0 md:flex-row md:justify-around">
            <p className="mt-2 mb-3 text-xl font-semibold text-center xl:text-base md:text-left md:mb-0 md:mt-0 ">
            {potId || 'N/A'}
            </p>

            <div className="flex flex-row justify-center gap-4 mt-1 md:flex-row md:gap-5 md:mx-10 md:space-y-0 ">
              <p className="text-sm md:text-base xl:text-base">
                Max Value:{" "}
                <span className="font-bold text-[rgba(0,119,228)] xl:text-base"> 
                  {socketData?.maxAverage ? `${socketData.maxAverage.toFixed(2)}°C` : 'NaN'}
                </span>
              </p>
              <p className="text-sm md:text-base xl:text-base">
                Min Value:{" "}
                <span className="font-bold text-[rgba(0,119,228)] xl:text-base"> 
                  {socketData?.minAverage ? `${socketData.minAverage.toFixed(2)}°C` : 'NaN'}
                </span>
              </p>
              <p className="text-sm md:text-base xl:text-base">
                Avg Value:{" "}
                <span className="font-bold text-[rgba(0,119,228)] xl:text-base"> 
                  {socketData?.averages ? 
                    (socketData.averages.reduce((a, b) => a + b, 0) / socketData.averages.length).toFixed(2) : 
                    'NaN'
                  }°C
                </span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mt-3 md:justify-start md:mt-0">
              <Switcher13 toggleChartType={toggleChartType} />
              <button
                type="button"
                onClick={handleExport}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-xs md:text-sm xl:text-xs 2xl:text-sm px-3 md:px-4 xl:px-3 2xl:px-4 py-1.5 md:py-2 xl:py-1.5 2xl:py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Export
              </button>
            </div>
          </div>

          <div className="w-full h-full" ref={chartContainerRef}>
            {isBarChart ? (
              <Chartbar 
                ref={chartRef}
                chartData={chartData} 
                options={options} 
              />
            ) : (
              <Chartline 
                ref={chartRef}
                chartData={chartData} 
                width={"100%"} 
                options={options} 
              />
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 pb-2 md:mt-1 md:justify-around">
            {['1D', '3D', '1W', '1M', '6M'].map((id) => (
              <button
                key={id}
                type="button"
                id={id}
                onClick={handleClick}
                className={`w-20 md:w-16 xl:h-8 xl:w-24 2xl:w-28 2xl:h-12 
                  ${selectedButton === id ? 'text-white bg-blue-700 hover:bg-blue-800' : 'text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800'} 
                  focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs md:text-[10px] 2xl:text-sm 
                  px-2 md:px-1.5 2xl:px-4 py-1 md:py-1 2xl:py-2.5 text-center 
                  dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800`}
              >
                {id === '1D' ? '1 Day' : id === '3D' ? '3 Days' : id === '1W' ? '1 Week' : id === '1M' ? '1 Month' : '6 Months'}
              </button>
            ))}
          </div>
        </div>
      {/* </div> */}
    </div>
  );
};

export default DashboardChart;
