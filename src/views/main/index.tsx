import './index.scss';
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import RouteList from '../../components/routes';
import { DataContext } from '../../context';
import { useState } from 'react';
import moment from 'moment';
import 'moment/locale/zh-cn';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider } from 'antd';

moment.locale('zh');

function App() {
    const [vehicleNum, setVehicleNum] = useState(0);
    const [noticeNum, setNoticeNum] = useState(0);
    const [orderNum, setOrderNum] = useState(0);
    const [userNum, setUserNum] = useState(0);
    const [versionNum, setVersionNum] = useState(0);

    return (
        <ConfigProvider locale={zhCN}>
            <div className="desktop">
                <DataContext.Provider value={{
                    vehicleNum, setVehicleNum, noticeNum, setNoticeNum,
                    orderNum, setOrderNum,
                    userNum, setUserNum,
                    versionNum, setVersionNum,
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