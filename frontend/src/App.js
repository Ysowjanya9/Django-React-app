import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import { GenericList } from "./components/GenericList";
import GenericForm from "./components/GenericForm";
import GenericView from "./components/GenericView";
import "./App.css";

function App() {
  const models = ["teams", "drivers", "races"];
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {models.map((model) => (
          <React.Fragment key={model}>
            <Route path={`/${model}`} element={<GenericList model={model} />} />
            <Route
              path={`/${model}/create`}
              element={<GenericForm model={model} />}
            />
            <Route
              path={`/${model}/edit/:id`}
              element={<GenericForm model={model} />}
            />
            <Route
              path={`/${model}/view/:id`}
              element={<GenericView model={model} />}
            />
          </React.Fragment>
        ))}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
