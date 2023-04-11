import { Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { Fragment, useState, useEffect, useContext } from "react";
import { ModalContext, DataContext } from "../../../context";
import { isAdmin, getUserInfo } from "../../../common/user";
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
    modules: object;
}

export default function App() {
    const [modalShow, setModalShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [sorter, setSorter] = useState<any>(null);
    const [pageNo, setPageNo] = useState(1);
    const [pagination, setPagination] = useState({});
    const [curRow, setCurRow] = useState<DataType | null>(null);
    const { todoNum } = useContext(DataContext) as {
        todoNum: number;
    };

    const handle = (e: any, v: DataType) => {
        e.stopPropagation();
        setLoading(true);
        // 获取选择的模块信息
        appProcessApi.getModulesInfo(v.process_id).then((r) => {
            const modules = JSON.parse(r.data.modules);
            setCurRow({
                ...v,
                modules
            });
            setModalShow(true);
        }).finally(() => {
            setLoading(false);
        });
    };

    const columns: ColumnsType<DataType> = [
        {
            title: "流程类型",
            dataIndex: "type",
            key: "type",
            sorter: true
        },
        {
            title: "流程Id",
            dataIndex: "process_id",
            key: "process_id",
            sorter: true
        },
        {
            title: "集成版本号",
            dataIndex: "version",
            key: "version",
            sorter: true
        },
        {
            title: "模块",
            dataIndex: "module_name",
            key: "module",
            sorter: true
        },
        {
            title: "发起人",
            dataIndex: "creator",
            key: "creator",
            sorter: true
        },
        {
            title: "处理人",
            dataIndex: "handler",
            key: "handler",
            sorter: true
        },
        {
            title: "描述",
            dataIndex: "desc",
            key: "desc",
            sorter: true
        },
        {
            title: "创建时间",
            dataIndex: "create_time",
            key: "create_time",
            sorter: true
        },
        {
            title: "更新时间",
            dataIndex: "update_time",
            key: "update_time",
            sorter: true
        },
        {
            title: "操作",
            dataIndex: "",
            key: "x",
            render: (v: DataType) => {
                return (
                    <Fragment>
                        {isAdmin() && (
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
        let { field: order = "", order: seq = "" } = sorter || {};
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
                field: columnKey,
                order: order
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
