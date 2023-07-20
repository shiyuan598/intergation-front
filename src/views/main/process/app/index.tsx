import React, { useState, Fragment, useEffect, useContext } from "react";
import { Modal, Input, Button, Table, message, Tag, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ReactJSONViewer from "react-json-view";
import style from "../process.module.scss";
import { getUserInfo } from "../../../../common/user";
import { saveFile } from "../../../../common/util";
import type { ColumnsType } from "antd/es/table";
import { appProcess, tools as toolsApi } from "../../../../api";
import { ModalContext, DataContext } from "../../../../context";
import AddApiModal from "./addApp";
import configImg from "../../../../assets/config.svg";
import jenkinsImg from "../../../../assets/jenkins.png";
import artifactsImg from "../../../../assets/artifacts.svg";
import confluenceImg from "../../../../assets/confluence.svg";
import testResultImg from "../../../../assets/autotest.png";
import { joinPath, getCurDatetime } from "../../../../common/util";

const { Search } = Input;

interface DataType {
    id: number;
    project: string;
    project_name: string;
    version: string;
    build_type: string;
    type: number;
    api_version: string;
    creator: number;
    creator_name: string;
    create_time: string;
    update_time: string;
    state: number;
    lidar: string;
    camera: string;
    map: string;
    plan_map: string;
    lidar_point: string;
    webviz: string;
    mcu: string;
    driver: string;
    sdc: string;
    lidar_path: string;
    camera_path: string;
    map_path: string;
    plan_map_path: string;
    lidar_point_path: string;
    webviz_path: string;
    mcu_path: string;
    driver_path: string;
    sdc_path: string;
    modules: string;
    state_name: string;
    jenkins_url: string;
    artifacts_url: string;
    confluence_url: string;
    test_result_url: string;
    auto_test: string;
}

export default function App() {
    const [modalShow, setModalShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>([]);
    const [sorter, setSorter] = useState<any>(null);
    const [pageNo, setPageNo] = useState(1);
    const [pagination, setPagination] = useState({});
    const [curRow, setCurRow] = useState<DataType | null>(null);
    const [keyword, setKeyword] = useState<string>("");
    const [moduleInfoVisible, setModuleInfoVisible] = useState(false);
    const [moduleInfo, setModuleInfo] = useState({});
    const { appProcessNum, setAppProcessNum } = useContext(DataContext) as {
        appProcessNum: number;
        setAppProcessNum: Function;
    };

    const createApi = () => {
        setCurRow(null);
        setModalShow(true);
    };
    const exportConfig = (e: any, v: any) => {
        e.stopPropagation();
        saveFile(JSON.stringify(generatorBuildConfig(v), null, 4), `${v.project_name}_${v.version}.json`);
    };
    const generatorBuildConfig = (v: DataType) => {
        const modules = JSON.parse(v.modules);
        // 用户选择的三类模块
        let config: any = {};
        let base: any = {};
        let common: any = {};
        let prebuild: any = {};
        let perceptions: any = {};
        Object.keys(modules).forEach((k) => {
            let item = {
                url: modules[k].url,
                branch: modules[k].version || "",
                owner: modules[k].owner_name,
                release_note: modules[k].release_note || ""
            };
            // 分为base\common\config三部分
            if (modules[k].type === 0) {
                delete item.release_note;
                if (k === "perception_common") {
                    prebuild[k] = item;
                } else if (k === "adm" || k === "system_tools") {
                    common[k] = item;
                } else {
                    base[k] = item;
                }
            } else if (modules[k].type === 2) {
                if (["zloc", "zmap", "prediction", "planning"].includes(k)) {
                    prebuild[k] = item;
                } else if (
                    [
                        "routing",
                        "perception_camera_obs",
                        "perception_radar",
                        "perception_lidar",
                        "perception_fusion"
                    ].includes(k)
                ) {
                    perceptions[k] = item;
                } else {
                    common[k] = item;
                }
            } else if (modules[k].type === 3) {
                delete item.release_note;
                config[k] = item;
            }
        });

        const result: any = {
            project: v.project_name,
            version: v.version,
            build_type: v.build_type,
            user: getUserInfo().username,
            timestamp: getCurDatetime(v.create_time),
            config,
            base,
            prebuild,
            perceptions,
            modules: common,
            auto_test: v.auto_test
        };
        v.lidar && (result["lidar_model"] = joinPath(v.lidar_path, v.lidar));
        v.camera && (result["camera_model"] = joinPath(v.camera_path, v.camera));
        v.map && (result["map_data"] = joinPath(v.map_path, v.map));
        v.plan_map && (result["plan_map_data"] = joinPath(v.plan_map_path, v.plan_map));
        v.lidar_point && (result["lidar_point_data"] = joinPath(v.lidar_point_path, v.lidar_point));
        v.mcu && (result["mcu_data"] = joinPath(v.mcu_path, v.mcu));
        v.driver && (result["driver_data"] = joinPath(v.driver_path, v.driver));
        v.sdc && (result["sdc_data"] = joinPath(v.sdc_path, v.sdc));
        v.webviz && (result["webviz"] = joinPath(v.webviz_path, v.webviz));

        return result;
    };
    // 编辑
    const edit = (e: any, v: any) => {
        e.stopPropagation();
        setCurRow({ ...v, opt: "edit" });
        setModalShow(true);
    };
    // 复制，初始值和编辑一样，去掉id,type,version,desc
    const copy = (e: any, v: any) => {
        e.stopPropagation();
        setCurRow({ ...v, opt: "copy", id: undefined, type: undefined, version: undefined, desc: undefined });
        setModalShow(true);
    };
    const trigger = (e: any, v: any) => {
        e.stopPropagation();
        const artifacts_url = `${v.artifacts_url}${v.project_name}-${getCurDatetime(v.create_time)}-${
            v.version
        }.tar.gz`;
        toolsApi
            .jenkinsBuildJob({
                process_type: 1,
                process_id: v.id,
                job: v.job_name,
                artifacts_url: artifacts_url,
                parameters: generatorBuildConfig(v)
            })
            .then(() => {
                setAppProcessNum(appProcessNum + 1);
            });
    };

    const onSearch = (value: string) => {
        setKeyword(value);
    };
    const columns: ColumnsType<DataType> = [
        {
            title: "项目",
            width: 120,
            ellipsis: true,
            dataIndex: "project_name",
            key: "project",
            sorter: true
        },
        {
            title: "版本号",
            width: 120,
            ellipsis: true,
            dataIndex: "version",
            key: "version",
            sorter: true
        },
        {
            title: "描述",
            width: 120,
            ellipsis: true,
            dataIndex: "desc",
            key: "release_note"
        },
        {
            title: "创建者",
            width: 120,
            ellipsis: true,
            dataIndex: "creator_name",
            key: "creator",
            sorter: true
        },
        {
            title: "创建时间",
            width: 170,
            // dataIndex: "create_time",
            key: "create_time",
            sorter: true,
            render: (v: DataType) => (
                <>
                    <span>{v.create_time.substring(0, v.create_time.length - 3)}</span>
                </>
            )
        },
        {
            title: "状态",
            width: 120,
            ellipsis: true,
            key: "state",
            sorter: true,
            render: (v: DataType) => {
                if (v.state === 0) {
                    return <Tag color="#666666">{v.state_name}</Tag>;
                } else if (v.state === 1) {
                    return <Tag color="#48d1cc">{v.state_name}</Tag>;
                } else if (v.state === 2 || v.state === 6) {
                    return <Tag color="#177ddc">{v.state_name}</Tag>;
                } else if (v.state === 3 || v.state === 7) {
                    return <Tag color="#00b578">{v.state_name}</Tag>;
                } else if (v.state === 4 || v.state === 8) {
                    return <Tag color="#ff3141">{v.state_name}</Tag>;
                } else if (v.state === 5) {
                    return <Tag color="#ff8f1f">{v.state_name}</Tag>;
                }
            }
        },
        {
            title: "查看",
            width: 192,
            key: "modules",
            render: (v: DataType) => {
                return (
                    <>
                        <Tooltip title="参数配置">
                            <img
                                className={style.imgBtn}
                                onClick={() => {
                                    const params = generatorBuildConfig(v);
                                    setModuleInfo(params);
                                    setModuleInfoVisible(true);
                                }}
                                src={configImg}
                                alt="参数配置"
                            />
                        </Tooltip>

                        {v.state > 1 && v.jenkins_url && (
                            <Tooltip title="Jenkins">
                                <img
                                    className={style.imgBtn}
                                    onClick={() => {
                                        window.open(v.jenkins_url, "_blank");
                                    }}
                                    src={jenkinsImg}
                                    alt="Jenkins"
                                />
                            </Tooltip>
                        )}
                        {v.state > 1 && v.confluence_url && (
                            <Tooltip title="Confluence">
                                <img
                                    className={style.imgBtn + " " + style.imgBtnSmall}
                                    onClick={() => {
                                        window.open(v.confluence_url, "_blank");
                                    }}
                                    src={confluenceImg}
                                    alt="Confluence"
                                />
                            </Tooltip>
                        )}
                        {[3, 6, 7, 8].includes(v.state) && (
                            <Tooltip title="Artifacts">
                                <img
                                    className={style.imgBtn + " " + style.imgBtnLarge}
                                    onClick={() => {
                                        window.open(v.artifacts_url, "_blank");
                                    }}
                                    src={artifactsImg}
                                    alt="Artifacts"
                                />
                            </Tooltip>
                        )}
                        {(v.state > 6 || (v.state === 3 && v.project_name.includes("ORIN"))) && v.test_result_url && (
                            <Tooltip title="测试报告">
                                <img
                                    className={style.imgBtn + " " + style.imgBtnLarge}
                                    onClick={() => {
                                        const urls = v.test_result_url.split(";");
                                        urls.forEach((url) => {
                                            window.open(url, "_blank");
                                        });
                                    }}
                                    src={testResultImg}
                                    alt="Jenkins"
                                />
                            </Tooltip>
                        )}
                    </>
                );
            }
        },
        {
            title: "操作",
            width: 180,
            dataIndex: "",
            key: "x",
            render: (v: DataType) => {
                return (
                    <Fragment>
                        {v.state > 0 && (
                            <>
                                <a href="#!" onClick={(e) => exportConfig(e, v)}>
                                    导出
                                </a>
                                {(v.type === 0 || Number(v.creator) === getUserInfo().id) && (
                                    <a href="#!" onClick={(e) => copy(e, v)}>
                                        复制
                                    </a>
                                )}
                            </>
                        )}

                        {getUserInfo().id === Number(v.creator) && (
                            <>
                                {v.state <= 1 && (
                                    <a href="#!" onClick={(e) => edit(e, v)}>
                                        编辑
                                    </a>
                                )}
                                {v.state === 1 && (
                                    <a href="#!" onClick={(e) => trigger(e, v)}>
                                        执行
                                    </a>
                                )}
                            </>
                        )}
                    </Fragment>
                );
            }
        }
    ];

    const getData = (pageNo: number, name: string = "", sorter: any) => {
        let { field: order = "id", order: seq = "descend" } = sorter || {};
        let {id, role} = getUserInfo();
        setLoading(true);
        appProcess
            .list(pageNo, id, role, name, order, seq)
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

    const onChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        const action = extra.action;
        if (action === "sort") {
            const { order, columnKey } = sorter;
            setSorter({
                field: order ? columnKey : "id",
                order: order || "descend"
            });
        }
    };

    const pageChange = (pageNo: number, pageSize: number) => {
        setPageNo(pageNo);
    };

    // 搜索条件变化时页码重置为1
    useEffect(() => {
        setPageNo(1);
    }, [keyword]);

    // 刷新页面
    useEffect(() => {
        let timer: any = null;
        const refresh = () => {
            timer = setTimeout(() => {
                setAppProcessNum(appProcessNum + 1);
            }, 10000);
        };

        refresh();

        return () => {
            clearTimeout(timer);
        };
    }, [appProcessNum, setAppProcessNum]);

    useEffect(() => {
        getData(pageNo, keyword, sorter);
    }, [pageNo, keyword, sorter, appProcessNum]);
    return (
        <>
            <div className={style.tools}>
                <Button type="primary" icon={<PlusOutlined />} onClick={createApi}>
                    创建应用集成
                </Button>
                <ModalContext.Provider value={{ modalShow, setModalShow }}>
                    {modalShow && <AddApiModal data={curRow} />}
                </ModalContext.Provider>
                <Search placeholder="输入关键字后按Enter键查询" onSearch={onSearch} enterButton />
            </div>
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
                onChange={onChange}
            />
            <Modal
                width={700}
                title="模块配置信息"
                open={moduleInfoVisible}
                footer={null}
                onCancel={() => {
                    setModuleInfoVisible(false);
                }}>
                <ReactJSONViewer displayDataTypes={false} theme="ashes" src={moduleInfo}></ReactJSONViewer>
            </Modal>
        </>
    );
}
