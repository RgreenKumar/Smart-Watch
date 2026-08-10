import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TriggerList from './TriggerList'
import TriggerAdd from './TriggerAdd'
import { useLocation } from 'react-router-dom';
import VITE_API_URL from '../../Config';


const Trigger = () => {
  const [isOpenAddTrigger, setIsOpenAddTrigger] = useState(false);
  const [GetTrigger, setGetTrigger] = useState([]);
  const [Trigger, setTrigger] = useState({
      name: '',
      delay: '',
      triggerTypeId: '',
      text:'',
      departmentIds: [],
    });
  const [triggerTypes, setTriggerTypes] = useState([])
  const token = sessionStorage.getItem('token');
  const [departments, setDepartments] = useState([])
  const [editTriggerId,setEditTriggerId] = useState();
  
    const handleEdit = (triggerId) =>{
      setEditTriggerId(triggerId);
    }

  console.log(token);

  useEffect(() => {
    fetchDepartments();
    fetchTriggers();
    fetchTriggerType();
    }, []);
    
  
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${VITE_API_URL}/chatbot/getAllDepartment`)
      setDepartments(response.data)
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    }
  }

  const fetchTriggers = async () => {
    try {
      const response = await axios.get(`${VITE_API_URL}/chatbot/getAllTrigger`);
      setGetTrigger(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setGetTrigger([]);
    }
  };

  const fetchTriggerType = async () => {
    try {
      const response = await axios.get(`${VITE_API_URL}/chatbot/getTriggerType`)
      setTriggerTypes(response.data)
    } catch (error) {
      console.error('error fetching triggertype', error)
      setTriggerTypes([])
    }
  }

  console.log(GetTrigger)

   const location = useLocation();
  
    useEffect(() => {
      if (location.pathname.endsWith('/Trigger')) {
        setIsOpenAddTrigger(false);
        setEditTriggerId(undefined); // ✅ clear edit mode
        fetchTriggers();
      }
    }, [location]);
  return (
    <>
      {isOpenAddTrigger || editTriggerId ? (
      <TriggerAdd
        Trigger={Trigger}
        setTrigger={setTrigger}
        token={token}
        triggerTypes={triggerTypes}
        departments={departments}
        editTriggerId={editTriggerId}
        onCancel={() => {
        setIsOpenAddTrigger(false);
        // setEditDepId(undefined);
      }}
      />
      ):(
      <TriggerList 
        token={token}
        GetTrigger={GetTrigger}
        onAddTriggerClick={() => setIsOpenAddTrigger(true)}
        refreshTrigger={fetchTriggers}
        Edit={handleEdit}
      />
      )}
    </>
  )
}

export default Trigger