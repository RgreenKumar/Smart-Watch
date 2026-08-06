import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../api/utils';
import favicon from "../images/favicon.ico"

// Create the context
export const GlobalStateContext = createContext();

const token =  sessionStorage.getItem("token")
const role=sessionStorage.getItem("role")
// Create a provider component
export const GlobalStateProvider = ({ children }) => {
  const [displayname, setDisplayname] = useState({
    admin_name: "",
              trainer_name: "",
              student_name: "", 
  });
  const [siteSettings, setsiteSettings] = useState({
    siteUrl: "",
    title:"",
    sitelogo: null,
    siteicon: null,
    titleicon: null,
  });
  const[Activeprofile,setActiveProfile]=useState("")
  useEffect(() => {
    const fetchactiveprofile=async()=>{
      try{
        const active = await axios.get(`${baseUrl}/Active/Environment`);
        if (active?.data?.environment) {
          sessionStorage.setItem("Activeprofile", active.data.environment);
          setActiveProfile(active.data.environment);
        } 
        if (active?.data?.currency) {
          sessionStorage.setItem("Currency", active.data.currency);
        } 
      }catch(error){
        console.log(error)
      }
    }
    fetchactiveprofile();
    
    const fetchLabels = async () => {
      try {
        // Check if data is already in sessionStorage
        const cachedSettings = sessionStorage.getItem("siteSettings");
        if (cachedSettings) {
          const parsedSettings = JSON.parse(cachedSettings);
          setsiteSettings(parsedSettings);
          updateSiteMeta(parsedSettings); 
        } else {
          let response;
          if (token && role==="ADMIN") {
           
            response = await axios.get(`${baseUrl}/Get/labellings`, {
              headers: {
                Authorization: token,
              },
            });
          
          } else {
            response = await axios.get(`${baseUrl}/all/get/labellings`);
          }

          setsiteSettings(response.data);
          sessionStorage.setItem("siteSettings", JSON.stringify(response.data)); // Cache data
          updateSiteMeta(response.data);
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
      }
    };

    const updateSiteMeta = (settings) => {
      // Update document title
      document.title = settings.title || "Learn Hub";

      // Update favicon
      const faviconLink = document.querySelector("link[rel='icon']");
      const faviconHref = settings.titleicon
        ? `data:image/x-icon;base64,${settings.titleicon}`
        : favicon; // Default to imported favicon.ico

      if (faviconLink) {
        faviconLink.href = faviconHref;
      } else {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = faviconHref;
        document.head.appendChild(newLink);
      }
    };

    fetchLabels();
  }, []);

  

  useEffect(() => {
    const fetchDisplayNameSettings = async () => {
      const savedDisplayName = sessionStorage.getItem("displayname");

      if (savedDisplayName) {
        // If data is found in sessionStorage, use it
        setDisplayname(JSON.parse(savedDisplayName));
      } else if (token) {
        try {
          const response = await axios.get(`${baseUrl}/get/displayName`, {
            headers: {
              Authorization: token,
            },
          });
          if (response.status === 200) {
            const data = response.data;
            setDisplayname(data);
            sessionStorage.setItem("displayname", JSON.stringify(data)); // Save in localStorage
        } else if (response.status === 204) {
          setDisplayname([]);
          sessionStorage.setItem("displayname", JSON.stringify([]));
        }   
          // else if(response.status === 204){
            
          //     // const data = response.data;
          //     // setDisplayname("");
          //     // sessionStorage.setItem("displayname", JSON.stringify(data)); // Save in localStorage
            
          // }
        } catch (error) {
          if (error.response.status === 404) {
            const emptyData = {
              admin_name: "",
              trainer_name: "",
              student_name: "",
            };
            setDisplayname(emptyData);
            sessionStorage.setItem("displayname", JSON.stringify(emptyData));
          }else{
            throw error
          }
        }
      }
    };

    fetchDisplayNameSettings();
  }, [token]);

  return (
    <GlobalStateContext.Provider value={{ displayname ,siteSettings,Activeprofile}}>
      {children}
    </GlobalStateContext.Provider>
  );
};
