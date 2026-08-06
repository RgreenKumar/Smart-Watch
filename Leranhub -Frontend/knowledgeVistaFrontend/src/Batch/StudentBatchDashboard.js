import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Profile from '../Student/Profile.js'
import RadialProgressBar from '../AuthenticationPages/RadialProgressBar'
import axios from 'axios'
import baseUrl from '../api/utils'
import attendance from"../icons/Attendance.svg"
import quizz from"../icons/Quizz.svg"
import test from"../icons/test.svg"
import grade from"../icons/grade.svg"
import assignmentIcon from "../icons/assignment.svg"
import { GlobalStateContext } from "../Context/GlobalStateProvider";
import BarChartComponent from '../AuthenticationPages/BarChartComponent'
const BatchDashboard = () => {
    const{studentemail,userId,batchId,batchTitle}=useParams();
    const navigate=useNavigate();
  const role=sessionStorage.getItem("role");
  const [notfound,setnotfound]=useState(false);
  const { displayname } = useContext(GlobalStateContext);
  const location = useLocation();
  const [scores,setscores]=useState([])
  const[testGrade,setTestGrade]=useState();
  const [initialUserData, setInitialUserData] = useState(location.state?.user || null);
    const [img, setimg] = useState();
    const [userData, setUserData] = useState({
       username:"",
       email:"",
       phone:"",
       skills:"",
       dob:"",
       countryCode:"",
        roleName:"",
        profile:null,
      });
  
      useEffect(() => {
        const fetchData = async () => {
          if (role === "ADMIN" || role === "TRAINER") {
            try {
              let fetchedInitialUserData = initialUserData;
              
              // Fetch initialUserData if it's not available from location.state
              if (!fetchedInitialUserData) {
                const detailsRes = await axios.get(`${baseUrl}/details/${studentemail}`, {
                  headers: { Authorization: token },
                });
                fetchedInitialUserData = detailsRes.data;
                setInitialUserData(fetchedInitialUserData);
              }
              
              // Fetch additional user data
              if (fetchedInitialUserData) {
                setUserData(prevData =>  ({
                  ...prevData,
                  ...fetchedInitialUserData,
                }));
                const email = fetchedInitialUserData.email;
                const response = await axios.get(`${baseUrl}/student/admin/getstudent/${email}`, {
                  headers: { Authorization: token },
                });
      
                if (response.status === 200) {
                  const serverData = response.data;
      
                  // Merge initialUserData and serverData into userData
                  setUserData(prevData => {
                    const updatedData = { ...prevData,  ...serverData };
                    if (updatedData.profile) {
                      setimg(`data:image/jpeg;base64,${updatedData.profile}`);
                    }
                    return updatedData;
                  });
                }
              }
            } catch (error) {
              if (error.response) {
                if (error.response.status === 404) {
                  setnotfound(true);
                } else if (error.response.status === 401) {
                  navigate("/unauthorized")
                }else{
                  throw error
                }
              }
            }
          } else {
            navigate("/unauthorized")
          }
        };
      
        fetchData();
      }, []);
     const [attendanceData, setAttendanceData] = useState({
      totalDays:"",
      presentDays:"",
      absentDays:"",
      presentPercentage:"",
      absentPercentage:""
     });
     const[QScoreList,setQScoreList]=useState([]);
     const [loading, setLoading] = useState(true);
     const token = sessionStorage.getItem("token"); 
     useEffect(() => {
        const fetchAttendanceAnalysis = async () => {
          try {
            setLoading(true)
           
          // Retrieve token from sessionStorage
            const response = await axios.get(
              `${baseUrl}/view/getAttendancAnalysis/${userId}/${batchId}`,
              {
                headers: { Authorization: token }, // Passing token in headers
              }
            );
    
            if (response.status === 200) {
              setAttendanceData(response.data);
            }
          } catch (err) {
        console.log(err)
          } finally {
            setLoading(false);
          }
        };
    
        fetchAttendanceAnalysis();

        const fetchQuizzAnalysis = async () => {
            try {
              setLoading(true)
              const response = await axios.get(
                `${baseUrl}/get/QuizzAnalysis/${batchId}/${studentemail}`,
                {
                  headers: { Authorization: token }, // Passing token in headers
                }
              );
      
              if (response.status === 200) {
                setQScoreList(response?.data);
                setscores(response?.data?.scores||[])
              }
            } catch (err) {
          console.log(err)
            } finally {
              setLoading(false);
            }
          };
          fetchQuizzAnalysis()

          const fetchGradeTestAnalysis = async () => {
            try {
              setLoading(true)
             
            // Retrieve token from sessionStorage
              const response = await axios.get(
                `${baseUrl}/get/TestGradeAnalysis/${studentemail}/${batchId}`,
                {
                  headers: { Authorization: token }, // Passing token in headers
                }
              );
      
              if (response.status === 200) {
                setTestGrade(response.data);
              }
            } catch (err) {
          console.log(err)
            } finally {
              setLoading(false);
            }
          };
          fetchGradeTestAnalysis()
      }, [studentemail,userId, batchId]); // Fetch data when userId or batchId changes
    
  return (
    <div>
    <div className="page-header">
    <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Profile</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <a
                    href="#"
                    onClick={()=>{navigate("/batch/viewall")}}
                    title="dashboard"
                  >
                     <i className="fa-solid fa-object-group"></i>
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a
                    href="#"
                    onClick={() => {
                      navigate(`/batch/viewcourse/${batchTitle}/${batchId}`);
                    }}
                  >
                    {batchTitle}
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#"
                    onClick={() => {
                      navigate(`/batch/ViewStudents/${batchTitle}/${batchId}`);
                    }}>
                   {displayname && displayname.student_name
                      ? displayname.student_name
                      : "Student"}
                    Details
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#"
                   >
                 {userData.username}
                  </a>
                </li>
              
              </ul>
            </div>
          </div>
        </div>
    </div>
    <div className="card">
      <div className="card-body">
      <div className="row">
      <div className="col-12">
    <div className='navigateheaders'>
      <div onClick={()=>{navigate(-1)}}><i className="fa-solid fa-arrow-left"></i></div>
      <div></div>
      <div onClick={()=>{navigate("/view/Students")}}><i className="fa-solid fa-xmark"></i></div>
      </div>
     
      <div className='row'>
      <div className="col-lg-7 col-md-12">
      <div className='row' style={{ display: 'flex', alignItems: 'stretch'}}>
  <div className="col-sm-6">
    <div className="card support-bar overflow-hidden pointer h-90"
     onClick={() => { navigate(`/view/Attendance/${batchId}`, { state: { user: userData } }) }}>
      <div className="card-body pb-0">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="m-0">Attendance</h2>
          <img src={attendance} alt="course Icon" style={{ maxHeight: "50px" }} />
        </div>
        <span className="text-c-green">Percentage</span>
      </div>
      <div className="radial-bar  ">
        <RadialProgressBar percentage={attendanceData.presentPercentage} total={attendanceData.presentPercentage + "%"} />
      </div>
      <div className="card-footer  text-white" style={{ backgroundColor: "#4680FF" }}>
        <div className="row text-center">
          <div className="col">
            <h5 className="m-0 text-white">{attendanceData.totalDays}</h5>
            <span>Total Days</span>
          </div>
          <div className="col">
            <h5 className="m-0 text-white">{attendanceData.presentDays}</h5>
            <span>present </span>
          </div>
          <div className="col">
            <h5 className="m-0 text-white">{attendanceData.absentDays}</h5>
            <span>Absent </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="col-sm-6">
    <div className="card support-bar overflow-hidden h-90"
    onClick={()=>{navigate(`/Quizz/gethistory/${studentemail}/${batchTitle}/${batchId}`)}}>
      <div className="card-body pb-0">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="m-0">Quizz</h2>
          <img src={quizz} alt="course Icon" style={{ maxHeight: "50px" }} />
        </div>
        <span className="text-c-green">Total Quizz Score</span>
      </div>
      <div id="support-chart">
      <div>
                    {scores && Array.isArray(scores) && <BarChartComponent quizScores={scores} />}
                </div>
      </div>
      <div className="card-footer  text-white" style={{ backgroundColor: "#9CCC65" }}>
        <div className="row text-center">
          <div className="col">
            <h5 className="m-0 text-white">{QScoreList?.percentage} %</h5>
            <span>Total Percentage Of Quizz</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
 </div>
 <div className="col-lg-5 col-md-12">
 <div className='row'>
 <div className="col-sm-6 pointer"  onClick={()=>{navigate(`/view/TestScore/${studentemail}/${batchTitle}/${batchId}`)}}>
                        <div className="card">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-8">
                                        <h4 className="text-c-yellow">{testGrade?.test}%</h4>
                                        <h6 className="text-muted m-b-0">Test</h6>
                                    </div>
                                    <div className="col-4 text-right">
                                        <img src={test} alt="course Icon" />
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer bg-c-yellow">
                                <div className="row align-items-center">
                                    <div className="col-9">
                                        <p className="text-white m-b-0"> Test</p>
                                    </div>
                                   
                                </div>
                            </div>
                        </div>
                    </div>
  <div className="col-sm-6 pointer" onClick={()=>{navigate(`/view/Grades/${studentemail}/${batchTitle}/${batchId}`)}}>
                        <div className="card">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-8">
                                        <h4 className="text-c-red">{testGrade?.grade}%</h4>
                                        <h6 className="text-muted m-b-0">{testGrade?.result}</h6>
                                    </div>
                                    <div className="col-4 text-right">
                                        <img src={grade} alt="course Icon" />
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer bg-c-red">
                                <div className="row align-items-center">
                                    <div className="col-9">
                                        <p className="text-white m-b-0"> Grade</p>
                                    </div>
                                   
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                    <div className='row'>
                    <div className="col-sm-6 pointer" onClick={()=>{navigate(`/view/Assignments/${batchTitle}/${batchId}/${userId}`)}}>
                        <div className="card">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-8">
                                        <h4 className="text-c-Darkblue">{testGrade?.assignment}%</h4>
                                        <h6 className="text-muted m-b-0">{testGrade?.assignment}</h6>
                                    </div>
                                    <div className="col-4 text-right">
                                        <img src={assignmentIcon} alt="Assignment Icon" />
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer bg-c-Darkblue">
                                <div className="row align-items-center">
                                    <div className="col-9">
                                        <p className="text-white m-b-0"> Assignment </p>
                                    </div>
                                   
                                </div>
                            </div>
                        </div>
                    </div></div>
                    </div>
                   
</div>

<Profile notfound={notfound} displayname={displayname} userData={userData} img={img}/>
  </div>
  </div>
  </div>
  </div>
</div>
  )
}

export default BatchDashboard