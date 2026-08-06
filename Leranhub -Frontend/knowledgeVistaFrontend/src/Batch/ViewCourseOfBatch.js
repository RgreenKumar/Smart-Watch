import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import baseUrl from "../api/utils";
import errorimg from "../images/errorimg.png";
import StudentChart from "../AuthenticationPages/StudentChart";
import DonutChart from "../AuthenticationPages/DonutChart";
import Attendance from "../icons/Attendance.svg"
import users from "../icons/users.svg"
import rupee from "../icons/rupee.svg"
import result from "../icons/result.svg"
import revenueChart from"../images/revenueChart.png"
import { GlobalStateContext } from "../Context/GlobalStateProvider";
const ViewCourseOfBatch = () => {
  const { batchTitle,batchid } = useParams();
  const [submitting, setsubmitting] = useState(false);
  const token = sessionStorage.getItem("token");
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const { displayname } = useContext(GlobalStateContext);
  const[counts,setcounts]=useState({
  PASS:"",
	FAIL:"",
	TOTAL:"",
	PRESENT:"",
	REVENUE:"",
	STUDENTS:"",
	SEATS:"",
	ABSENT:""
  })
  const fetchcountsOfBatch = async () => {
    try {
      setsubmitting(true);
      const response = await axios.get(
        `${baseUrl}/Batch/getcounts`,
        {
          params:{
            id:batchid
          },
          headers: {
            Authorization: token,
          },
        }
      );
      setsubmitting(false);
      if (response.status === 200) {
        setcounts(response.data);
      }
    } catch (error) {
      setsubmitting(false);
      console.log(error);
      if (error.response && error.response.status === 401) {
        navigate("/unauthorized");
      }
    }
  };
  const fetchCourseOFBatch = async () => {
    try {
      setsubmitting(true);
      const response = await axios.get(
        `${baseUrl}/Batch/getCourses/${batchid}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setsubmitting(false);
      if (response.status === 200) {
        setCourses(response.data);
      }
    } catch (error) {
      setsubmitting(false);
      console.log(error);
      if (error.response && error.response.status === 401) {
        navigate("/unauthorized");
      } else {
        throw error;
      }
    }
  };
  useEffect(() => {
    
    fetchCourseOFBatch();
    fetchcountsOfBatch()
  }, []);
  return (
    <div className="parent">
      <div className="page-header">  <div className="page-block">
                <div className="row align-items-center">
                    <div className="col-md-12">
                        <div className="page-header-title">
                            <h5 className="m-b-10">Courses Of {batchTitle}</h5>
                        </div>
                        <ul className="breadcrumb">
                            <li className="breadcrumb-item"><a href="#"onClick={()=>{navigate("/batch/viewall")}} ><i className="fa-solid fa-object-group"></i></a></li>
                            <li className="breadcrumb-item"><a href="#"onClick={()=>{navigate("/batch/viewall")}} >{batchTitle}</a></li>
                            <li className="breadcrumb-item"><a href="#">Courses</a></li>
                        </ul>
                       
                    </div>
                </div>
            </div></div>
      {submitting ? (
        <div className="outerspinner active">
          <div className="spinner"></div>
        </div>
      ) : (
      <div>   
        <div className="student-card-container">

  <div className="card pointer student-card " onClick={() => navigate(`/payment/transactionHitory`)}>
    <div className="card-body">
      <div className="student-header">
          <h4>Revenue</h4>
          <img src={rupee} alt="rupee" />

          </div>
          <img src={revenueChart} className="revenueimg" alt="revenur chart"/>
          <h4 className="mt-1 text-right"><i className="fa-solid fa-indian-rupee-sign p-1"></i>{counts.REVENUE?counts.REVENUE:0}</h4>
        
        </div>
      </div>
  

  <div className="card pointer student-card" onClick={() => navigate(`/batch/ViewStudents/${batchTitle}/${batchid}`)} >
    <div className="card-body">
      <div className="student-header">
        <h4>{displayname?.student_name || "Students"}</h4>
        <img src={users} alt="users" />
      </div>

      <div className="student-content">
        {/* Pie Chart */}
        <StudentChart 
          totalSeats={counts?.SEATS} 
          enrolledStudents={counts?.STUDENTS} 
          color2={"#0198C7"} 
          color1={"#81ECE1"} 
          labels={["Enrolled Students", "Number of Seats"]}
        />

        {/* Student Count and Labels */}
        <div className="student-info">
         <div> <h6>{counts.STUDENTS}</h6>
          <p>{displayname?.student_name || "Students"}</p>
          </div>

          <div className="student-labels">
            <div><span className="color-label" style={{ backgroundColor: "#0198C7" }}></span> No of Seats</div>
            <div><span className="color-label" style={{ backgroundColor: "#81ECE1" }}></span> Enrolled </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="card pointer student-card" onClick={() => navigate(`/batch/ViewStudents/${batchTitle}/${batchid}`)}>
    <div className="card-body">
      <div className="student-header">
        <h4>Result</h4>
        <img src={result} alt="result" />
      </div>

      <div className="student-content">
        <DonutChart passCount={counts.PASS} failCount={counts.FAIL}  />

        <div className="student-info">
         <div></div>
          <div className="student-labels">
            <div><span className="color-label" style={{ backgroundColor: "#4CAF50" }}></span> Pass </div>
            <div><span className="color-label" style={{ backgroundColor: "#E53935" }}></span> Fail </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="card student-card ">
    <div className="card-body">
      <div className="student-header">
        <h4>Attendance</h4>
        <img src={Attendance} alt="attendance" />
      </div>

      <div className="student-content">
        {/* Pie Chart */}
        <StudentChart 

          totalSeats={100} 
          enrolledStudents={counts.PRESENT} 
          color2={"#142459"} 
          color1={"#4680FF"} 
          labels={["Attended Session", "Not Attended Session"]}
        />

        {/* Student Count and Labels */}
        <div className="student-info">
         <div></div>
          <div className="student-labels">
            <div><span className="color-label" style={{ backgroundColor: "#4680FF" }}></span> Present </div>
            <div><span className="color-label" style={{ backgroundColor: "#142459" }}></span> Absent </div>
          </div>
        </div>
      </div>
    </div>
  </div>



</div>
        {courses.length > 0 ? ( // Corrected condition placement
        <div className="row">
          {courses
            .slice()
            .reverse()
            .map((item) => (
              <div className=" course" key={item.courseId}>
                <div className="card mb-3">
                  <img
                    style={{ cursor: "pointer" }}
                    title={`${item.courseName} image`}
                    className="img-fluid card-img-top"
                    src={`data:image/jpeg;base64,${item.courseImage}`}
                    onError={(e) => {
                      e.target.src = errorimg; // Use the imported error image
                    }}
                    alt="Course"
                  />
                  <div className="card-body">
                    <h5
                      className="courseName"
                      title={item.courseName}
                      style={{ cursor: "pointer" }}
                    >
                      {item.courseName}
                    </h5>
                    <a
                      title="Schedule Quizz"
                      className="btn btn-sm btn-outline-success w-100"
                    onClick={()=>{navigate(`/sheduleQuizz/${batchTitle}/${batchid}/${item.courseName}/${item.courseId}`)}}
                    >
                    <label>  Schedule Quizz</label>
                    </a>
                    <a
                      title="Schedule Module Test"
                      className="btn btn-sm btn-outline-primary w-100 mt-2"
                    onClick={()=>{navigate(`/sheduleModuleTest/${batchTitle}/${batchid}/${item.courseName}/${item.courseId}`)}}
                    >
                    <label>  Schedule Module Test</label>
                    </a>
                    <a
                      title="Schedule Assignment"
                      className="btn btn-sm btn-outline-success w-100 mt-2"
                    onClick={()=>{navigate(`/sheduleAssignment/${batchTitle}/${batchid}/${item.courseName}/${item.courseId}`)}}
                    >
                    <label>  Schedule Assignment</label>
                    </a>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div>
          <h6 className="text-muted">No Course Found</h6>
        </div>
      )}
      </div>)}
    
    </div>
  );
};

export default ViewCourseOfBatch;
