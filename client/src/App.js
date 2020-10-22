import React from 'react';
import "./App.css";
import Game from "./Components/Game";
import {Route,Switch} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Game}/>
      </Switch>
       
    </div>
  );
}

export default App;
