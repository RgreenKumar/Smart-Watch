import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation,useNavigate } from 'react-router-dom';
import Dashboard from "./admin/Dashboard";
import "./App.css";
import "./css/sb-admin-2.css";
import "./css/style.css";
// import './index.css';
import API_URL from './Config';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import AddUser from "./admin/AddUser";
import Video_setting from "./admin/Video_setting";
import Email_setting from "./admin/Email_setting";
import Social_setting from "./admin/Social_setting";
import Payment_setting from "./admin/Payment_setting";
import Siteurl_setting from "./admin/Siteurl_setting";
import Other_setting from "./admin/Other_setting";
import Contact_setting from "./admin/Contact_setting";
// import SEO_setting from "./admin/Footer_setting";
// import Mobile_setting from "./admin/Mobile_setting";
import Users from "./admin/Users";
// import Setting from "./admin/Setting";
import Setting_sidebar from "./admin/Setting_sidebar";
import AddCastCrew from "./admin/AddCastCrew";
import Profile from "./admin/Profile";
import Video from "./admin/Video";
import AddVideo from "./admin/AddVideo";
import Audio from "./admin/Audio";
import AddAudio from "./admin/AddAudio";
import AddCategory from "./admin/AddCategory";
import ViewCategory from "./admin/ViewCategory";
import AddLanguage from './admin/AddLanguage';
import ViewLanguage from "./admin/ViewLanguage";
import Login from "./admin/login";
import UserLogin from './user/Screens/UserLogin'
import EditCategory from "./admin/EditCategory";
import AddCertificate from "./admin/AddCertificate";
import EditCertificate from "./admin/EditCertificate";
import ViewCertificate from "./admin/ViewCertificate";
import Editaudio1 from "./admin/Editaudio1";
import ListAudio from "./admin/ListAudio";
import EditAudio from "./admin/EditAudio";
import EditTag from "./admin/EditTag";
import ViewTag from "./admin/ViewTag";
import Licence from "./admin/Licence";
import Subscription_details from "./user/Subscription_details";
import Home from "./user/Screens/HomeScreen";
import EditLanguage from "./admin/EditLanguage";
import EditVideo from "./admin/EditVideo";
import AddTag from "./admin/AddTag";
import AddAud from "./admin/AddAud";
import MoviesPage from "./user/Screens/Movies";
import Watch from './admin/player';
import PrivateRoute from './admin/PrivateRoute';
import Register from './user/Screens/Register'
import AboutUs from './user/Screens/AboutUs';
import SingleMovie from './user/Screens/SingleMovie';
import ViewAudio from "./admin/ViewAudio";
import PlanDetails from './user/PlanDetails';
import UserProfileScreen from './user/UserProfileScreen';
import VideoHomescreen from './user/VideoHomescreen';
import Test from './user/Test';
import Userplayer from './user/Userplayer';
import UserPrivateRouter from './user/UserPrivateRouter';
import AdminSignin from './admin/AdminSignin';
import About_us from './admin/About_us';
import EditComponent from './admin/EditComponent';
import Adminplan from './admin/Adminplan';
import PrivateRoutes from './user/PrivateRoutes';
import PlanDetailsList from './admin/PlanDetailsList';
import Editplan from './admin/Editplan';
import PlanDescription from './admin/PlanDescription';
import ContactUs from './user/Screens/ContactUs';
import WatchPage from './user/Screens/WatchPage';
import VideoScreen from './user/VideoScreen';
import AdminLayout from './admin/AdminLayout';
import Viewcastandcrew from './admin/Viewcastandcrew';
import Editcastandcrew from './admin/Editcastandcrew';
import Userforgetpassword from './user/Screens/Userforgetpassword';
import PaymentHistory from './admin/PaymentHistory';
import TenureList from './admin/TenureList';
import AddTenure from './admin/AddTenure';
import SiteSetting from './admin/SiteSetting';
import Edittenure from './admin/Edittenure';
import PlanFeatures from './admin/PlanFeatures';
import AddFeature from './admin/AddFeature';
import EditFeature from './admin/EditFeature';

import PrivacyPolicy from './user/Screens/PrivacyPolicy';
import Banner_setting from './admin/Banner_setting';
import Footer_setting from './admin/Footer_setting';
import AudioContainer_settings from './admin/AudioContainer_settings';
import AudioBanner_settings from './admin/AudioBanner_settings';
import Container from './admin/Container';
import AudioHomecreeenContainer from './user/Screens/AudioBanner';
import AudioHomecreeen from './user/Screens/AudioHomescreen';
import Aud from './admin/appptest';
import ViewProfile from './user/ViewProfile';
import LibraryScreen from './user/LibraryScreen';
import AudioHomescreen from './user/Screens/AudioHomescreen';

