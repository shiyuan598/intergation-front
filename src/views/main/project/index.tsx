import { Input, Button, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import React, { Fragment, useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import style from "./project.module.scss";
import showDeleteConfirm from "../../../components/common/deleteConfirm";
import { ModalContext, DataContext } from "../../../context";
import { isAdmin } from "../../../common/user";
import { project as projectApi } from "../../../api";

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
    const [editModalShow, setEditModalShow] = useState(false);
    const [curRow, setCurRow] = useState<DataType | null>(null);
    const { userNum, setUserNum } = useContext(DataContext) as {
        userNum: number;
        setUserNum: Function;
    };

    const del = (e: any, v: DataType) => {
        e.stopPropagation();
        showDeleteConfirm({
            title: "删除用户",
            onOk: () => {
                // userApi.deleteUser(v.id).then((v) => {
                //     if (v.code === 0) {
                //         setUserNum(userNum + 1);
                //     } else {
                //         message.error(v.msg);
                //     }
                // });
            }
        });
    };

    const edit = (e: any, v: DataType) => {
        e.stopPropagation();
        setCurRow(v);
        setEditModalShow(true);
    };

    const show = (e: any, v: DataType) => {
        e.stopPropagation();
        setCurRow(v);
        console.info("double click");
        history.push("/main/module", {...v});
    };
    const editModalCallback = (res: boolean) => {
        if (res) {
            setUserNum(userNum + 1);
        }
    };

    const columns: ColumnsType<DataType> = [
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            sorter: true
        },
        {
            title: "平台",
            dataIndex: "platform",
            key: "platform",
            sorter: true
        },
        {
            title: "更新时间",
            dataIndex: "update_time",
            key: "update_time",
            sorter: true
        },
        {
            title: "负责人",
            dataIndex: "owner",
            key: "owner",
            sorter: true
        },
        {
            title: "电话",
            dataIndex: "telephone",
            key: "telephone",
            sorter: true
        },
        {
            title: "操作",
            dataIndex: "",
            key: "x",
            render: (v: DataType) => {
                return (
                    <Fragment>
                        <a href="#!" onClick={(e) => del(e, v)}>
                            删除
                        </a>
                        <a href="#!" onClick={(e) => edit(e, v)}>
                            编辑
                        </a>
                        <a href="#!" onClick={(e) => show(e, v)}>
                            查看模块
                        </a>
                    </Fragment>
                );
            }
        }
    ];

    const getData = (pageNo: number, name: string = "", sorter: any) => {
        let { field: order = "", order: seq = "" } = sorter || {};
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
    }, [pageNo, userNum, keyword, sorter]);

    const onSearch = (value: string) => {
        setKeyword(value);
    };
    return (
        <div>
            <h4>项目列表</h4>
            <div className={style.tools}>
                {isAdmin() && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => {}}>
                        添加项目
                    </Button>
                )}
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
