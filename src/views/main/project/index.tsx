import { Input, Button, Table, message, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import React, { Fragment, useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import style from "./project.module.scss";
import showDeleteConfirm from "../../../components/common/deleteConfirm";
import { ModalContext, DataContext } from "../../../context";
import { isAdmin } from "../../../common/user";
import { project as projectApi } from "../../../api";
import AddProject from "./addProject";

const { Search } = Input;

interface DataType {
    id: string;
    username: string;
    name: string;
    role: number;
    roleName: string;
    telephone: number;
}

export default function App() {
    const [modalShow, setModalShow] = useState(false);
    const [keyword, setKeyword] = useState<string>("");
    const history = useHistory();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [sorter, setSorter] = useState<any>(null);
    const [pageNo, setPageNo] = useState(1);
    const [pagination, setPagination] = useState({});
    const [curRow, setCurRow] = useState<DataType | null>(null);
    const { projectNum, setProjectNum } = useContext(DataContext) as {
        projectNum: number;
        setProjectNum: Function;
    };

    const createProject = () => {
        setCurRow(null);
        setModalShow(true);
    };

    const del = (e: any, v: DataType) => {
        e.stopPropagation();
        showDeleteConfirm({
            title: "删除项目",
            onOk: () => {
                projectApi.remove(v.id).then((v) => {
                    if (v.code === 0) {
                        setProjectNum(projectNum + 1);
                    } else {
                        message.error(v.msg);
                    }
                });
            }
        });
    };

    const edit = (e: any, v: DataType) => {
        e.stopPropagation();
        setCurRow(v);
        setModalShow(true);
    };

    const show = (e: any, v: DataType) => {
        e.stopPropagation();
        setCurRow(v);
        history.push("/main/module", { ...v });
    };

    const columns: ColumnsType<DataType> = [
        {
            title: "名称",
            width: 120,
            ellipsis: true,
            dataIndex: "name",
            fixed: "left",
            key: "name",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "平台",
            width: 80,
            ellipsis: true,
            dataIndex: "platform",
            key: "platform",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "General Jenkins Job",
            width: 190,
            ellipsis: true,
            dataIndex: "job_name",
            key: "job_name",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "Personal Jenkins Job",
            width: 190,
            ellipsis: true,
            dataIndex: "job_name_p",
            key: "job_name_p",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "Test Jenkins Job",
            width: 190,
            ellipsis: true,
            dataIndex: "job_name_test",
            key: "job_name_test",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "激光模型路径",
            width: 160,
            ellipsis: true,
            dataIndex: "lidar_path",
            key: "lidar_path",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "视觉模型路径",
            width: 160,
            ellipsis: true,
            dataIndex: "camera_path",
            key: "camera_path",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "地图数据路径",
            width: 160,
            ellipsis: true,
            dataIndex: "map_path",
            key: "map_path",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "规划地图路径",
            width: 160,
            ellipsis: true,
            dataIndex: "plan_map_path",
            key: "plan_map_path",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "点云地图路径",
            width: 160,
            ellipsis: true,
            dataIndex: "lidar_point_path",
            key: "lidar_point_path",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "MCU路径",
            width: 160,
            ellipsis: true,
            dataIndex: "mcu_path",
            key: "mcu_path",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "驱动程序路径",
            width: 160,
            ellipsis: true,
            dataIndex: "driver_path",
            key: "driver_path",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "SDC程序路径",
            width: 160,
            ellipsis: true,
            dataIndex: "sdc_path",
            key: "sdc_path",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "可视化路径",
            width: 160,
            ellipsis: true,
            dataIndex: "webviz_path",
            key: "webviz_path",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "更新时间",
            width: 160,
            dataIndex: "update_time",
            key: "update_time",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        {
            title: "负责人",
            width: 110,
            ellipsis: true,
            dataIndex: "owner_name",
            key: "owner",
            sorter: true,
            render: (v: string) => <Tooltip title={v}><span>{v}</span></Tooltip>
        },
        // {
        //     title: "电话",
        //     dataIndex: "telephone",
        //     key: "telephone",
        //     sorter: true
        // },
        {
            title: "操作",
            width: 170,
            dataIndex: "",
            fixed: "right",
            key: "x",
            render: (v: DataType) => {
                return (
                    <Fragment>
                        {isAdmin() && (
                            <>
                                <a href="#!" onClick={(e) => del(e, v)}>
                                    删除
                                </a>
                                <a href="#!" onClick={(e) => edit(e, v)}>
                                    编辑
                                </a>
                            </>
                        )}
                        <a href="#!" onClick={(e) => show(e, v)}>
                            查看模块
                        </a>
                    </Fragment>
                );
            }
        }
    ];

    const getData = (pageNo: number, name: string = "", sorter: any) => {
        let { field: order = "id", order: seq = "desc" } = sorter || {};
        setLoading(true);
        projectApi
            .list(pageNo, name, order, seq)
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

    useEffect(() => {
        getData(pageNo, keyword, sorter);
    }, [pageNo, projectNum, keyword, sorter]);

    const onSearch = (value: string) => {
        setKeyword(value);
    };
    return (
        <div>
            <h4>项目列表</h4>
            <div className={style.tools}>
                {isAdmin() && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={createProject}>
                        添加项目
                    </Button>
                )}
                <Search placeholder="输入关键字后按Enter键查询" onSearch={onSearch} enterButton />
                <ModalContext.Provider value={{ modalShow, setModalShow }}>
                    {modalShow && <AddProject data={curRow} />}
                </ModalContext.Provider>
            </div>
            <Table
                scroll={{x: 1440}}
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
                onRow={(record) => {
                    return {
                        onDoubleClick: (event) => {
                            show(event, record);
                        }
                    };
                }}
            />
        </div>
    );
}
