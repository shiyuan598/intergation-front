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
    modules: string;
    state_name: string;
    jenkins_url: string;
    artifacts_url: string;
    confluence_url: string;
}

export default function Api() {
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
        let modules = JSON.parse(v.modules);
        let base: any = {};
        let common: any = {};
        Object.keys(modules).forEach((k) => {
            // 只保留url和version属性
            let item = {
                url: modules[k].url,
                version: modules[k].version || ""
            };
            // 分为base和common两部分
            if (modules[k].type === 0) {
                base[k] = item;
            } else {
                common[k] = item;
            }
        });

        return {
            project: v.project_name,
            version: v.version,
            build_type: v.build_type,
            base,
            modules: common
        };
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
        toolsApi
            .jenkinsBuildJob({
                process_type: 1,
                process_id: v.id,
                job: v.job,
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
            key: "project_name",
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
            dataIndex: "create_time",
            key: "create_time",
            sorter: true
        },
        {
            title: "更新时间",
            width: 170,
            dataIndex: "update_time",
            key: "update_time",
            sorter: true
        },
        {
            title: "状态",
            width: 120,
            ellipsis: true,
            key: "state_name",
            sorter: true,
            render: (v: DataType) => {
                if (v.state === 0) {
                    return <Tag color="#666666">{v.state_name}</Tag>;
                } else if (v.state === 1) {
                    return <Tag color="#48d1cc">{v.state_name}</Tag>;
                } else if (v.state === 2) {
                    return <Tag color="#177ddc">{v.state_name}</Tag>;
                } else if (v.state === 3) {
                    return <Tag color="#00b578">{v.state_name}</Tag>;
                } else if (v.state === 4) {
                    return <Tag color="#ff3141">{v.state_name}</Tag>;
                } else if (v.state === 5) {
                    return <Tag color="#ff8f1f">{v.state_name}</Tag>;
                }
            }
        },
        {
            title: "查看",
            width: 160,
            key: "modules",
            render: (v: DataType) => {
                return (
                    <>
                        <Tooltip title="模块配置">
                            <img
                                className={style.imgBtn}
                                onClick={() => {
                                    const modules = JSON.parse(v.modules);
                                    let base: any = {};
                                    let common: any = {};
                                    Object.keys(modules).forEach((k) => {
                                        let item = {
                                            owner: modules[k].owner_name,
                                            url: modules[k].url,
                                            version: modules[k].version || "",
                                            release_note: modules[k].release_note || ""
                                        };
                                        // 分为base和common两部分
                                        if (modules[k].type === 0) {
                                            base[k] = item;
                                        } else if (modules[k].type === 2) {
                                            common[k] = item;
                                        }
                                    });
                                    setModuleInfo({
                                        base,
                                        modules: common
                                    });
                                    setModuleInfoVisible(true);
                                }}
                                src={configImg}
                                alt="模块配置"
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
                        {v.state === 3 && (
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
                    </>
                );
            }
        },
        {
            title: "操作",
            width: 160,
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
                                {v.type === 0 && (
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
        let { field: order = "", order: seq = "" } = sorter || {};
        setLoading(true);
        appProcess
            .list(pageNo, getUserInfo().id, name, order, seq)
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
                field: columnKey,
                order: order
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
