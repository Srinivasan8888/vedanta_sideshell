import { useState, React } from "react";

const Notifications = () => {
    const [activeTab, setActiveTab] = useState("alerts");
  return (
    <div className="h-[500px] font-poppins md:h-[94%] md:w-[25%] rounded-2xl border-[1.5px] border-white backdrop-blur-2xl bg-[rgba(16,16,16,0.5)] m-4">
      <div className="flex items-center justify-around gap-2 m-4 md:gap-2 h-[50px] md:h-[12%] ">
        <div className="grid w-full    rounded-lg bg-[rgba(16,16,16,0.7)] text-white border-[1.5px] border-white">
          <p className="mt-3">Total Pots</p>
          <span className="pb-2 font-semibold">1</span>
        </div>

        <div className="grid  w-full rounded-lg  bg-[rgba(16,16,16,0.7)] text-white border-[1.5px] border-white">
          <p className="mt-3">Active</p>
          <span className="pb-2 font-semibold">1</span>
        </div>

        <div className="grid  w-full rounded-lg  bg-[rgba(16,16,16,0.7)] text-white border-[1.5px] border-white">
          <p className="mt-3">Inactive</p>
          <span className="pb-2 font-semibold">0</span>
        </div>
      </div>

      <div className="h-[400px] md:h-[75%] m-4 xl:mt-5 rounded-2xl bg-[rgba(0,0,0,0.5)] flex flex-col items-center justify-center sm:text-xs text-white font-extrabold text-sm">
        <div className="flex justify-between w-full rounded-2xl">
          <button
            type="button"
            className={`w-full h-full rounded-tl-2xl py-2.5 px-5 mb-2 text-sm font-medium text-gray-900 focus:outline-none hover:dark:bg-[rgba(16,16,16,0.9)] hover:text-blue-700 focus:z-10 ${activeTab === "alerts" ? "border-b-2" : "border-b-2 border-[rgba(16,16,16,0.9)]"} dark:focus:ring-gray-700 dark:bg-[rgba(16,16,16,0.5)] dark:text-white  dark:hover:text-gray-400`}
            onClick={() => setActiveTab("alerts")}
          >
            Alerts
          </button>
          <button
            type="button"
            className={`w-full h-full rounded-tr-2xl py-2.5 px-5 mb-2 text-sm font-medium text-gray-900 focus:outline-none hover:dark:bg-[rgba(16,16,16,0.9)] hover:text-blue-700 focus:z-10 ${activeTab === "notifications" ? "border-b-2" : "border-b-2 border-[rgba(16,16,16,0.9)]"} dark:focus:ring-gray-700 dark:bg-[rgba(16,16,16,0.5)] dark:text-white  dark:hover:text-gray-400`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </div>
        <div className="w-[100%] h-[80%] mb-0 rounded-xl overflow-y-auto">
          {activeTab === "alerts" ? (
            <div className="mt-2 font-normal font-xs ">
              <div className="flex items-center justify-center">
                
                <div className="w-2 h-2 rounded-full bg-[rgb(18,125,255)] mr-2"></div>
                <p>Alert Contents</p>
                
              </div>
            </div>
          ) : (
            <div className="mt-2 font-normal font-xs ">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[rgb(18,125,255)] mr-2"></div>
                <p>Notification Contents</p>
              </div>
            </div>
          )}
        </div>
        <div className="w-[90%] h-[15%] m-4 bg-[rgba(16,16,16,0.52)] rounded-lg justify-around grid grid-cols-2 place-items-center border-white border-[2px] ">
          <div className="text-sm font-semibold ">Last Updation:</div>
          <div className="text-sm font-normal">04:05PM 30.08.2024</div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
