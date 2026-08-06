import React, { useEffect, useState } from "react";
import baseUrl from "../api/utils";
import errorimg from "../images/errorimg.png";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import altBatchImage from "../images/altBatchImage.jpg";
import SelectPaymentGateway from "../course/Payments/SelectPaymentGateway";
const ViewAllBAtchForCourse = () => {
  const { courseId } = useParams();
  const userId = sessionStorage.getItem("userid");
    const [submitting, setsubmitting] = useState(false);
    const token = sessionStorage.getItem("token");
  const MySwal = withReactContent(Swal);
  const [batch, setbatch] = useState([]);
  const Currency = sessionStorage.getItem("Currency");
  const navigate = useNavigate();
  const[openselectgateway,setopenselectgateway]=useState(false)
    const[orderData,setorderData]=useState({
      userId:"",
      batchId:"",
      amount:"" ,
      batchAmount:"",
      batchName:"",
      installment:"",
      paytype:"",
      url:""
  })
  const FetchOrderSummary = async (batchId, userId, paytype) => {
    try {
      let selectedPayType=0;//0->Full //1->PART
      if (paytype === "PART") {
        const result = await MySwal.fire({
          title: "Select Payment Type",
          text: "Do you want to pay fully or in installments?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Full Pay",
          cancelButtonText: "Part Pay",
        });
  
        // Determine payment type based on user selection
         selectedPayType = result.isDismissed ? 1 : 0;//0->Full //1->PART
      
      }
        setsubmitting(true);
  
        // Prepare request data
        const data = JSON.stringify({
          batchId: batchId,
          userId: userId,
          paytype: selectedPayType, // Use local variable, not state
        });
  
        // Make API call
        const response = await axios.post(`${baseUrl}/Batch/getOrderSummary`, data, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });
  
        setsubmitting(false);
        setorderData(response.data);
        console.log(response.data)
        setopenselectgateway(true);
      
    } catch (error) {
      setsubmitting(false);
      setopenselectgateway(false);
  
      if (error.response && error.response.status === 400) {
        MySwal.fire({
          icon: "error",
          title: "Error creating order:",
          text: error.response.data ? error.response.data : "An error occurred",
        });
      } else {
        throw error;
      }
    }
  };
  
  useEffect(() => {
    const fetchBatchforcourse = async () => {
      try {
        if (courseId) {
          const response = await axios.get(
            `${baseUrl}/Batch/getAll/${courseId}`,
            {
              headers: {
                Authorization: token,
              },
            }
          );
          const data = response.data;
          setbatch(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchBatchforcourse();
  }, []);
  return (
    <div>
         {submitting && (
        <div className="outerspinner active">
          <div className="spinner"></div>
        </div>
      )}
      {openselectgateway && (
        <SelectPaymentGateway orderData={orderData} setorderData={setorderData} setopenselectgateway={setopenselectgateway}/>
      )}
      <div className="page-header"></div>
      <div className="card" style={{ height: "82vh", overflowY: "auto" }}>
        <div className="card-body">
          <div className="navigateheaders">
            <div
              onClick={() => {
                navigate(-1);
              }}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            <div></div>
            <div
              onClick={() => {
                navigate("/dashboard/course");
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </div>
          </div>
          <h4>Select Your Batch</h4>
          {batch.length > 0 ? (
            <div className="row">
              {batch
                .slice()
                .reverse()
                .map((item) => (
                  <div className="col-md-6 col-xl-3 course" key={item.id}>
                    <div className="card mb-3">
                      {item.batchImage ? (
                        <div className="img-fluid card-img-top ">
                          <div
                            title={item.batchTitle}
                            style={{
                              cursor: "pointer",
                              height: "150px", // Set a fixed height or adjust accordingly
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative", // To ensure proper alignment for text overlay if needed
                            }}
                          >
                            <img
                              style={{
                                width: "100%", // Ensure the image fills the div
                                height: "100%",
                                cursor: "pointer",
                                objectFit: "cover", // Maintain aspect ratio and cover the div
                                borderRadius: "0.25rem", // Add rounded corners
                              }}
                              title={`${item.batchTitle} image`}
                              src={`data:image/jpeg;base64,${item.batchImage}`}
                              onError={(e) => {
                                e.target.src = errorimg; // Use the imported error image
                              }}
                              alt="Batch"
                            />
                          </div>
                        </div>
                      ) : (
                        
                        <div className="img-fluid card-img-top ">
                          <div
                            title={item.batchTitle}
                            style={{
                              cursor: "pointer",
                              height: "150px", // Set a fixed height or adjust accordingly
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative", // To ensure proper alignment for text overlay if needed
                            }}
                          >
                            <img
                              src={altBatchImage} // Use altBatchImage as the source
                              alt={item.batchTitle}
                              style={{
                                width: "100%", // Ensure the image fills the div
                                height: "100%", // Maintain the height set for the div
                                objectFit: "cover", // Maintain aspect ratio and cover the div
                                borderRadius: "0.25rem", // Add rounded corners
                              }}
                            />
                            <h4
                              style={{
                                color: "white",
                                wordWrap: "break-word", // Ensure the text wraps if it overflows
                                margin: "0", // Remove any default margin
                                padding: "0 10px", // Add padding for better readability if needed
                                textAlign: "center",
                                position: "absolute", // Position the text on top of the image
                                zIndex: 1, // Ensure the text appears above the image
                              }}
                            >
                              {item.batchTitle}
                            </h4>
                          </div>
                        </div>
                      )}
                      <div className="card-body">
                        <h5
                          className="courseName"
                          title={item.batchTitle}
                          style={{ cursor: "pointer" }}
                          // onClick={(e) => {
                          //   handleClick(
                          //     e,
                          //     item.courseId,
                          //     item.amount,
                          //     item.courseUrl
                          //   );
                          // }}
                        >
                          {item.batchTitle}
                        </h5>

                        <p title= {item.course.join(", ")} className="batchlist">
                          <b> Courses :</b> {item.course.join(", ")}
                        </p>
                        <p title={item.trainer.join(", ")} className="batchlist">
                          <b>Trainers :</b> {item.trainer.join(", ")}
                        </p>
                        <p title={item.duration} className="batchlist">
                          <b>Duration :</b> {item.duration}
                        </p>
                        <div>
                          {item.amount === 0 ? (
                            <a
                              title="Enroll For Free"
                              //onClick={(e)=>{ e.preventDefault();navigate(item.courseUrl)}}
                              className="btn btn-sm btn-outline-success w-100"
                            >
                              Enroll for Free
                            </a>
                          ) : (
                            <div className="amountGrid">
                              <div className="amt">
                                <i
                                  className={
                                    Currency === "INR"
                                      ? "fa-solid fa-indian-rupee-sign pr-1"
                                      : "fa-solid fa-dollar-sign pr-1"
                                  }
                                ></i>
                                <span title={item.amount}>{item.amount}</span>
                              </div>
                              <button
                                className=" btn btn-sm btn-outline-primary"
                                onClick={() =>
                                 FetchOrderSummary(item.id,userId,item.paytype)
                                }
                                title="Enroll Now"
                              >
                                Enroll Now
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div>
              <h1 className="text-primary ">No Batch Found </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllBAtchForCourse;
