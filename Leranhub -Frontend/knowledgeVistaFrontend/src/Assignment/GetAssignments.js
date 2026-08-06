import axios from 'axios'
import React, { useState } from 'react'
import { useEffect } from 'react'
import baseUrl from '../api/utils';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const GetAssignments = () => {
    const{courseName,courseId}=useParams();
    const navigate=useNavigate();
    const token=sessionStorage.getItem("token");
      const MySwal = withReactContent(Swal);
    const [assignments, setAssignments] = useState([]);
    const [expandedId, setExpandedId] = useState(null); // holds the currently expanded assignment's ID

    const toggleDescription = (id) => {
      setExpandedId((prevId) => (prevId === id ? null : id)); // toggle logic
    };
    const getAssignments=async()=>{
        try{
       const response=await axios.get(`${baseUrl}/Assignment/getAll?courseId=${courseId}`,{
        headers: {
            Authorization: token,
          },
       });
       if(response.status===200){
        setAssignments(response?.data)
        if(response?.data?.length === 0){
            navigate(`/Assignment/create/${courseName}/${courseId}`)
        }
       }
        }catch(err){
          if(err?.response?.status===401){
            navigate("/unauthorized")
        }else if (err?.response?.status===403){
          MySwal.fire({
              title: " Forbitten!",
              text: err?.response?.data,
              icon: "warning",
              confirmButtonText: "OK",
            }).then((result) => {
                navigate(-1);
            });
      }else{
      console.log(err)
      throw err 
      }
        }
    }
    useEffect(()=>{
        getAssignments();
    },[])

    const handleDelete = async (assignmentId) => {
        MySwal.fire({
          title: "Delete Assignment?",
          text: "Are you sure you want to delete this assignment?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
      
              const response = await axios.delete(`${baseUrl}/Assignment/Delete`, {
                headers: {
                  Authorization: token,
                },
                params: {
                  assignmentId: assignmentId,
                },
              });
      if(response?.status===200){
      
              MySwal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Assignment has been deleted.",
              });
            }
            getAssignments()
            } catch (error) {
              console.error("Delete error:", error);
              MySwal.fire("Error", error.response?.data || "Something went wrong.", "error");
            }
          }
        });
      };
      
      
      
  return (
    <div>
    <div className="page-header">
      <div className="page-block">
        <div className="row align-items-center">
          <div className="col-md-12">
            <div className="page-header-title">
              <h5 className="m-b-10">Assignment</h5>
            </div>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="#" onClick={() => navigate("/dashboard/course")}>
                  <i className="feather icon-layout"></i>
                </a>
              </li>
              <li className="breadcrumb-item">
                <a href="#" onClick={() => navigate("/dashboard/course")}>
                  {courseName}
                </a>
              </li>
              <li className="breadcrumb-item">
                <a href="#">Assignment</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div className="row">
          <div className="col-sm-12">
            <div className="card " style={{minHeight:"75vh"}}>
              <div className="card-body">
                <div className="navigateheaders">
                  <div onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-arrow-left"></i>
                  </div>
                  <div></div>
                  <div onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                </div>
                <div className='headingandbutton'>
                <h4>Assignments for {courseName}</h4>
                <button className='btn btn-primary' onClick={()=>{   navigate(`/Assignment/create/${courseName}/${courseId}`)}}>Add More</button></div>

                {assignments.map((assignment) => (
        <div key={assignment.id} className="bg-white p-6 border mb-4 rounded-md shadow-sm p-2">
          {/* Title */}
          <h2 className="assignment-title">📘 <span>{assignment.title}</span></h2>

          {/* Expandable Description */}
          <div className="pl-2 Assigmnent-Description position-relative">
  <small
    style={{
      display: "-webkit-box",
      WebkitLineClamp: expandedId === assignment.id ? "unset" : "1",
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      transition: "all 0.3s ease",
      paddingRight: "25px", // to prevent text from going under the icon
      marginBottom:"5px"
    }}
  >
    {assignment.description}
  </small>

  <span
  
    onClick={() => toggleDescription(assignment.id)}
    style={{
      position: "absolute",
      top: "0",
      right: "0",
      cursor: "pointer",
      color: "blue",
      padding: "5px"
    }}
  >
    {expandedId === assignment.id ? (
      <i className="fa-solid fa-angle-up text-primary"></i>
    ) : (
      <i className="fa-solid fa-angle-down text-primary pb-3"></i>
    )}
  </span>
</div>


          {/* Marks Info & Buttons */}
          <div className="assignment-text-icons d-flex justify-between items-center">
            <div>
              <div><span className="font-semibold">Total Marks:</span> {assignment.totalMarks}</div>
            </div>
            <div>
              <button
                className="hidebtn"
                title="Edit"
                onClick={() => navigate(`/Assignment/get/${courseName}/${courseId}/${assignment.id}`)}
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                className="hidebtn text-danger"
                onClick={() => handleDelete(assignment.id)}
                title="Delete"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      ))}



                </div>
                </div>
                </div>
                </div>
    </div>
  )
}

export default GetAssignments