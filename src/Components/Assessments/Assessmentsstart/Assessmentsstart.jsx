import React, { useState, useEffect } from "react";
import "./assessmentsstart.css";
import logoela from "../asset/brand-footer.png";
// import questionData from "./Questionsdata.json";
import { FaCheckCircle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-bootstrap/Dropdown";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

//react-router
import { useNavigate } from "react-router-dom";
import { getQuestions, submitAnswer } from "../../../api/api";

const Assessmentsstart = () => {
  const navigate = useNavigate();

  const [questionData, setQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [timeLeft, setTimeLeft] = useState(23 * 60 + 46); // 23 minutes and 46 seconds
  const [selectedUser, setSelectedUser] = useState("Deivasigamani");
  const [selectedUserDropdown, setSelectedUserDropdown] = useState(1);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState({});

  useEffect(() => {
    const fun = async () => {
      if (questionData === null) {
        const data = await getQuestions();
        console.log(data);
        setQuestion(data);
      }
    };
    fun();
  }, []);

  // console.log(questionData)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBookmark = () => {
    // setBookmarkedQuestions((prev) =>
    //   prev.includes(currentQuestionIndex)
    //     ? prev.filter((index) => index !== currentQuestionIndex)
    //     : [...prev, currentQuestionIndex]
    // );
    setBookmarkedQuestions({
      ...bookmarkedQuestions,
      [`${currentSectionIndex}-${currentQuestionIndex}`]:
        bookmarkedQuestions[
          `${currentSectionIndex}-${currentQuestionIndex}`
        ] === "true"
          ? "false"
          : "true",
    });
  };

  const handleNavigation = (direction) => {
    const currentSection = questionData?.sections[currentSectionIndex];
    const currentSectionQuestions = currentSection?.questions?.slice(0, 20);

    if (
      direction === "next" &&
      currentQuestionIndex < currentSectionQuestions?.length - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (direction === "previous" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleOptionChange = (event) => {
    setSelectedOptions({
      ...selectedOptions,
      [`${currentSectionIndex}-${currentQuestionIndex}`]: event.target.value,
    });
  };

  const handleSelectChangeone = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleSelectChange = (event) => {
    const selectedSectionIndex = parseInt(event.target.value) - 1;
    setSelectedUserDropdown(event.target.value);
    setCurrentSectionIndex(selectedSectionIndex);
    setCurrentQuestionIndex(0);
  };

  // const handleFinishClick = () => {
  //   setTimeout(() => {
  //       navigate("/finish-assessment");
  //   }, 2000);
  // };

  const handleNextSection = () => {
    if (currentSectionIndex < questionData?.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return (
      <div className="time-row">
        <div className="time-item">
          <p className="para-one">{hours.toString().padStart(2, "0")}</p>
          <p className="para-two">Hours</p>
        </div>
        <div className="time-item">
          <p className="para-one">{minutes.toString().padStart(2, "0")}</p>
          <p className="para-two">Minutes</p>
        </div>
        <div className="time-item">
          <p className="para-one">
            {remainingSeconds.toString().padStart(2, "0")}
          </p>
          <p className="para-two">Seconds</p>
        </div>
      </div>
    );
  };

  const formatTimevalue = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    var time = "0";
    console.log(minutes);
    if (hours > 0) {
      time =
        hours.toString().padStart(2, "0") +
        " hours " +
        minutes.toString().padStart(2, "0") +
        " minutues " +
        remainingSeconds.toString().padStart(2, "0") +
        " seconds";
    } else if (minutes > 0) {
      time =
        minutes.toString().padStart(2, "0") +
        " minutues " +
        remainingSeconds.toString().padStart(2, "0") +
        " seconds";
    } else {
      time = remainingSeconds.toString().padStart(2, "0") + " seconds";
    }
    return time;
  };

  const sections = questionData?.sections;
  const currentSection = sections && sections[currentSectionIndex];
  const currentSectionQuestions = currentSection?.questions?.slice(0, 20);
  const currentQuestion =
    currentSectionQuestions && currentSectionQuestions[currentQuestionIndex];

  let [totalQuestions, settotalQuestions] = useState(0);
  useEffect(() => {
    var total = 0;
    for (var index in sections) {
      total += sections[index].questions.length;
    }
    settotalQuestions(total);
  }, []);
  const answeredCount = Object.keys(selectedOptions).length;
  const bookmarkedCount = Object.keys(bookmarkedQuestions).length;
  const notAnsweredCount = totalQuestions - answeredCount;


  const isCurrentSectionCompleted = currentSectionQuestions?.every((_, index) =>
    selectedOptions.hasOwnProperty(`${currentSectionIndex}-${index}`)
  );

  function logout() {
    confirmAlert({
      title: "You are about to Logout",
      message:
        "This will lead to loss of test progress, Do you wish to continue?",
      buttons: [
        {
          label: "Yes",
          onClick: () => navigate("../"),
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  }

  function finishtest() {
    console.log(selectedOptions);
    console.log(notAnsweredCount)
    if (notAnsweredCount > 0) {
      confirmAlert({
        title: "You have " + notAnsweredCount + " unanswered questions",
        message: "Do you wish to continue?",
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              const res = await submitAnswer({selectedOptions,questionData,username:"dev"});
              if (res) navigate("/finish-assessment");
            },
          },
          {
            label: "No",
            onClick: () => console.log("Click No"),
          },
        ],
      });
    } else {
      confirmAlert({
        title: "You have " + formatTimevalue(timeLeft) + " time left",
        message:
          "Make sure that your answer are correct. Do you wish to continue?",
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              const res = await submitAnswer({selectedOptions,questionData,username:"dev"});
              if (res) navigate("/finish-assessment");
            },
          },
          {
            label: "No",
            onClick: () => console.log("Click No"),
          },
        ],
      });
    }
  }

  return (
    <div className="assessment-head">
      <div className="assessment-inside">
        <div className="nav-content">
          <div className="brand-logo">
            <img src={logoela} alt="C-Suite Academy" height="40px" />
          </div>
          <>
            <Dropdown>
              <Dropdown.Toggle id="dropdown-basic">
                Deivasigamani
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {/* <Dropdown.Item>Profile</Dropdown.Item> */}
                <Dropdown.Item
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
                  Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
          <button
            className="button-finish"
            onClick={(e) => {
              e.preventDefault();
              finishtest();
            }}
          >
            Finish
          </button>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="w-75 h-100">
              <main className="quiz-main">
                <div className="first-content">
                  <p className="count-question">
                    {(currentQuestionIndex + 1).toString().padStart(2, "0")}
                    <span>/</span>
                    {currentSectionQuestions?.length}
                  </p>
                  <select
                    className="change-selection"
                    value={selectedUserDropdown}
                    onChange={handleSelectChange}
                  >
                    {" "}
                    {/* Use selectedUserDropdown state here */}
                    {sections?.map((section, index) => (
                      <option key={index} value={index + 1}>{`Section - ${
                        index + 1
                      }`}</option>
                    ))}
                  </select>
                </div>

                <p className="question-style">{currentQuestion?.question}</p>

                <form>
                  {currentQuestion?.options.map((option, index) => (
                    <div className="button-style-icons" key={index}>
                      <label>
                        <input
                          type="radio"
                          value={option}
                          checked={
                            selectedOptions[
                              `${currentSectionIndex}-${currentQuestionIndex}`
                            ] === option
                          }
                          onChange={handleOptionChange}
                        />
                        <FaCheckCircle className="icon-style" size="1.8rem" />
                        {` ${String.fromCharCode(65 + index)}. ${option}`}
                      </label>
                    </div>
                  ))}
                </form>

                <div className="navigation-button">
                  <button
                    className="button-previous"
                    onClick={() => handleNavigation("previous")}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    className="button-next"
                    onClick={() => handleNavigation("next")}
                    disabled={
                      currentQuestionIndex ===
                      currentSectionQuestions?.length - 1
                    }
                  >
                    Next
                  </button>
                  <button
                    className="button-bookmark"
                    onClick={handleBookmark}
                  >{`${
                    bookmarkedQuestions[
                      `${currentSectionIndex}-${currentQuestionIndex}`
                    ] == "true"
                      ? "Bookmarked"
                      : "Bookmark"
                  }`}</button>
                </div>

                {isCurrentSectionCompleted &&
                  currentSectionIndex < sections?.length - 1 && (
                    <div className="next-section-button">
                      <button
                        className="button-next-section"
                        onClick={handleNextSection}
                      >
                        Next Section
                      </button>
                    </div>
                  )}
              </main>
            </div>
            <div className="w-25 h-100">
              <div className="right-side-component">
                <div className="timer">{formatTime(timeLeft)}</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <div className="questions">
                    <p>Questions</p>
                  </div>
                  <select
                    className="change-selection-two"
                    value={selectedUserDropdown}
                    onChange={handleSelectChange}
                  >
                    {sections?.map((section, index) => (
                      <option key={index} value={index + 1}>{`Section ${
                        index + 1
                      }`}</option>
                    ))}
                  </select>
                  <div id="Test-marks-container">
                    <div className="question-numbers">
                      {currentSectionQuestions?.map((question, quesIndex) => (
                        <button
                          key={quesIndex}
                          className={`question-number ${
                            quesIndex === currentQuestionIndex ? "active" : ""
                          } 
                          ${
                            selectedOptions[
                              `${currentSectionIndex}-${quesIndex}`
                            ]
                              ? "answered"
                              : ""
                          } 
                          `}
                          onClick={() => setCurrentQuestionIndex(quesIndex)}
                        >
                          {/* {`${(quesIndex + 1).toString().padStart(2, '0')}`} <FontAwesomeIcon icon={faCheckCircle} style={{color:`${!selectedOptions[`${currentSectionIndex}-${quesIndex}`] && bookmarkedQuestions[`${currentSectionIndex}-${quesIndex}`]=="true"? 'orange' : ''}`}}  size='1rem'className='icon-check pl-4' /> */}
                          {`${(quesIndex + 1).toString().padStart(2, "0")}`}{" "}
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            size="1rem"
                            className={`icon-check pl-4 ${
                              bookmarkedQuestions[
                                `${currentSectionIndex}-${quesIndex}`
                              ] == "true"
                                ? "bookmarked"
                                : ""
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="test-checkup-field">
                  <div id="answered-txt">
                    Answered
                    <span>
                      {answeredCount}/{totalQuestions}
                    </span>
                  </div>
                  <div id="not-answered-txt">
                    Not Answered
                    <span>
                      {notAnsweredCount}/{totalQuestions}
                    </span>
                  </div>
                  <div id="bookmarked-txt">
                    Bookmarked <span>{bookmarkedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessmentsstart;
