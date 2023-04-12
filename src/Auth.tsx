import React, { useContext, useEffect } from "react";
import { Switch, Route, Redirect, useHistory, useLocation } from "react-router-dom";
import Main from "./views/main/index";
import Login from "./views/login/index";
import UserRegister from "./views/login/userRegister";
import ResetPassword from "./views/login/resetPassword";
import { UserContext } from "./context";

function App() {
    const { userInfo, setUserInfo } = useContext(UserContext) as {
        userInfo: {
            username: string;
            role: number;
            token?: string;
        };
        setUserInfo: Function;
    };

    const history = useHistory();
    const location = useLocation();
    useEffect(() => {
        // 判断如果userInfo和本地存储中均无用户信息时就跳转到登录页
        let data = localStorage.getItem("userInfo");
        let { pathname } = location;
        let nologinRoutes = ["/login", "/register", "/resetPassword"];
        if (!(userInfo as { username: string })?.username && !JSON.parse(data as string)?.username) {
            if (!nologinRoutes.includes(pathname)) {
                history.push("/login");
            }
        }
    }, [userInfo, history]);

    useEffect(() => {
        // 初始化时从本地存储读取用户信息
        let data = localStorage.getItem("userInfo");
        if (data && JSON.parse(data as string).username) {
            setUserInfo(JSON.parse(data as string));
        }
    }, [setUserInfo]);

    const authRoute = () => {
        if (userInfo.username) {
            return "/main";
        } else {
            return "/login";
        }
    };

    return (
        <Switch>
            <Route path="/main" render={() => <Main />}></Route>
            <Route path="/login" render={() => <Login />}></Route>
            <Route path="/register" render={() => <UserRegister />}></Route>
            <Route path="/resetPassword" render={() => <ResetPassword />}></Route>
            <Redirect from="/" to={authRoute()} exact></Redirect>
        </Switch>
    );
}

export default App;
