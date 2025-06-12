import React from "react";

const Dashboard = () => {
  return (
    <div className="h-full w-full">
      <div className="flex flex-col h-full w-full text-2xl font-bold text-black md:grid md:grid-cols-2 md:grid-rows-2 gap-4 p-4">
        <div className="order-2 rounded-lg overflow-hidden md:order-1">
          <div className="grid h-full grid-col gap-2">
            <div className="bg-gray-900 opacity-40 border-2 border-gray-100 rounded-2xl shadow-md overflow-hidden">
              <div className="flex items-center justify-center">
                
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 flex items-center justify-center border-2 rounded-2xl md:order-2 shadow-md">2</div>
        <div className="order-3 flex items-center justify-center border-2 rounded-2xl shadow-md">3</div>
        <div className="order-4 flex items-center justify-center border-2 rounded-2xl shadow-md">4</div>
      </div>
    </div>

  );
};

export default Dashboard;
