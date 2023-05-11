import { message } from "antd";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState, Fragment, useEffect, useContext } from "react";
import showDeleteConfirm from "../../../components/common/deleteConfirm";
import EditUserModal from "./editUser";
import { DataContext } from "../../../context";
import { user as userApi } from "../../../api";
import { isAdmin } from "../../../common/user";

interface DataType {
    id: string;
    username: string;
    name: string;
    role: number;
    role_name: string;
    telephone: number;
}

const App = (props: { keyword: string }) => {
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

    const deleteUser = (e: any, v: DataType) => {
        e.stopPropagation();
        showDeleteConfirm({
            title: "删除用户",
            onOk: () => {
                userApi.deleteUser(v.id).then((v) => {
                    if (v.code === 0) {
                        setUserNum(userNum + 1);
                    } else {
                        message.error(v.msg);
                    }
                });
            }
        });
    };

    const editUser = (e: any, v: DataType) => {
        e.stopPropagation();
        setCurRow(v);
        setEditModalShow(true);
    };
    const editModalCallback = (res: boolean) => {
        if (res) {
            setUserNum(userNum + 1);
        }
    };

    const columns: ColumnsType<DataType> = [
        {
            title: "登录名",
            width: 120,
            ellipsis: true,
            dataIndex: "username",
            key: "username",
            sorter: true
        },
        {
            title: "角色",
            width: 120,
            ellipsis: true,
            dataIndex: "role_name",
            key: "role",
            sorter: true
        },
        {
            title: "名称",
            width: 120,
            ellipsis: true,
            dataIndex: "name",
            key: "name",
            sorter: true
        },
        {
            title: "电话",
            width: 120,
            ellipsis: true,
            dataIndex: "telephone",
            key: "telephone",
            sorter: true
        },
        {
            title: "操作",
            width: 120,
            dataIndex: "",
            key: "x",
            render: (v: DataType) => {
                return isAdmin() ? (
                    <Fragment>
                        <a href="#!" onClick={(e) => deleteUser(e, v)}>
                            删除
                        </a>
                        <a href="#!" onClick={(e) => editUser(e, v)}>
                            编辑
                        </a>
                    </Fragment>
                ) : (
                    <></>
                );
            }
        }
    ];

    const getData = (pageNo: number, name: string = "", sorter: any) => {
        let { field: order = "id", order: seq = "descend" } = sorter || {};
        setLoading(true);
        userApi
            .getUser(pageNo, name, order, seq)
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
    }, [props.keyword]);

    useEffect(() => {
        getData(pageNo, props.keyword, sorter);
    }, [pageNo, userNum, props.keyword, sorter]);

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
                onChange={onChange}
            />
            {editModalShow && (
                <EditUserModal
                    modalShow={editModalShow}
                    setModalShow={setEditModalShow}
                    callback={editModalCallback}
                    user={curRow}></EditUserModal>
            )}
        </Fragment>
    );
};

export default App;
