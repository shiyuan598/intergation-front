import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";

// // 模拟登录
// localStorage.setItem(
//     "userInfo",
//     JSON.stringify({
//         id: 1,
//         name: "超级用户",
//         role: 0,
//         telephone: "13161507755",
//         token: "2023032902085784707394775",
//         username: "SuperVip"
//     })
// );

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <Router>
        <div className="main">
            <App></App>
        </div>
    </Router>
);
