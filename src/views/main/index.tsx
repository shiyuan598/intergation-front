import "./index.scss";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import RouteList from "../../components/routes";
import { DataContext } from "../../context";
import { useEffect, useState } from "react";
import moment from "moment";
import "moment/locale/zh-cn";
import zhCN from "antd/es/locale/zh_CN";
import { ConfigProvider } from "antd";
import { io } from "socket.io-client";

moment.locale("zh");

function App() {
    const socketUrl = window.globalConfig.socketUrl;
    useEffect(() => {
        const socket = io(socketUrl, {
            transports: ["websocket"],
            path: "/socket.io",
            upgrade: false,
            forceNew: true,
            reconnection: false,
            secure: true,
            rejectUnauthorized: false,
            query: {
                EIO: 1,
                transport: "websocket"
            }
        });
        socket.on("connect", function () {
            console.log("Connected to Flask-SocketIO");
        });

        socket.on("disconnect", function () {
            console.log("Disconnected from Flask-SocketIO");
        });

        socket.on("my_response", function (data) {
            var message = data["message"];
            console.info(message);
        });

        socket.on("update_process", function (data) {
            console.info(data);
        });
    }, []);

    const [apiProcessNum, setApiProcessNum] = useState(0);
    const [appProcessNum, setAppProcessNum] = useState(0);
    const [projectNum, setProjectNum] = useState(0);
    const [moduleNum, setModuleNum] = useState(0);
    const [todoNum, setTodoNum] = useState(0);
    const [userNum, setUserNum] = useState(0);
    return (
        <ConfigProvider locale={zhCN}>
            <div className="desktop">
                <DataContext.Provider
                    value={{
                        apiProcessNum,
                        setApiProcessNum,
                        appProcessNum,
                        setAppProcessNum,
                        projectNum,
                        setProjectNum,
                        moduleNum,
                        setModuleNum,
                        todoNum,
                        setTodoNum,
                        userNum,
                        setUserNum
                    }}>
                    <Header></Header>
                    <main>
                        <div className="aside">
                            <Sidebar></Sidebar>
                        </div>
                        <div className="content">
                            <RouteList></RouteList>
                        </div>
                    </main>
                </DataContext.Provider>
            </div>
        </ConfigProvider>
    );
}

export default App;
