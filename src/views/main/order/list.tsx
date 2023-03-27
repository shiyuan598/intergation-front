import { Table, message, Modal, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useState, useContext, useEffect, Fragment } from "react";
import ApproveModal from "./approve";
import showDeleteConfirm from "../../../components/common/deleteConfirm";
import { ModalContext, DataContext, UserContext } from "../../../context";
import orderStyle from "./order.module.scss";
import { order as orderApi } from "../../../api";
import { isAdmin } from "../../../common/user";
interface DataType {
    id: number;
    vehicleNo: string;
    load: string;
    project: string;
    module: string;
    startTime: string;
    endTime: string;
    bookTime: string; // 预订的时间
    address: string;
    createTime: string; // 下单时间
    subscriber: string;
    subscriberName: string;
    state: number;
    stateName: string;
    approver: string;
    driver: string;
    driverPhone: string;
    updateTime: string;
    comment: string;
}

const App = (props: { keyword: string; showAll: boolean }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [sorter, setSorter] = useState<any>(null);
    const [pageNo, setPageNo] = useState(1);
    const [pagination, setPagination] = useState({});
    const [modalShow, setModalShow] = useState(false);
    const [curRow, setCurRow] = useState<DataType | null>(null);
    const { orderNum, setOrderNum } = useContext(DataContext) as {
        orderNum: number;
        setOrderNum: Function;
    };
    const { userInfo } = useContext(UserContext) as {
        userInfo: {
            id: number;
            username: string;
            role: number;
            token?: string;
        };
    };

    const cancelOrder = (e: any, v: DataType) => {
        e.stopPropagation();
        showDeleteConfirm({
            title: "取消订单",
            content: "取消后不可恢复，请谨慎操作！",
            onOk: () => {
                orderApi.cancelOrder(v.id).then((v) => {
                    setOrderNum(orderNum + 1);
                });
            }
        });
    };

    const approve = (e: any, v: DataType) => {
        e.stopPropagation();
        setModalShow(true);
        setCurRow(v);
    };

    const showOrderInfo = (e: any, v: DataType) => {
        e.stopPropagation();
        Modal.info({
            title: "订单详情",
            content: (
                <div>
                    <p>
                        <span className="label">审批结果：</span>
                        {v.stateName}
                    </p>
                    {v.state === 1 ? (
                        <Fragment>
                            <p>
                                <span className="label">司机：</span>
                                {v.driver}
                            </p>
                            <p>
                                <span className="label">联系方式：</span>
                                {v.driverPhone}
                            </p>
                        </Fragment>
                    ) : (
                        <Fragment>
                            <p>
                                <span className="label">拒绝原因：</span>
                                {v.comment}
                            </p>
                        </Fragment>
                    )}
                </div>
            ),
            okText: "确定",
            onOk() {}
        });
    };

    const columns: ColumnsType<DataType> = [
        // {
        //     title: "订单号",
        //     dataIndex: "id",
        //     key: "id",
        //     sorter: true
        // },
        {
            title: "车辆编号",
            dataIndex: "vehicleNo",
            key: "vehicleNo",
            sorter: true
        },
        {
            title: "带挂",
            dataIndex: "load",
            key: "load",
            sorter: true
        },
        {
            title: "所属项目",
            dataIndex: "project",
            key: "project",
            sorter: true
        },
        {
            title: "所属模块",
            dataIndex: "module",
            key: "module",
            sorter: true
        },
        {
            title: "开始时间",
            dataIndex: "startTime",
            key: "startTime",
            sorter: true
        },
        {
            title: "结束时间",
            dataIndex: "endTime",
            key: "endTime",
            sorter: true
        },
        {
            title: "地点",
            dataIndex: "address",
            key: "address",
            sorter: true
        },
        {
            title: "预订人",
            dataIndex: "subscriberName",
            key: "subscriberName",
            sorter: true
        },
        {
            title: "审批人",
            dataIndex: "approver",
            key: "approver",
            sorter: true
        },
        {
            title: "状态",
            dataIndex: "",
            key: "state",
            sorter: true,
            render: (v: DataType) => {
                if (v.state === 0) {
                    return <Tag color="#666">{v.stateName}</Tag>;
                } else if (v.state === 1) {
                    return (
                        <Fragment>
                            {
                                <span
                                    className="status"
                                    onClick={(e) => {
                                        showOrderInfo(e, v);
                                    }}>
                                    <Tag color="#87d068">{v.stateName}</Tag>
                                </span>
                            }
                        </Fragment>
                    );
                } else if (v.state === 2) {
                    return (
                        <Fragment>
                            {
                                <span
                                    className="status"
                                    onClick={(e) => {
                                        showOrderInfo(e, v);
                                    }}>
                                    <Tag color="#ff3141">{v.stateName}</Tag>
                                </span>
                            }
                        </Fragment>
                    );
                } else if (v.state === 3) {
                    return <Tag color="#1677ff">{v.stateName}</Tag>;
                } else if (v.state === 4) {
                    return <Tag color="#00b578">{v.stateName}</Tag>;
                } else if (v.state === 5) {
                    return <Tag color="#ff8f1f">{v.stateName}</Tag>;
                }
            }
        },
        {
            title: "操作",
            dataIndex: "",
            key: "x",
            render: (v: DataType) => {
                return (
                    <Fragment>
                        {checkCancel(v) ? (
                            <a href="#!" onClick={(e) => cancelOrder(e, v)}>
                                取消
                            </a>
                        ) : (
                            ""
                        )}
                        {v.state === 0 && isAdmin() ? (
                            <a href="#!" onClick={(e) => approve(e, v)}>
                                审批
                            </a>
                        ) : (
                            ""
                        )}
                    </Fragment>
                );
            }
        }
    ];

    // 检查是否能取消：管理员或用户自己创建的订单
    const checkCancel = ({ state, subscriber }: { state: number; subscriber: string }) => {
        if ([0, 1, 3].includes(state)) {
            return isAdmin() || subscriber === userInfo.username;
        }
        return false;
    };

    const getData = (pageNo: number, name: string = "", sorter: any, subscriber?: number) => {
        let params: { [propName: string]: string | number } = { pageNo, name, order: sorter?.field || "", seq: sorter?.order || "" };
        if (subscriber) {
            params.subscriber = subscriber;
        }
        setLoading(true);
        orderApi
            .getOrder(params)
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
    }, [props]);

    useEffect(() => {
        if (props.showAll) {
            getData(pageNo, props.keyword, sorter);
        } else {
            getData(pageNo, props.keyword, sorter, userInfo.id);
        }
    }, [pageNo, orderNum, sorter, props]);

    return (
        <Fragment>
            <Table
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: false,
                    onChange: pageChange
                }}
                className={orderStyle.list}
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={data}
                onChange={onChange}
            />
            <ModalContext.Provider value={{ modalShow, setModalShow, curRow, setCurRow }}>
                {modalShow && <ApproveModal></ApproveModal>}
            </ModalContext.Provider>
        </Fragment>
    );
};

export default App;
