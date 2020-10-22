import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "../styles/Game.scss";
const ENDPOINT = "https://magicball-character-guess.herokuapp.com/";
let socket;
const Game = () => {
  const [question, setquestion] = useState("");
  const [options, setoptions] = useState([]);
  const [session, setsession] = useState("");
  const [answers, setanswers] = useState([]);
  const [username, setusername] = useState("");
  const [isloading, setisloading] = useState(false);
  const [gamestarted, setgamestarted] = useState(false);
  const [gameended, setgameended] = useState(false);
  const [currentStep, setcurrentStep] = useState(0);
  const [found, setfound] = useState(false);

  useEffect(() => {
    socket = io(ENDPOINT);
  }, [ENDPOINT]);
  const JoinGame = () => {
    var name = document.getElementById("name");
    if (name.value !== "") {
      setisloading(true);

      socket.emit("join", name.value, (returneddata) => {
        //console.log(returneddata);
        setquestion(returneddata.question);
        setoptions(returneddata.answers);
        setsession(returneddata.session);
        setusername(name.value);
        setcurrentStep(returneddata.currentStep);
        setisloading(false);
        setgamestarted(true);
        name.value = "";
      });

      return () => {
        socket.emit("disconnect");

        setsession("");
        setquestion("");
        setoptions([]);
        setanswers([]);
      };
    } else {
      alert("Please Enter a Name!");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    var radios = document.getElementsByName("options");
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        var data = {
          answer: radios[i].value,
          session: session,
        };
        var checkedradio = radios[i];
        break;
      }
    }
    // console.log(data);
    if (checkedradio) {
      socket.emit("answered", data, () => {
        checkedradio.checked = false;
      });
    } else {
      alert("Select answer!");
    }
  };
  useEffect(() => {
    socket.on("Question", (returneddata) => {
      // console.log(returneddata);
      setquestion(returneddata.question);
      setoptions(returneddata.answers);
      setsession(returneddata.session);
      setcurrentStep(returneddata.currentStep);
    });
    socket.on("Foundmatches", (data) => {
      setquestion("");
      setanswers(data.matches);
      var x = currentStep;
      setcurrentStep(x + 1);
      setgameended(true);
    });
  }, [currentStep]);

  return (
    <div className="Game">
      {isloading ? <div className="lds-hourglass"></div> : null}
      {!isloading ? <div className="Icon"></div> : null}
      {!gamestarted && !isloading ? (
        <div className="User-div">
          <div className="Username">
            <input placeholder="Name" id="name" />
          </div>
          <div className="Join-Game u-margin-top-small">
            <button onClick={JoinGame}>Start Game</button>
          </div>
        </div>
      ) : null}

      {question !== "" ? (
        <form onSubmit={handleSubmit}>
          <div className="Question">{question}</div>
          {options.length > 0 ? (
            <div>
              {options.map((x, index) => (
                <div className="Options" key={index}>
                  <input
                    className="Radio-input"
                    type="radio"
                    value={index}
                    id={x}
                    name="options"
                  />
                  <span className="Checkmark"></span>
                  <label className="Labels" htmlFor={x}>
                    {x}
                  </label>
                </div>
              ))}
            </div>
          ) : null}
          <div className="Next">
            <button>Next</button>
          </div>
        </form>
      ) : null}

      {answers.length > 0 ? (
        <div className="Result-sentence">
          {!found ? (
            <span>
              {username} Is this you charectar? 🤔(If not scroll down to see my
              next guess)
            </span>
          ) : (
            <span>Thanks For Playing 😃😁</span>
          )}
        </div>
      ) : null}
      {answers.length > 0 ? (
        <div className="Answers-row">
          {answers.map((answer, index) => (
            <div className="Charectar-div" key={index}>
              <div className="Charectar-name">{answer.name}</div>
              <div className="Charectar-image">
                <img src={answer.absolute_picture_path} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {answers.length > 0 ? (
        <div className="Found">
          {!found ? (
            <button onClick={() => setfound(true)}>Found?</button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
export default Game;
