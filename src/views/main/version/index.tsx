import List from './list';
import { Input, Button } from 'antd';
import React, { useState } from 'react';
import style from './version.module.scss';
const { Search } = Input;
export default function App() {
    const [keyword, setKeyword] = useState<string>("");
    const onSearch = (value: string) => {
        setKeyword(value);
    };

    ////////////////////////////////////////////////
    const handleAddCarInfo = () => {
        let version = "{'soc_version': 'GSL3-V3NA-v2.4.2.4-20230224-210829', 'map_version': 'gcj/mapdata_quanguo_20221205.tar.gz', 'camera_models': 'ai-camera-model/GSL3/2.4.2/20230217_143000/v3na/', 'lidar_models': 'ai-lidar-model/GSL3/v3na/20220920/', 'switch': '0x0A010041 switch2_ver:0x0A020043 ZoneB', 'rs_m1_producer': 'v4.0.8.1', 'CameraProducer': 'v4.0.8.1', 'aduhw_version': '[86, 52, 46, 48, 48, 46, 48, 48]', 'adusw_version': '[51, 46, 48, 48, 46, 49, 50, 0]', 'fl_radar_sw_version': '[67, 82, 53, 84, 80, 95, 90, 72, 73, 84, 79, 95, 66, 76, 48, 51, 95, 86, 48, 49, 32, 32, 32, 32, 32]', 'fr_radar_sw_version': '[67, 82, 53, 84, 80, 95, 90, 72, 73, 84, 79, 95, 66, 76, 48, 51, 95, 86, 48, 49, 32, 32, 32, 32, 32]', 'front_radar_sw_version': '[3, 0, 1, 5, 0, 0, 1, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', 'lidar_fw_version_pl': '[0, 48, 35, 9, 0]', 'lidar_fw_version_ps': '[0, 48, 32, 162, 33]', 'rl_radar_sw_version': '[2, 30, 4]', 'rr_radar_sw_version': '[2, 30, 4]', 'vin': '', 'zic_data_protocol_version_fs': '144', 'zic_data_protocol_version_ri': '144', 'zic_data_protocol_version_tsr': '144', 'zic_data_protolcol_version_obj': '144', 'zic_data_protolcol_version_sync': '144', 'zic_data_protolcol_version_tfl': '144', 'zicsw_version': '[86, 50, 46, 48, 49, 46, 48, 48]', 'zt_pdk_version': ' v3.0.7', 'processmgr_version': 'v4.0.8.1', 'rs_m1_producer_version': 'v4.0.8.1', 'camera_producer_version': 'v4.0.8.1', 'ai_sw_version': 'GSL3-V3NA-v2.4.2.4-20230224-210829-j7a4', 'aps_version': 'V2.3.9', 'adu_mcu_sw_version': 'ZT2102_CP_00_V03.00.12'}"

        fetch("/api/version/carinfo/add", {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                car_id: "J7A4",
                timestamp: Date.now(),
                lonlat: [120.678, 31.399],
                version
            }),
        }).then((v) => v.json());
    };

    const handleReadCarInfo = () => {
        fetch("/api/version/carinfo/list", {
            method: "GET",
            headers: {
                Authorization: getAuthorization(),
            },
        }).then((v) => v.json());
    };

    const handleAddFile = () => {
        const formData = new FormData();
        const fileEl = document.querySelector("#file");
        const files = (fileEl as unknown as { files: any }).files;
        formData.append("car_id", "1");
        formData.append("timestamp", "1667273929732");
        formData.append("data", files[0]);

        fetch("/api/version/camera/add", {
            headers: {
                // "Content-Type": "multipart/form-data" // 不要加这个header
            },
            method: "POST",
            body: formData,
        }).then((v) => v.json());
    };
    const [imgData, setImgData] = useState('');

    const handleReadCamera = () => {
        fetch("/api/version/camera/data?car_id=1&timestamp=1667273929732", {
            headers: {
                Authorization: getAuthorization(),
            },
            method: "GET",
        }).then((v) => v.blob()).then(res => {
            let reader = new FileReader();
            reader.readAsDataURL(res);
            reader.onload = (e) => {
                let url = e?.target?.result;
                setImgData(url as string);
            };
        });
    };

    const getAuthorization = () => {
        let Authorization = "";
        try {
            let data = localStorage.getItem("userInfo");
            const userInfo = JSON.parse(data as string);
            Authorization = userInfo?.token;
        } catch (error) {
            Authorization = "";
        }
        return Authorization ? Authorization : "null";
    };
    
    return (
        <div>
            <h4>版本管理</h4>
            <div className={style.tools}>
                <Search placeholder="输入关键字后按Enter键查询" onSearch={onSearch} enterButton />
            </div>
            <List keyword={keyword}></List>
            {/* <p>建设中...</p>
            <div style={{ margin: "10px" }}>
                <Button onClick={() => {
                    handleAddCarInfo()
                }}>添加版本信息</Button>
                <Button onClick={() => {
                    handleReadCarInfo()
                }}>读取版本信息</Button>
            </div>
            <h4>图片</h4>
            <input id="file" type="file" />
            <Button onClick={() => {
                handleAddFile()
            }}>添加图片</Button>
            <p style={{ margin: "10px" }}>
                <Button onClick={() => {
                    handleReadCamera()
                }}>读取图片</Button>
            </p>
            {
                imgData && <img src={imgData} alt="" />
            } */}
        </div>
    )
}
