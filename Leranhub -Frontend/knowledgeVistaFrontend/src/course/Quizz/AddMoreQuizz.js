import React, { useEffect, useState } from 'react';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import baseUrl from '../../api/utils';
import axios from 'axios';
import useGlobalNavigation from '../../AuthenticationPages/useGlobalNavigation';

const AddMoreQuizz = () => {
    const MySwal = withReactContent(Swal);
   const {courseName,courseID,lessonsName,lessonId,quizzName, quizzId } = useParams();
    const token = sessionStorage.getItem("token");
    const location = useLocation();
     const navigate=useNavigate();
    // State for question and options
    const [questionData, setQuestionData] = useState({
        questionText: '',
        options: {
            option1: '',
            option2: '',
            option3: '',
            option4: ''
        },
        answer: ''
    });

    // State for errors
    const [errors, setErrors] = useState({
        questionText: '',
        options: {
            option1: '',
            option2: '',
            option3: '',
            option4: ''
        },
        answer: ''
    });

    // Function to handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuestionData(prevData => ({
            ...prevData,
            options: {
                ...prevData.options,
                [name]: value
            }
        }));

        // Validate input fields
        if (value.trim() === '') {
            setErrors(prevErrors => ({
                ...prevErrors,
                options: {
                    ...prevErrors.options,
                    [name]: 'This field is required'
                }
            }));
        }else if (value.length > 255) {
            setErrors(prevErrors => ({
                ...prevErrors,
                options: {
                    ...prevErrors.options,
                    [name]: 'option cannot be more than 255 characters.'
                }
            }));
       
        } else {
            setErrors(prevErrors => ({
                ...prevErrors,
                options: {
                    ...prevErrors.options,
                    [name]: ''
                }
            }));
        }
    };

    // Function to handle question text change
    const handleQuestionTextChange = (e) => {
        
        const { value } = e.target;
        setQuestionData(prevData => ({
            ...prevData,
            questionText: value
        }));

        // Validate question text
        if (value.trim() === '') {
            setErrors(prevErrors => ({
                ...prevErrors,
                questionText: 'This field is required'
            }));
        }else if (value.length > 1000) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              questionText: 'Question text cannot be more than 1000 characters.',
            }));
          } else {
            setErrors(prevErrors => ({
                ...prevErrors,
                questionText: ''
            }));
        }
    };

    // Function to handle option selection
    const handleOptionChange = (option) => {
        setQuestionData(prevData => ({
            ...prevData,
            answer: option
        }));

        // Validate option selection
        if (option === '') {
            setErrors(prevErrors => ({
                ...prevErrors,
                answer: 'Please select an option'
            }));
        } else {
            setErrors(prevErrors => ({
                ...prevErrors,
                answer: ''
            }));
        }
    };

    // Function to handle save
    const handleSave = async () => {
        // Check for errors
        if (questionData.questionText.trim() === '') {
            setErrors(prevErrors => ({
                ...prevErrors,
                questionText: 'This field is required'
            }));
            return
        }else if (questionData.questionText.length > 1000) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              questionText: 'Question text cannot be more than 1000 characters.',
            }));
            return
          }
       
        for (const option in questionData.options) {
            if (questionData.options[option].trim() === '') {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    options: {
                        ...prevErrors.options,
                        [option]: 'This field is required'
                    }
                }));
                return
            }else if (questionData.options[option].length > 255) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    options: {
                        ...prevErrors.options,
                        [option]: ' option cannot be more than 255 characters.'
                    }
               
            } ))
            return
        }
    }
    if (questionData.answer === '') {
        setErrors(prevErrors => ({
            ...prevErrors,
            answer: 'Please select an option'
        }));
        return
    }

        // If there are no errors, proceed with saving
       
            try {
                const questionPayload = {
                    questionText: questionData.questionText,
                    answer: questionData.options[questionData.answer],
                    option1:questionData.options.option1,
                    option2:questionData.options.option2,
                    option3:questionData.options.option3,
                    option4:questionData.options.option4  // Ensure options are sent as an array

                };
               
                const response = await axios.post(`${baseUrl}/Quizz/AddMore/${quizzId}`,questionPayload, {
                    headers: {
                        "Authorization": token
                    }
                });
                if (response.status===200) {
                    const data =  response.data;
                    MySwal.fire({
                        title: "Success",
                        text: "Question added successfully",
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                setQuestionData({questionText: '',
                    options: {
                        option1: '',
                        option2: '',
                        option3: '',
                        option4: ''
                    },
                    answer: ''})
                } 
                else if(response.status===204){
                    MySwal.fire({
                        title: "Not Found",
                        text: "Quizz Not Found",
                        icon: "warning",
                        confirmButtonText: "OK"
                    });
                }
            } catch (error) {
                if(error.response && error.response.status===401){
                    MySwal.fire({
                        title: "Error",
                        text: "you are unauthorized to access this page",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                     navigate("/unauthorized"); // Redirect to previous page
               
                }else{
                // MySwal.fire({
                //     title: "Error",
                //     text: error,
                //     icon: "error",
                //     confirmButtonText: "OK"
                // });
                throw error
            }
        }
        
    };
    const handleNavigation = useGlobalNavigation();
    return (
        <div>
    <div className="page-header">
    <div className="page-block">
                <div className="row align-items-center">
                    <div className="col-md-12">
                        <div className="page-header-title">
                            <h5 className="m-b-10">Add Question</h5>
                        </div>
                        <ul className="breadcrumb">
                            <li className="breadcrumb-item"><a href="#"onClick={handleNavigation} ><i className="feather icon-layout"></i></a></li>
                            <li className="breadcrumb-item"><a href="#" onClick={()=>{navigate(`/lessonList/${courseName}/${courseID}`)}}>{lessonsName}</a></li>
                            <li className="breadcrumb-item"><a href="#"onClick={()=>{navigate(`/ViewQuizz/${courseName}/${courseID}/${lessonsName}/${lessonId}/${quizzName}/${quizzId}`)}}>{quizzName}</a></li>
                            <li className="breadcrumb-item"><a href="#">Add</a></li>
                        </ul>
                       
                    </div>
                </div>
            </div>
    </div>
    <div className="card">
    <div className="card-body">
            <div className='navigateheaders'>
      <div onClick={()=>{navigate(-1)}}><i className="fa-solid fa-arrow-left"></i></div>
      <div></div>
      <div onClick={()=>{navigate(-1)}}><i className="fa-solid fa-xmark"></i></div>
      </div>
      <h4>Add Question to {courseName}</h4>
      
     
        <div className="row">
        <div className="col-12">
        {errors.answer && <div className="text-danger">{errors.answer}</div>}
                        <div>
                           
                            <input
                            className={`form-control   ${errors.questionText && 'is-invalid'}`}
                            autoFocus
                            placeholder='Enter Question'
                            value={questionData.questionText}
                            onChange={handleQuestionTextChange}
                        />
                        {errors.questionText && <div className="invalid-feedback">{errors.questionText}</div>}
                        </div>
                        <ul className='listgroup' >
                            {Object.keys(questionData.options).map((option, index) => (
                    
                    <li className='choice' key={index}>
                                    <input
                                        className='mt-2'
                                        type="radio"
                                        value={questionData.options[option]}
                                        checked={questionData.answer === option}
                                        onChange={() => handleOptionChange(option)}
                                    />
                                    <div>
                                    <input
                                        className={`form-control   ${errors.options[option] && 'is-invalid'}`}
                                        type='text'
                                        placeholder={`Option ${index + 1}`}
                                        value={questionData.options[option]}
                                        name={option}
                                        onChange={handleInputChange}
                                    />
                                    {errors.options[option] && <div className="invalid-feedback">{errors.options[option]}</div>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                       
                        <div className='atbtndiv'>
                       <div> <button className='btn btn-secondary' onClick={() => window.history.back()}>Cancel</button>
                       </div> <div></div>
                        <div><button className='btn btn-primary' onClick={handleSave}>Save</button></div>
                    </div></div>
                 
                   
        
            </div>
            </div>
            </div>
        </div>
    );
}

export default AddMoreQuizz;
