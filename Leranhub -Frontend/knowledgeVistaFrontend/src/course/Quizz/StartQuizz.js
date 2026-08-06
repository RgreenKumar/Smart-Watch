import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import baseUrl from '../../api/utils';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import QuizzInstruction from './QuizzInstruction';

const StartQuizz = () => {
    const { quizzName, quizzId, batchName, batchId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const token = sessionStorage.getItem("token");
    const MySwal = withReactContent(Swal);
    const [duration, setDuration] = useState(1);
    const [timeLeft, setTimeLeft] = useState(0); // Time left in seconds
    const navigate = useNavigate();
    const [proceedClicked, setProceedClicked] = useState(false);

    const handleProceedClick = () => {
        setProceedClicked(true);
        setTimeLeft(duration * 60); // Convert minutes to seconds
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`${baseUrl}/Quizz/Start`, {
                    params: { quizzId, batchId },
                    headers: { Authorization: token }
                });

                if (response.status === 200) {
                    if (Array.isArray(response?.data?.questions)) {
                        setQuestions(response?.data?.questions);
                    }
                   // setDuration(response?.data?.duration);
                } else if (response.status === 204) {
                    navigate("/notFound");
                }
            } catch (err) {
                console.log(err);
                if (err?.response?.status === 401) {
                    navigate("/unauthorized");
                } else if (err?.response?.status === 403) {
                    MySwal.fire({
                        icon: "warning",
                        title: "Forbidden",
                        text: err?.response?.data || "Access Denied",
                    });
                    navigate(-1);
                }
            }
        };

        fetchQuestions();
    }, []);

    // Timer effect
    useEffect(() => {
        if (!proceedClicked || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit when time runs out
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, proceedClicked]);

    // Format time in HH:MM:SS
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours}h ${minutes}m ${secs < 10 ? '0' : ''}${secs}s`;
    };

    const handleSelectAnswer = (questionId, answerText) => {
        setSelectedAnswers((prevAnswers) => {
            const existingAnswerIndex = prevAnswers.findIndex(ans => ans.questionId === questionId);

            if (existingAnswerIndex !== -1) {
                const updatedAnswers = [...prevAnswers];
                updatedAnswers[existingAnswerIndex] = { questionId, selected: answerText };
                return updatedAnswers;
            } else {
                return [...prevAnswers, { questionId, selected: answerText }];
            }
        });
    };

    const handleNextQuestion = () => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    };

    const handlePrevQuestion = () => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
    };

    const handleSubmit = async () => {
        
        try {
            const response = await axios.post(`${baseUrl}/Quizz/submit`, selectedAnswers, {
                params: {
                    quizzId: quizzId,
                },
                headers: {
                    Authorization: token
                }
            });
            if (response?.status === 200) {
                MySwal.fire({
                    icon: "success",
                    title: response?.data,
                    confirmButtonText: "OK", // Button text
                    // allowOutsideClick: false, // Prevent closing by clicking outside
                }).then(() => {
                    // Redirect only after closing the popup
                    navigate("/user/ProgramCalender");
                });
            }
        } catch (err) {
            if (err?.response && err?.response?.status === 401) {
                MySwal.fire({
                    icon: "warning",
                    title: "Unauthorized",
                    text: err?.response.data
                });
                navigate("/unauthorized");
            }
            console.log(err);
        }
    };

    return (
        <div>
            <div className="page-header"></div>
            {!proceedClicked ? (
                <QuizzInstruction handleProceedClick={handleProceedClick} quizzName={quizzName} noofQuestion={questions?.length} timeLeft={formatTime(duration * 60)} />
            ) : (
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-12">
                                {questions.length === 0 ? (
                                    <div className="centerflex">
                                        <div className="enroll">
                                            <h2>Quiz Not Found</h2>
                                            <button onClick={() => navigate(-1)} className="btn btn-primary">Go Back</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className='full-Width'>
                                       <div className={`timer-container ${timeLeft <= 10 ? 'danger' : ''}`}>
    <p className="timer">
        <i className="fa-solid fa-stopwatch-20"></i> Time Left: {formatTime(timeLeft)}
    </p>
    </div>
</div>


                                    <div className="atgrid">
                                          
                                       
                                        <h3>{questions[currentQuestionIndex].questionText}</h3>
                                        <ul className="listgroup">
                                            {[1, 2, 3, 4].map((num) => {
                                                const optionValue = questions[currentQuestionIndex][`option${num}`];
                                                return (
                                                    <li className="lielement" key={num}>
                                                        <input
                                                            type="radio"
                                                            id={`option${num}-${questions[currentQuestionIndex].questionId}`}
                                                            name={`answer-${questions[currentQuestionIndex].questionId}`}
                                                            value={optionValue}
                                                            checked={selectedAnswers.some(
                                                                ans => ans.questionId === questions[currentQuestionIndex].questionId && ans.selected === optionValue
                                                            )}
                                                            onChange={() => handleSelectAnswer(questions[currentQuestionIndex].questionId, optionValue)}
                                                        />
                                                        <label htmlFor={`option${num}-${questions[currentQuestionIndex].questionId}`}>
                                                            {optionValue}
                                                        </label>
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        <div className="cornerbtns">
                                            {currentQuestionIndex > 0 && (
                                                <button className="btn btn-primary" onClick={handlePrevQuestion}>
                                                    Previous
                                                </button>
                                            )}

                                            <div style={{ flex: 1 }}></div>

                                            {currentQuestionIndex < questions.length - 1 ? (
                                                <button
                                                    onClick={handleNextQuestion}
                                                    disabled={!selectedAnswers.some(ans => ans.questionId === questions[currentQuestionIndex].questionId)}
                                                    className="btn btn-primary"
                                                >
                                                    Next
                                                </button>
                                            ) : (
                                                <button onClick={handleSubmit} className="btn btn-success">
                                                    Submit
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>)}
        </div>
    );
};

export default StartQuizz;
