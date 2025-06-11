import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  PerspectiveCamera,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import down from "../../images/red-arrow.png";
import up from "../../images/green-arrow.png";
import { useNavigate } from "react-router-dom";
import axios from 'axios';


const Model = ({ socketData }) => {
  console.log("Socket Data:", socketData);
  const navigate = useNavigate();
  const group = useRef();
  const { scene } = useGLTF("./potline.gltf");
  const [hoveredMesh, setHoveredMesh] = useState(null);
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [popupPosition, setPopupPosition] = useState({
    x: 0,
    y: 0,
    show: false,
  });
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const lastUpdate = useRef(0);
  const [hoveredObject, setHoveredObject] = useState(null);

  const nameMapping = {
    CBT1A2: "s1",
    CBT1A1: "s2",
    CBT2A2: "s3",
    CBT2A1: "s4",
    CBT3A2: "s5",
    CBT3A1: "s6",
    CBT4A2: "s7",
    CBT4A1: "s8",
    CBT5A2: "s9",
    CBT5A1: "s10",
    CBT6A2: "s11",
    CBT6A1: "s12",
    CBT7A2: "s13",
    CBT7A1: "s14",
    CBT8A2: "s15",
    CBT8A1: "s16",
    CBT9A2: "s17",
    CBT9A1: "s18",
    CBT10A2: "s19",
    CBT10A1: "s20",
    CBT11A2: "s21",
    CBT11A1: "s22",
    CBT12A2: "s23",
    CBT12A1: "s24",
    CBT13A2: "s25",
    CBT13A1: "s26",
    CBT14A2: "s27",
    CBT14A1: "s28",
    CBT15A2: "s29",
    CBT15A1: "s30",
    CBT16A2: "s31",
    CBT16A1: "s32",
    CBT17A2: "s33",
    CBT17A1: "s34",
    CBT18A2: "s35",
    CBT18A1: "s36",
    CBT19A2: "s37",
    CBT19A1: "s38",
    CBT20A2: "s39",
    CBT20A1: "s40",
    CBT21A2: "s41",
    CBT21A1: "s42",
    CBT22A2: "s43",
    CBT22A1: "s44",
    CBT23A2: "s45",
    CBT23A1: "s46",
    CBT24A2: "s47",
    CBT24A1: "s48",
    CBT25A2: "s49",
    CBT25A1: "s50",
    CBT26A2: "s51",
    CBT26A1: "s52",
    CBT27A2: "s53",
    CBT27A1: "s54",
    CBT1B2: "s55",
    CBT1B1: "s56",
    CBT2B2: "s57",
    CBT2B1: "s58",
    CBT3B2: "s59",
    CBT3B1: "s60",
    CBT4B2: "s61",
    CBT4B1: "s62",
    CBT5B2: "s63",
    CBT5B1: "s64",
    CBT6B2: "s65",
    CBT6B1: "s66",
    CBT7B2: "s67",
    CBT7B1: "s68",
    CBT8B2: "s69",
    CBT8B1: "s70",
    CBT9B2: "s71",
    CBT9B1: "s72",
    CBT10B2: "s73",
    CBT10B1: "s74",
    CBT11B2: "s75",
    CBT11B1: "s76",
    CBT12B2: "s77",
    CBT12B1: "s78",
    CBT13B2: "s79",
    CBT13B1: "s80",
    CBT14B2: "s81",
    CBT14B1: "s82",
    CBT15B2: "s83",
    CBT15B1: "s84",
    CBT16B2: "s85",
    CBT16B1: "s86",
    CBT17B2: "s87",
    CBT17B1: "s88",
    CBT18B2: "s89",
    CBT18B1: "s90",
    CBT19B2: "s91",
    CBT19B1: "s92",
    CBT20B2: "s93",
    CBT20B1: "s94",
    CBT21B2: "s95",
    CBT21B1: "s96",
    CBT22B2: "s97",
    CBT22B1: "s98",
    CBT23B2: "s99",
    CBT23B1: "s100",
    CBT24B2: "s101",
    CBT24B1: "s102",
    CBT25B2: "s103",
    CBT25B1: "s104",
    CBT26B2: "s105",
    CBT26B1: "s106",
    CBT27B2: "s107",
    CBT27B1: "s108",
  };

  const reverseNameMapping = Object.fromEntries(
    Object.entries(nameMapping).map(([key, value]) => [value, key])
  );

  useEffect(() => {
    const handleMouseMove = (event) => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (hoveredMesh) {
        setPopupPosition({
          x: event.clientX,
          y: event.clientY,
          show: true,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hoveredMesh]);

  const handleClick = (e) => {
    e.stopPropagation();
    const partName = reverseNameMapping[e.object.name];

    if (partName) {
      setHoveredMesh(partName);
      navigate(`/CollectorBar?part=${encodeURIComponent(partName)}`);
    }
  };

  useFrame(({ camera, clock }) => {
    if (!group.current) return;

    const currentTime = clock.getElapsedTime();
    if (currentTime - lastUpdate.current < 0.05) return;
    lastUpdate.current = currentTime;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(group.current, true);

    if (!group.current) return;

    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (!object) return;

      const partName = reverseNameMapping[object.name];

      if (partName) {
        setHoveredObject(object);
        setHoveredMesh(partName);

        let value = "N/A";
        let setmax = "N/A";
        let setmin = "N/A";

        // Find data in socketData array
        const entry = socketData.find(data => data.name === partName);
        if (entry) {
          value = entry.value;
          setmax = entry.maxTemp;
          setmin = entry.minTemp;
        }

        setHoveredInfo({
          name: partName,
          value: `${parseFloat(value).toFixed(2)}°C`,
          maxTemp: `${parseFloat(setmax).toFixed(2)}°C`,
          minTemp: `${parseFloat(setmin).toFixed(2)}°C`,
        });
      } else {
        setHoveredObject(null);
        setHoveredMesh(null);
        setPopupPosition(prev => ({ ...prev, show: false }));
      }
    } else {
      setHoveredObject(null);
      setHoveredMesh(null);
      setPopupPosition(prev => ({ ...prev, show: false }));
    }
  });

  return (
    <>
      <primitive
        ref={group}
        object={scene}
        position={[0, -2, 0]}
        scale={1}
        onClick={handleClick}
      />
      {popupPosition.show && hoveredObject?.position && hoveredInfo && (
        <Html
          position={[
            hoveredObject.position.x,
            hoveredObject.position.y,
            hoveredObject.position.z,
          ]}
          zIndexRange={[100, 0]}
        >
          <div className="relative text-white pointer-events-none">
            <div className="w-[159px] h-[79.50px] ml-1 bg-gradient-to-t from-[#101010cc] to-[#0073FFA3] rounded-2xl border border-white grid grid-cols-2 place-items-center">
              <div className="w-full text-xs font-semibold text-center">
                {hoveredInfo.name}
              </div>
              <div className="w-full text-base font-bold text-center">
                {hoveredInfo.value}
              </div>
              <div className="h-[17px] flex items-center justify-center gap-2.5 w-full">
                <img src={up} alt="up" className="w-[17px] h-[17px]" />
                <div className="text-white text-[11px] font-medium">
                  {hoveredInfo.maxTemp}
                </div>
              </div>
              <div className="h-[17px] flex items-center justify-center gap-2.5 w-full">
                <img src={down} alt="up" className="w-[17px] h-[17px]" />
                <div className="text-white text-[11px] font-medium">
                  {hoveredInfo.minTemp}
                </div>
              </div>
            </div>
          </div>
        </Html>
      )}
    </>
  );
};

const ThreeModel = ({ socketData, lastButtonClicked }) => {
  const controlsRef = useRef();
  const [potId, setPotId] = useState('');
  const [latestTimestamp, setLatestTimestamp] = useState('');
  const [devices, setDevices] = useState([]);
  const [deviceStats, setDeviceStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get('http://34.100.168.176:4000/api/admin/getAllDevices');
        if (response.data && response.data.success) {
          const devicesData = response.data.data || [];
          setDevices(devicesData);
          
          // Calculate active/inactive counts
          const now = new Date().getTime();
          const activeCount = devicesData.filter(device => 
            device.sensorCreatedAt && 
            (now - new Date(device.sensorCreatedAt).getTime() <= 5 * 60 * 1000)
          ).length;
          
          setDeviceStats({
            total: devicesData.length,
            active: activeCount,
            inactive: devicesData.length - activeCount
          });
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchLatestTimestamp = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}api/v2/getLatestTimestamp`);
        const data = await response.json();
        setLatestTimestamp(data.latestTimestamp);
      } catch (error) {
        console.error('Error fetching timestamp:', error);
        setLatestTimestamp('N/A');
      }
    };

    const updateData = () => {
      const id = localStorage.getItem('id');
      setPotId(id || '');
      fetchLatestTimestamp();
    };

    // Initial fetch
    updateData();
    
    // Set up interval for updates
    const interval = setInterval(updateData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[500px] md:w-[95%] bg-[rgba(16,16,16,0.9)] backdrop-blur-sm lg:w-[96%] xl:w-[73%] 2xl:w-[73%]  2x:w-auto rounded-2xl m-4 lg:h-auto relative">
      <div className="absolute flex flex-col p-4 space-y-4 md:h-full md:w-full">
        {/* Top Section */}
        <div className="flex items-center justify-between w-full">
          {/* Buttons and Counter */}
          <div className="flex items-center gap-4">
            <p className="text-2xl font-semibold text-white">{potId || 'N/A'}</p>
          </div>
          {/* Status */}
          <div className="flex items-center gap-6">
            <p className="font-bold text-white">
              Active: <span className="text-green-500">{deviceStats.active}</span>
            </p>
            <p className="font-bold text-white">
              Inactive: <span className="text-red-600">{deviceStats.inactive}</span>
            </p>
            <p className="font-bold text-white">
              Total Pots: <span className="text-[rgba(0,119,228)]">{deviceStats.total}</span>
            </p>
          </div>
        </div>

        {/* Last Updation Section */}
        <div className="container mx-auto">
          <div className="flex justify-end">
            <div className="w-[90%] md:w-fit rounded-lg grid grid-cols-2 justify-center items-center">
              <div className="font-semibold text-gray-300 text-md">
                Last Updation:
              </div>
              <div className="text-base font-semibold text-white">
                {latestTimestamp || 'Loading...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Canvas className="">
        <ambientLight intensity={2} />
        <directionalLight position={[1, 5, 5]} intensity={2} />
        <PerspectiveCamera makeDefault position={[18, 1, 0]} />
        <Model
          socketData={socketData}
        />
        <OrbitControls
          ref={controlsRef}
          minDistance={12}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          enableZoom={true}
          enablePan={true}
        />
      </Canvas>
    </div>
  );
};

export default ThreeModel;
