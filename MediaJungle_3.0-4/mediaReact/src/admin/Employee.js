import axios from "axios";
import API_URL from '../Config';

const SiteSetting= `${API_URL}/api/v2/SiteSetting`;
const videoSetting= `${API_URL}/api/v2/videoSetting`;
const Othersettings=`${API_URL}/api/v2/Othersettings`;
const Contactsettings= `${API_URL}/api/v2/Contactsettings`;
const Companysiteurl= `${API_URL}/api/v2/Companysiteurl`;
const Socialsettings=`${API_URL}/api/v2/Socialsettings`
const Paymentsettings= `${API_URL}/api/v2/Paymentsettings`;
const Emailsettings= `${API_URL}/api/v2/Emailsettings`;
const Mobilesettings=`${API_URL}/api/v2/Mobilesettings`;
const seoSettings=`${API_URL}/api/v2/seoSettings`;
const Video= `${API_URL}/api/save`;

  

class Employee{
    setseoSettings(seosettings){
        return axios.post(seoSettings,seosettings);
    }
    setVideo(Videos){

        return axios.post(Video,Videos);
    }
    setMobilesettings( mobilesettings){
        return axios.post(Mobilesettings,mobilesettings);
    }
    setEmailsettings(emailsettings){
        return axios.post(Emailsettings,emailsettings);
    }
    setPaymentsettings( paymentsettings){
        return axios.post(Paymentsettings,paymentsettings);
    }
    setSocialsettings(socialsettings){
        return axios.post(Socialsettings,socialsettings);
    }
    setCompanysiteurl( companysiteurl){
        return axios.post(Companysiteurl,companysiteurl);
    }
    setContactsettings(contactsettings){
        return axios.post(Contactsettings,contactsettings);
    }
    setOthersettings( othersettings){
        return axios.post(Othersettings,othersettings);
    }
    setVideoSetting(videosetting){
        return axios.post(videoSetting,videosetting);
    }
    setSiteSetting( sitesetting){
        return axios.post(SiteSetting,sitesetting);
    }

}
export default new Employee()
