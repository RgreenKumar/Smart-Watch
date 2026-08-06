import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import baseUrl from '../../api/utils';
import testGrade from "../../icons/testGrade.svg"
import useGlobalNavigation from '../../AuthenticationPages/useGlobalNavigation';

const ListModuleTest = () => {
  const{courseName,courseId}=useParams();
  const navigate=useNavigate();
  const token=sessionStorage.getItem("token");
  const[moduleTest,setModuleTest]=useState([]);
  const[submitting,setsubmitting]=useState();
  const fetchModuleTests=async()=>{
    try{
      setsubmitting(true)
const response=await axios.get(`${baseUrl}/course/moduleTest/${courseId}`,{
  headers:{
    Authorization:token
  }
})
if(response.status===200){
  if (response?.data?.length === 0) {
    navigate(`/course/AddModuleTest/${courseName}/${courseId}`); // Redirect if no data is found
  } else {
    setModuleTest(response.data);
  }
}
    }catch(err){
      console.log(err)
      if(err?.response?.status===401){
        navigate("/unauthorized")
      }
    } finally{
      setsubmitting(false)
    }
  }
  useEffect(()=>{
    fetchModuleTests()
  },[])
  const handleNavigation = useGlobalNavigation();

  return (
    <div>
    <div className="page-header">
    <div className="page-block">
                <div className="row align-items-center">
                    <div className="col-md-12">
                        <div className="page-header-title">
                            <h5 className="m-b-10">Module Test</h5>
                        </div>
                        <ul className="breadcrumb">
                            <li className="breadcrumb-item"><a href="#"onClick={handleNavigation} ><i className="feather icon-layout"></i></a></li>
                            <li className="breadcrumb-item"><a href="#">Module Tests</a></li>
                        </ul>
                       
                    </div>
                </div>
            </div>
    </div>
    <div className="card" style={{minHeight:"78vh"}}>
    <div className="card-body">
            <div className='navigateheaders'>
      <div onClick={()=>{navigate(-1)}}><i className="fa-solid fa-arrow-left"></i></div>
      <div></div>
      <div onClick={()=>{navigate(-1)}}><i className="fa-solid fa-xmark"></i></div>
      </div>
   <div className="createbtn">
      <a onClick={(e)=>{e.preventDefault();navigate(`/course/AddModuleTest/${courseName}/${courseId}`)}} href="#">
        <button type="button" className="btn btn-primary mb-3">
          <i className="fa-solid fa-plus"></i> Create new
        </button>
      </a>
  </div>
  {submitting &&
              <div className="outerspinner active"><div className="spinner"></div></div>}
  <div className="row">
              {Array.isArray(moduleTest) &&  moduleTest?.map((item) => (
                <div className="col-md-6 col-xl-3 " key={item.mtestId}>
                  <div className="card mb-3 mtest pointer" onClick={()=>{navigate(`/view/ModuleTest/${courseName}/${courseId}/${item.mtestName}/${item.mtestId}`)}}>
                    <div className='headandicon'><h6 className='text-light'>Module Test</h6><img src= {testGrade} /></div>
                    <div className='circleAndDetails'>
                      <div className='circleName' title={item.mtestName}>{item.mtestName}</div>
                    <div>
                     <p> Attempt : {item.mnoOfAttempt}</p>
                     <p> Questions: {item.mnoOfQuestions}</p>
                     <p> Pass Percentage :{item.mpassPercentage}</p>
                      </div>
                    </div>
                    </div>
                    </div>))}
                    </div>
  </div>
  </div>
  </div>
  )
}

export default ListModuleTest