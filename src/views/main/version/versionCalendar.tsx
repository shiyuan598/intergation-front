import { Modal, Calendar, message, Spin } from "antd";
import React, { Fragment, useContext, useState, useEffect } from "react";
import type { Moment } from "moment";
import { ModalContext } from "../../../context";
import style from "./versionCalendar.module.scss";
import { version as versionApi } from "../../../api";
import ReactJSONViewer from "react-json-view";

const App = () => {
    const [versionInfo, setVersionInfo] = useState({}); // 预览的版本数据
    const [versionModalVisible, setVersionModalVisible] = useState(false);
    const { modalShow, setModalShow, curRow } = useContext(ModalContext) as {
        modalShow: boolean;
        setModalShow: Function;
        curRow: { vehicleNo: string };
        setCurRow: Function;
    };
    const [versionData, setVersionData] = useState(
        [] as { carId: string; timestamp: number; date: string; time: string }[]
    );
    const [loading, setLoading] = useState(false); // loading

    const handleOk = () => {
        setModalShow(false);
    };

    const handleCancel = () => {
        setModalShow(false);
    };

    const getFormatVersionTimeList = (data: { carId: string; datetime: string; timestamp: number }[]) => {
        let versionList: { carId: string; timestamp: number; date: string; time: string }[] = [];
        data.forEach((item) => {
            const [date, time] = item.datetime.split(" ");
            versionList.push({
                carId: item.carId,
                timestamp: item.timestamp,
                date,
                time
            });
        });
        return versionList;
    };

    const showDetail = (carId: string, timestamp: number) => {
        setLoading(true);
        versionApi
            .getCarInfoHistoryDetail(carId, timestamp)
            .then((v) => {
                try {
                    setVersionInfo(JSON.parse(v.data[0].version.replaceAll("'", '"')));
                    setVersionModalVisible(true);
                } catch (error) {
                    console.info(error);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        if (curRow?.vehicleNo) {
            setLoading(true);
            versionApi
                .getCarInfoHistory(curRow.vehicleNo)
                .then((v) => {
                    if (v.code === 0) {
                        setVersionData(getFormatVersionTimeList(v.data));
                    } else {
                        message.error(v.msg);
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [curRow]);

    const dateFullCellRender = (value: Moment) => {
        const match = versionData.filter((item) => {
            const date = item.date;
            return date === value.format("YYYY-MM-DD");
        });
        return (
            <div className={match.length ? style["date-cell-picker-disable"] : style["date-cell-picker-enable"]}>
                <div>{value.format("DD")}</div>
                {match.map((item, index) => (
                    <div
                        onClick={() => {
                            showDetail(item.carId, item.timestamp);
                        }}
                        key={item.carId + item.timestamp}>
                        {item.time}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Fragment>
            <Modal
                width={"75%"}
                title={`${curRow?.vehicleNo}历史版本`}
                open={modalShow}
                footer={null}
                onOk={handleOk}
                onCancel={handleCancel}>
                <Spin spinning={loading}>
                    <Calendar className="custom-calendar" dateFullCellRender={dateFullCellRender} />
                </Spin>
            </Modal>

            <Modal
                width={700}
                title="查看版本信息"
                open={versionModalVisible}
                footer={null}
                onCancel={() => {
                    setVersionModalVisible(false);
                }}>
                <ReactJSONViewer displayDataTypes={false} theme="ashes" src={versionInfo}></ReactJSONViewer>
            </Modal>
        </Fragment>
    );
};

export default App;
