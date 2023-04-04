import "./index.scss";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import RouteList from "../../components/routes";
import { DataContext } from "../../context";
import { useState } from "react";
import moment from "moment";
import "moment/locale/zh-cn";
import zhCN from "antd/es/locale/zh_CN";
import { ConfigProvider } from "antd";

moment.locale("zh");

function App() {
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
