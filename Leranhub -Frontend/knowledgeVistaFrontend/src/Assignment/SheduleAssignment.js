import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import baseUrl from "../api/utils";
import { useEffect, useState } from "react";

const SheduleAssignment = () => {
    const { batchTitle, batchId, courseName, courseId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const MySwal = withReactContent(Swal);
  const token = sessionStorage.getItem("token");
  const [schedule, setSchedule] = useState([]);
  const fetchSheduleAssignmentDetails = async () => {
    try {
      setSubmitting(true);
      const response = await axios.get(
        `${baseUrl}/Assignment/getSheduleDetail/${courseId}/${batchId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (response.status === 200) {
        setSubmitting(false);
        setSchedule(response.data);
      }
    } catch (error) {
      setSubmitting(false);
      if (error.response && error.response.status === 401) {
        navigate("/unauthorized");
      } else {
        throw error;
      }
    }
  };
  useEffect(() => {
 
    fetchSheduleAssignmentDetails();
  }, []);

  
  const handleDateChange = async (index, value) => {
   
    setSchedule((prev) => {
      const newSchedule = [...prev];
      newSchedule[index].assignmentdate= value;
  
      // Validate the quizDate to be greater than or equal to today
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      if (value < currentDate) {
        MySwal.fire({
          title: "Invalid Date",
          text: "Assignment date must be in the future.",
          icon: "warning",
        });
      } else {
        saveOrUpdateSchedule(newSchedule[index]);// Automatically call API
      }
  
      return newSchedule;
    });
  };
  


  // API call function
   const saveOrUpdateSchedule = async (Assignment) => {
    try {
      const response = await axios.post(
        `${baseUrl}/Assignment/Shedule`,
        null,
        {
          params: {
            AssignmentId: Assignment.assignmentid,
            batchId,
            AssignmentDate: Assignment.assignmentdate,
          },
          headers: { Authorization: token },
        }
      );
      if (response.status === 200) {
        MySwal.fire({ title:`${response?.data}`, text: `Shedule ${response?.data} SuccessFully`, icon: "success" });
        setSchedule((prev) => {
          const newSchedule = [...prev];
          return newSchedule;
        });
        fetchSheduleAssignmentDetails();
      } else if (response.status === 204) {
        MySwal.fire({ title: "Not Found!", text: "Error occurred Batch or Assignment Not Found", icon: "warning" });
      }
    } catch (error) {
      if (error.response?.status === 401){ navigate("/unauthorized");
    }else if (error?.response?.status===403){
      MySwal.fire({
          title: " Forbitten!",
          text: error?.response?.data,
          icon: "warning",
          confirmButtonText: "OK",
        }).then((result) => {
            navigate(-1);
        });
  }else{
  console.log(error)
  throw error
  }
}
  };

 


  return (
    <div>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Quizz</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="#" onClick={() => navigate("/batch/viewall")}>
                    <i className="fa-solid fa-object-group"></i>
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={() => navigate("/batch/viewall")}>
                    {batchTitle}
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={() => navigate(`/batch/viewcourse/${batchTitle}/${batchId}`)}>
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

      <div className="card">
        <div className="row">
          <div className="col-12">
            <div className="card-header">
              <div className="navigateheaders">
                <div onClick={() => navigate(-1)}>
                  <i className="fa-solid fa-arrow-left"></i>
                </div>
                <div></div>
                <div onClick={() => navigate("/dashboard/course")}>
                  <i className="fa-solid fa-xmark"></i>
                </div>
              </div>
              <div className="samerow">
                <h4>
                  Batch: <span className="text-primary">{batchTitle}</span>
                </h4>
                <h4>
                  Course Name: <span className="text-primary">{courseName}</span>
                </h4>
              </div>
            </div>

                <div className="card-body">
         <div className="table-container">
           <table className="table table-hover table-bordered table-sm">
             <thead className="thead-dark">
               <tr>
                 <th>Assignment Name</th>
                 <th colSpan={1}>Schedule Duration</th>
               </tr>
             </thead>
             {submitting ? (
              <div className="outerspinner active"><div className="spinner"></div></div>
            ) : (
              <tbody>
                {schedule.map((item, index) => (
                  <tr key={index}>
                    <td>{item.assignmenttitle}</td>
                   
                  <td>
  <div className="row">
    <span className="col-sm-3">Assignment Date:</span>
    <input
      type="date" // Use date input instead of datetime-local
      className="form-control col-sm-4"
      value={item.assignmentdate || ""}
      min={new Date().toISOString().split("T")[0]} // Disable past dates
      onChange={(e) => handleDateChange(index, e.target.value)}

    />
  </div>
</td>

                   
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default SheduleAssignment