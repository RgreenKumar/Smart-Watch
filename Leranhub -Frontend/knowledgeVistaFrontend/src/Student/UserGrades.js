import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import baseUrl from '../api/utils';
import axios from 'axios';
import undraw_profile from "../images/profile.png"
import errorimg from "../images/errorimg.png"

const UserGrades = () => {
    const{email,batchTitle,batchId}=useParams();
    const[responsestate,setResponsestate]=useState();
     const [grades, setgrades] = useState([
        {
          batchName: "",
          weightedTest: "",
          weightedQuiz: "",
          weightedAttendance: "",
          weightedAssignment: "",
          totalScore: "",
          result: "",
        },
      ]);
      const [weights, setWeights] = useState({
        passPercentage: "",
        testWeightage: "",
        quizzWeightage: "",
        attendanceWeightage: "",
        assignmentWeightage: "",
      });
      const token = sessionStorage.getItem("token");
      const navigate = useNavigate();
      const fetchGradeDetails = async () => {
        try {
          const response = await axios.get(`${baseUrl}/get/getGradeForUser/${email}/${batchId}`, {
            headers: {
              Authorization: token,
            },
          });
          setResponsestate(response.data?.grades);
          setgrades(response?.data?.grades?.gradeDto);
          
          setWeights(response?.data?.weight);
        } catch (err) {
          console.log(err);
        }
      };
      useEffect(() => {
        fetchGradeDetails();
      }, []);
  return (
    <div>
    <div className="page-header"></div>
    <div className="card">
      <div className="card-body">
      <div className="row">
      <div className="col-12">
    <div className='navigateheaders'>
      <div onClick={()=>{navigate(-1)}}><i className="fa-solid fa-arrow-left"></i></div>
      <div></div>
      <div onClick={()=>{navigate("/view/Students")}}><i className="fa-solid fa-xmark"></i></div>
      </div>
      <div className='mainform'>
            <div className='profile-picture'>
              <div className='image-group'>
                <img id="preview" src={responsestate?.profile ? `data:image/jpeg;base64,${responsestate?.profile}`:undraw_profile} 
                 onError={(e) => {
                        e.target.src = errorimg; // Use the imported error image
                      }} 
                      alt='profile' />
              </div>
              <div className=" p-2 rounded" style={{width:"100%", backgroundColor: "#F2E1F5" }}>
                <div className='form-group row'>
                  <label htmlFor='Name'
                  className="col-sm-4 col-form-label"> <b>Name:</b></label>
                  <div className="col-sm-8">
                  <label className="col-form-label">
                    {responsestate?.userName}</label>
                    </div>
                </div>
                <div className='form-group row'>
                  <label htmlFor='Name'
                  className="col-sm-4 col-form-label"><b> Email:</b></label>
                  <div className="col-sm-8">
                  <label className="col-form-label">
                    {responsestate?.email}</label>
                    </div>
                </div>
              </div>
            </div>
            <div  style={{backgroundColor:"#F2E1F5",padding:"10px",paddingLeft:"20px",borderRadius:"20px" }} >
      <div className='form-group row' >
          <label htmlFor='Name'className="col-sm-3 col-form-label"><b> Batch Name :</b></label>
          <div className="col-sm-9">
          <label className="col-form-label">
           {batchTitle}</label>
           </div>
        </div>
        <div className='form-group row' >
          <label htmlFor='Name'className="col-sm-3 col-form-label"><b> Test Score ({weights.testWeightage}%) :</b></label>
          <div className="col-sm-9">
          <label className="col-form-label">
           {grades?.weightedTest}</label>
           </div>
        </div>
        <div className='form-group row' >
          <label htmlFor='Name'className="col-sm-3 col-form-label"><b> Quizz Score ({weights.quizzWeightage}%):</b></label>
          <div className="col-sm-9">
          <label className="col-form-label">
           {grades?.weightedQuiz}</label>
           </div>
        </div>
        <div className='form-group row' >
          <label htmlFor='Name'className="col-sm-3 col-form-label"><b> Attendance Score ({weights.attendanceWeightage}%):</b></label>
          <div className="col-sm-9">
          <label className="col-form-label">
           {grades?.weightedAttendance}</label>
           </div>
        </div>
        <div className='form-group row' >
          <label htmlFor='Name'className="col-sm-3 col-form-label"><b> Assignmant Score ({weights.assignmentWeightage}%):</b></label>
          <div className="col-sm-9">
          <label className="col-form-label">
           {grades?.weightedAssignment}</label>
           </div>
        </div>
        <div className='form-group row' >
          <label htmlFor='Name'className="col-sm-3 col-form-label"><b> Total Score :</b></label>
          <div className="col-sm-9">
          <label className="col-form-label">
           {grades?.totalScore}</label>
           </div>
        </div>
        <div className='form-group row' >
          <label htmlFor='Name'className="col-sm-3 col-form-label"><b> Result :</b></label>
          <div className="col-sm-9">
          <label className="col-form-label">
           {grades?.result}</label>
           </div>
        </div>
        </div>
        </div>
      </div>
      </div>
      </div>
      </div>
      </div>
  )
}

export default UserGrades