import MusicScreen from './user/Screens/MusicScreen';

import Ads from './admin/Ads';
import AddAds from './admin/AddAds';

import Mailsetting from './admin/Mailsetting';
import ForgetPasswordUser from './user/Screens/ForgetPasswordUser';
import AdminRouteGuard from './admin/AdminRouteGuard';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(); 
  const [isuserLogged, setIsuserLogged] = useState();
  const log=localStorage.getItem('login'); 
  const storedData = localStorage.getItem('mySessionData')
  localStorage.setItem('mySessionData', false);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v2/checkAdminRole`);
  
        if (!response.ok) {
          // If backend responds with a status other than 200
          throw new Error(`Error: ${response.status}`);
        }
  
        const data = await response.json();
        // console.log("data", data.adminExists);
        // Set session storage based on admin existence
        sessionStorage.setItem('initialsignup', data.adminExists.toString());
      } catch (error) {
        console.error('Failed to check admin role:', error);
        // Mark as error in session storage
        sessionStorage.setItem('initialsignup', 'error');
        throw error
      } finally {
        setLoading(false);
      }
    };  
    checkAdminRole();
  }, []);

  useEffect(() => {
    const fetchData = async () => {       
  };
  fetchData();
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      const storedData = localStorage.getItem('mySessionData')
      const val2=localStorage.getItem('login')
      // console.log("inadd"+log)
      setIsLogged(localStorage.getItem('mySessionData'));
      setIsuserLogged(val2);
      // console.log("inside the app.js sessionvakue :", storedData);
      // console.log("inside the app.js val2 :", val2);
      // console.log("inside the app.js Logged 2:", isLogged);
          
    
  };
  
  fetchData();
  }, []);

  const isAuthenticated = isLogged && isuserLogged; // Combine both conditions
  const handleLogin = () => {
    const val=localStorage.getItem('mySessionData')
    const val2=localStorage.getItem('login')
    setIsLogged(val);
    setIsuserLogged(val2);
    // console.log("inside the app.js val :", val);
    // console.log("inside the app.js val2 :", val2);
    // console.log("inside the app.js Logged 2:", isuserLogged);
    // console.log("inside the app.js Logged :", isLogged);// Log the state after it's updated
  };


  if (loading) {  return <div>Loading...</div>;  }
  return (

  <div >
       {/* <Router> */}
       <Toaster
  position="top-right"
  reverseOrder={false}
  toastOptions={{
    style: {
      marginTop: '100px', // Adjust the margin-top as needed
    },
  }}
/>

  {/* Place Toaster for notifications */}
    <Routes>
      <Route
        path="/"
        element={<UserPrivateRouter isAuthenticated={true} element={<MoviesPage />} />}
      />
      <Route path='AudioHomescreen' element= {<AudioHomescreen/>} />
      <Route
        path="/AdminSignin"
        element={<AdminRouteGuard element={<AdminSignin />} />}
      />
          <Route path='Home' element={<Home />} />
          
          
          <Route path='MusicPage' element={<MusicScreen />} />
          <Route path='VideoHomescreen' element={<VideoHomescreen />} />
          <Route path='test' element={<Test/>} />
          <Route path='UserLogin' element={<UserLogin />} />
          <Route path='Register' element={<Register />} />
          <Route path='AboutUs' element={<AboutUs />} />
          <Route path='PrivacyPolicy' element={<PrivacyPolicy />} />
         
          <Route path='play' element={<UserPrivateRouter isAuthenticated={log} element={<Userplayer />} />} />
          <Route path='PlanDetails' element={<PlanDetails />} />
          <Route path="Subscriptiondetails" element={<Subscription_details />} />
          <Route path='UserProfileScreen' element ={<UserProfileScreen />} />
          <Route path='AdminSignin' element ={<AdminSignin />} />
          <Route path='Contactus' element={<ContactUs />}/>
          <Route path='watchpage/:id' element={<WatchPage />} />
         
          <Route path='userforgetpassword' element={<Userforgetpassword />} />
          <Route path='forgetPassword' element={<ForgetPasswordUser />} />
          <Route path='ViewProfile' element={<ViewProfile />} />
          <Route path='libraryScreen' element={<LibraryScreen />} />
  
          <Route path='admin' element={<Login />}  >
            <Route element={<PrivateRoutes/>} > 
            <Route element={<AdminLayout /> } > 
             <Route path='ViewCategory' element={<ViewCategory />}/>
            <Route path='AddLanguage' element={<AddLanguage/>} />
            <Route path='ViewLanguage' element={<ViewLanguage/>} />
            <Route path='EditCategory' element={<EditCategory/>} />
            <Route path='AddCertificate' element={<AddCertificate/>} />
            <Route path='EditCertificate' element={<EditCertificate/>} />
            <Route path='ViewCertificate' element={<ViewCertificate/>} />
            <Route path='Watch' element={<Watch/>} />
            <Route path='EditAudio' element={<Editaudio1/>} />
            <Route path='ViewAudio' element={<ViewAudio/>} />
            <Route path='ListAudio' element={<ListAudio/>} />
            <Route path='EditTag' element={<EditTag/>} />
            <Route path='ViewTag' element={<ViewTag/>} />
            <Route path='AddTag' element={<AddTag/>} />
            <Route path='EditLanguage' element={<EditLanguage/>} />
            <Route path='AddAud' element={<AddAud/>} />
            <Route path='EditVideo' element={<EditVideo/>} />
            <Route path='ViewAudio' element={<ViewAudio/>} />
            <Route path='EditAudio' element={<EditAudio/>} />
            <Route path='EditComponent' element={<EditComponent/>} />
            <Route path='About_us' element={<About_us/>} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='addUser'   element={<AddUser/>} />
            <Route path='profile' element={<Profile/>} />
            <Route path='video' element= {<Video/>} />
            <Route path='addVideo' element= {<AddVideo/>} />
            <Route path='playertest' element= {<AudioContainer_settings/>} />
            <Route path='addFeature' element= {<AddFeature/>} />

            <Route path='audio' element= {<Audio/>} />
            <Route path='addAudio' element= {<AddAudio/>} />
            <Route path='addCategory'element= {<AddCategory/>} />
            <Route path='addCastCrew' element= {<AddCastCrew/>} />
            <Route path='Viewcastandcrew' element={<Viewcastandcrew />} />
            <Route path='AddTenure' element={<AddTenure />} />
            <Route path='Editcastandcrew' element={<Editcastandcrew />} />
            <Route path='users' element= {<Users/>} />
            <Route path='paymentHistory/:userId' element={<PaymentHistory />} />
            <Route path='Adminplan' element= {<Adminplan/>} />
            <Route path='PlanDetailsList' element={<PlanDetailsList/>}/>
            <Route path='TenureList' element={<TenureList/>}/>
            <Route path='Edittenure/:id' element={<Edittenure />} />
            <Route path='Editplan' element={<Editplan />} />
            <Route path='Editfeature' element={<EditFeature />} />
            <Route path='planfeatures' element={<PlanFeatures />} />
            <Route path='PlanDescription' element={<PlanDescription />} />
{/*             
            <Route path='setting' element= {<Setting/>} /> */}
            <Route path='Ads' element={<Ads />} />
            <Route path='AddAds' element={<AddAds />} />
            <Route path='SiteSetting' element= {<SiteSetting/>} />
            <Route path='mailSetting' element={<Mailsetting />} />
            <Route path='Video_setting' element= {<Video_setting/>} />
            <Route path='Setting_sidebar' element= {<Setting_sidebar/>} />
            <Route path='Social_setting' element= {<Social_setting/>} />
            <Route path='Payment_setting' element= {<Payment_setting/>} />
            <Route path='Email_setting' element= {<Email_setting/>} />
            <Route path='Siteurl_setting' element= {<Siteurl_setting/>} />
            <Route path='Other_setting' element= {<Other_setting/>} />
            <Route path='Contact_setting' element= {<Contact_setting/>} />
            <Route path='Footer_setting' element= {<Footer_setting/>} />
            <Route path='Banner_setting' element= {<Banner_setting/>} />
            <Route path='container' element ={<Container />} />
            </Route>
            </Route> 
           </Route>
           <Route path='licence' element={<Licence/>} />
          {/* AudioContainer_settings */}
          <Route path='Aud' element ={<AudioBanner_settings />} />
        </Routes>
      {/* </Router> */}
    </div>
  );
};

export default App;
