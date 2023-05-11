import { Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { Fragment, useState, useEffect, useContext } from "react";
import { ModalContext, DataContext } from "../../../context";
import { getUserInfo } from "../../../common/user";
import { appProcess as appProcessApi, todo as todoApi } from "../../../api";
import HandleApp from "./handleApp";

interface DataType {
    id: string;
    process_id: number;
    username: string;
    name: string;
    role: number;
    roleName: string;
    telephone: number;
    lidar: string;
    camera: string;
    map: string;
    modules: object;
    creator: number;
    handler: number;
    handler_phone: string;
    enable_prompt: boolean;
}

export default function App() {
    const [modalShow, setModalShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [sorter, setSorter] = useState<any>(null);
    const [pageNo, setPageNo] = useState(1);
    const [pagination, setPagination] = useState({});
    const [curRow, setCurRow] = useState<DataType | null>(null);
    const { todoNum, setTodoNum } = useContext(DataContext) as {
        todoNum: number;
        setTodoNum: Function;
    };

    const handle = (e: any, v: DataType) => {
        e.stopPropagation();
        setLoading(true);
        // 获取选择的模块信息
        appProcessApi
            .getProcessInfo(v.process_id)
            .then((r) => {
                let { lidar, camera, map, modules } = r.data;
                const modulesObj = JSON.parse(modules);
                setCurRow({
                    ...v,
                    lidar,
                    camera,
                    map,
                    modules: modulesObj
                });
                setModalShow(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const prompt = (e: any, v: DataType) => {
        e.stopPropagation();
        if (!v.enable_prompt) {
            return;
        }
        setLoading(true);
        todoApi
            .prompt({ id: v.id, phone: v.handler_phone })
            .then((r) => {
                if (r.code === 0) {
                    message.success("已通知模块负责人尽快处理！");
                    setTodoNum(todoNum + 1);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const columns: ColumnsType<DataType> = [
        {
            title: "流程类型",
            width: 120,
            ellipsis: true,
            dataIndex: "type_name",
            key: "type",
            sorter: true
        },
        {
            title: "项目名称",
            width: 120,
            ellipsis: true,
            dataIndex: "project_name",
            key: "project",
            sorter: true
        },
        {
            title: "集成版本号",
            width: 120,
            ellipsis: true,
            dataIndex: "version",
            key: "version",
            sorter: true
        },
        {
            title: "模块",
            width: 120,
            ellipsis: true,
            dataIndex: "module_name",
            key: "module_name",
            sorter: true
        },
        {
            title: "发起人",
            width: 120,
            ellipsis: true,
            dataIndex: "creator_name",
            key: "creator",
            sorter: true
        },
        {
            title: "处理人",
            width: 120,
            ellipsis: true,
            dataIndex: "handler_name",
            key: "handler",
            sorter: true
        },
        {
            title: "描述",
            width: 120,
            ellipsis: true,
            dataIndex: "desc",
            key: "desc"
        },
        {
            title: "创建时间",
            width: 120,
            ellipsis: true,
            dataIndex: "create_time",
            key: "create_time",
            sorter: true
        },
        // {
        //     title: "更新时间",
        //     dataIndex: "update_time",
        //     key: "update_time",
        //     sorter: true
        // },
        {
            title: "操作",
            width: 120,
            dataIndex: "",
            key: "x",
            render: (v: DataType) => {
                return (
                    <Fragment>
                        {getUserInfo().id === v.creator &&
                            (v.enable_prompt ? (
                                <a href="#!" onClick={(e) => prompt(e, v)}>
                                    催办
                                </a>
                            ) : (
                                <span style={{ color: "#666", cursor: "not-allowed", paddingRight: "4px" }}>催办</span>
                            ))}
                        {getUserInfo().id === v.handler && (
                            <a href="#!" onClick={(e) => handle(e, v)}>
                                处理
                            </a>
                        )}
                    </Fragment>
                );
            }
        }
    ];

    const getData = (pageNo: number, sorter: any, state: number = 0) => {
        let { field: order = "id", order: seq = "descend" } = sorter || {};
        setLoading(true);
        todoApi
            .list(getUserInfo().id, pageNo, order, seq, state)
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

    useEffect(() => {
        getData(pageNo, sorter);
    }, [pageNo, todoNum, sorter]);

    return (
        <>
            <div>待办中心</div>
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
            <ModalContext.Provider value={{ modalShow, setModalShow }}>
                {modalShow && <HandleApp data={curRow} />}
            </ModalContext.Provider>
        </>
    );
}
