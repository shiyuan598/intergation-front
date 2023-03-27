import { message, Empty } from "antd";
import { Table, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState, Fragment, useEffect } from "react";
import VersionCalendarModal from "./versionCalendar";
import { ModalContext } from "../../../context";
import { version as versionApi } from "../../../api";
import ReactJSONViewer from "react-json-view";

interface DataType {
    id: string;
    vehicleNo: string;
    datetime: string;
    lon: number;
    lat: number;
    version: string;
}

const App = (props: { keyword: string }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [pagination, setPagination] = useState({});
    const [versionInfo, setVersionInfo] = useState({}); // 预览的版本数据
    const [versionModalVisible, setVersionModalVisible] = useState(false);
    const [versionCalendarModalShow, setVersionCalendarModalShow] = useState(false);
    const [cameraInfo, setCameraInfo] = useState([]); // 所有照片信息
    const [imgIndex, setImgIndex] = useState(0);
    const [imgData, setImgData] = useState("");
    const [imgModalVisible, setImgModalVisible] = useState(false);
    const [curRow, setCurRow] = useState<DataType | null>(null);

    const showVersionInfo = (e: any, v: DataType) => {
        e.stopPropagation();
        try {
            if (v.version) {
                setVersionInfo(JSON.parse(v.version.replaceAll("'", '"')));
            } else {
                setVersionInfo({
                    message: "no data"
                });
            }
            setVersionModalVisible(true);
        } catch (error) {
            console.info(error);
        }
    };

    const showVersionHistory = (e: any, v: DataType) => {
        e.stopPropagation();
        setVersionCalendarModalShow(true);
        setCurRow(v);
    };

    const showCamera = (e: any, v: DataType) => {
        e.stopPropagation();
        setLoading(true);
        versionApi
            .getCameraInfo(v.vehicleNo)
            .then((v) => {
                setCameraInfo(v.data);
                setImgModalVisible(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const closeCamera = () => {
        setImgModalVisible(false);
        setCameraInfo([]);
        setImgData("");
        setImgIndex(0);
    };

    const preImg = () => {
        if (imgIndex > 0) {
            setImgIndex(imgIndex - 1);
        }
    };

    const nextImg = () => {
        if (imgIndex < cameraInfo.length - 1) {
            setImgIndex(imgIndex + 1);
        }
    };

    useEffect(() => {
        if (cameraInfo.length) {
            const { carId: vehicleNo, timestamp, id } = cameraInfo[imgIndex];
            versionApi
                .getCamera(vehicleNo, timestamp)
                .then((res) => {
                    if (res.size) {
                        let reader = new FileReader();
                        reader.readAsDataURL(res);
                        reader.onload = (e) => {
                            let url = e?.target?.result;
                            setImgData(url as string);
                        };
                    } else {
                        setImgData("");
                    }
                })
                .then(() => {
                    let timer: any = null;
                    const getCameraNew = () => {
                        if (!imgModalVisible) {
                            clearTimeout(timer);
                            timer = null;
                            return;
                        }
                        versionApi.getCameraNew(vehicleNo, id).then((res) => {
                            if (res.size) {
                                let reader = new FileReader();
                                reader.readAsDataURL(res);
                                reader.onload = (e) => {
                                    let url = e?.target?.result;
                                    setImgData(url as string);
                                    timer = setTimeout(getCameraNew, 1000);
                                };
                            }
                        });
                    };

                    getCameraNew();
                });
        }
    }, [cameraInfo, imgIndex]);

    const columns: ColumnsType<DataType> = [
        {
            title: "VehicleNo",
            dataIndex: "vehicleNo",
            key: "vehicleNo"
        },
        {
            title: "DateTime",
            dataIndex: "datetime",
            key: "datetime"
        },
        {
            title: "操作",
            dataIndex: "",
            key: "x",
            render: (v: DataType) => {
                return (
                    <Fragment>
                        <a href="#!" onClick={(e) => showVersionInfo(e, v)}>
                            版本信息
                        </a>
                        <a href="#!" onClick={(e) => showVersionHistory(e, v)}>
                            历史版本
                        </a>
                        <a href="#!" onClick={(e) => showCamera(e, v)}>
                            查看照片
                        </a>
                    </Fragment>
                );
            }
        }
    ];

    const getData = (pageNo: number, name: string = "") => {
        setLoading(true);
        versionApi
            .getCarInfo(pageNo, name)
            .then((v) => {
                if (v.code === 0) {
                    setData(v.data);
                    setPagination(v.pagination);
                } else {
                    message.error(v.msg);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const pageChange = (pageNo: number, pageSize: number) => {
        setPageNo(pageNo);
    };

    // 搜索条件变化时页码重置为1
    useEffect(() => {
        setPageNo(1);
    }, [props.keyword]);

    useEffect(() => {
        getData(pageNo, props.keyword);
    }, [pageNo, props.keyword]);

    return (
        <Fragment>
            <Table
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: false,
                    onChange: pageChange
                }}
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={data}
            />
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
            <ModalContext.Provider
                value={{
                    modalShow: versionCalendarModalShow,
                    setModalShow: setVersionCalendarModalShow,
                    curRow,
                    setCurRow
                }}>
                <VersionCalendarModal></VersionCalendarModal>
            </ModalContext.Provider>
            <Modal
                className="image-modal"
                width={"60%"}
                style={{ textAlign: "center" }}
                title="查看照片"
                open={imgModalVisible}
                footer={null}
                onCancel={closeCamera}>
                {imgData ? (
                    <>
                        {/* <LeftOutlined onClick={preImg} className={'image-switch-arrow left-switch-arrow ' + (imgIndex === 0 ? ' image-switch-arrow-disabled' : '')} />
          <RightOutlined onClick={nextImg} className={'image-switch-arrow right-switch-arrow ' + (imgIndex === cameraInfo.length - 1 ? ' image-switch-arrow-disabled' : '')} /> */}
                        <img width={"100%"} height={"100%"} src={imgData} alt="" />
                    </>
                ) : (
                    <Empty />
                )}
            </Modal>
        </Fragment>
    );
};

export default App;
