import React, { useEffect, useState, useRef } from 'react';
import sort from "../../images/down-arrow.png";
import up from "../../images/green-arrow.png";
import down from "../../images/red-arrow.png";
import '../miscellaneous/Scrollbar.css';

const Bside = ({ socketData }) => {
  const [data, setData] = useState([]);
  const previousDataRef = useRef({});
  const [sortBy, setSortBy] = useState('default');
  // console.log("AsideData", socketData)

  useEffect(() => {
    if (socketData) {
      // Custom sorting function for CBT entries
      const parseKey = (key) => {
        const match = key.match(/CBT(\d+)(B\d)/i);
        return match ? { main: parseInt(match[1]), sub: parseInt(match[2].replace('B', '')) } : { main: 0, sub: 0 };
      };

           const entries = Object.entries(socketData).sort((a, b) => {
              const aKey = parseKey(a[0]);
              const bKey = parseKey(b[0]);
              return aKey.main - bKey.main || aKey.sub - bKey.sub;
            });
      
            // Map the data to include value, trend and arrow
            const newData = entries.map(([key, entry]) => ({
              key,
              value: `${entry.value} °C`,
              trend: entry.trend,
              arrow: entry.trend === 'up' ? up : down
            }));
      
            // Update previous data reference
            previousDataRef.current = socketData;
      
            // Sort the data after mapping
            const sortedData = newData.sort((a, b) => {
              if (sortBy === 'default') {
                const aKey = parseKey(a.key);
                const bKey = parseKey(b.key);
                return aKey.main - bKey.main || aKey.sub - bKey.sub;
              }
              if (sortBy === 'max' || sortBy === 'min') {
                const aValue = parseFloat(a.value.replace(' °C', ''));
                const bValue = parseFloat(b.value.replace(' °C', ''));
                return sortBy === 'max' ? bValue - aValue : aValue - bValue;
              }
              // For trend sorting
              if (sortBy === 'trend-up') {
                return b.trend.localeCompare(a.trend); // Up first
              }
              if (sortBy === 'trend-down') {
                return a.trend.localeCompare(b.trend); // Down first
              }
              return 0;
            });
      

      // Group into pairs (B1/B2)
      const groupedData = [];
      for (let i = 0; i < sortedData.length; i += 2) {
        groupedData.push({
          id: i/2,
          items: sortedData.slice(i, i + 2)
        });
      }

      setData(groupedData);
    }
  }, [socketData, sortBy]);

  return (
    <div className="h-[400px] xl:h-[300px] 2xl:h-[93.9%] md:w-[98%] xl:w-[28%] 2xl:w-[25%] rounded-2xl border-[1.5px] border-white bg-[rgba(16,16,16,0.9)] xl:m-2 2xl:m-3 text-white font-poppins">
      <div className="flex justify-between">
        <p className="mt-6 ml-8 font-semibold xl:mt-3 xl:ml-4 xl:text-lg 2xl:mt-4 2xl:ml-6 2xl:text-xl">B Side</p>
        <div className="relative flex items-center">
          <label htmlFor="currency" className="sr-only">Options</label>
          <select
            id="currency"
            name="currency"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-full py-0 pl-2 mr-8 text-gray-500 bg-transparent border-0 rounded-md appearance-none pr-7 mt-7 xl:mr-6 xl:mt-5 focus:outline-none sm:text-sm"
            style={{
              width: "12px",
              height: "19px",
              backgroundImage: `url(${sort})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "25px",
              appearance: "none",
            }}
          >
            <option value="default">Default</option>
            <option value="max">Max</option>
            <option value="min">Min</option>
            <option value="trend-up">Trend ▲</option>
            <option value="trend-down">Trend ▼</option>
          </select>
        </div>
      </div>

      <div className="flex mt-5 text-lg font-normal justify-evenly xl:mt-3 2xl:mt-5 xl:text-sm 2xl:text-base font-poppins">
        <p className="pl-6 xl:pl-3 2xl:pl-4">CBT Name</p>
        <p className="mr-6 xl:mr-3 2xl:mr-4">Value</p>
        <p></p>
      </div>
      <div className="h-[1px] mx-8 xl:mx-4 2xl:mx-6 mt-3 bg-white"></div>

      <div className="max-h-[70%] xl:max-h-[65%] 2xl:max-h-[72%] overflow-y-auto scrollbar-custom">
        {data.map((group) => (
          <React.Fragment key={group.id}>
            {group.items.map(({ key, value, arrow }) => (
              <React.Fragment key={key}>
                <div className="flex mt-5 ml-10 text-base font-light justify-evenly xl:mt-3 2xl:mt-5 xl:ml-6 2xl:ml-10 xl:text-xs 2xl:text-base font-poppins">
                  <p>{key}</p>
                  <p className="ml-6 xl:ml-3 2xl:ml-6">{value}</p>
                  <p><img src={arrow} alt="arrow" className="xl:w-2 xl:h-2 2xl:w-4 2xl:h-4" /></p>
                </div>
                <div className="h-[1px] mx-8 xl:mx-4 2xl:mx-8 mt-3 bg-white"></div>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Bside;
