import { Modal, Form, Input, Select, message, Spin } from 'antd';
import React, { Fragment, useState, useContext, useEffect } from 'react';
import { ModalContext, DataContext, UserContext } from '../../../context';
import { order as orderApi, user as userApi } from "../../../api";

const { Option } = Select;

const App = () => {
    const { modalShow, setModalShow, curRow } = useContext(ModalContext) as {
        modalShow: boolean, setModalShow: Function,
        curRow: { id: number }, setCurRow: Function
    };

    const { orderNum, setOrderNum } = useContext(DataContext) as {
        orderNum: number,
        setOrderNum: Function
    }

    const { userInfo } = useContext(UserContext) as {
        userInfo: {
            id: number,
            username: string,
            role: number,
            token?: string
        }
    };
    const [loading, setLoading] = useState(false); // loading

    const [driverList, setDriverList] = useState([] as { id: number, name: string, username: string, telephone: string }[]);

    useEffect(() => {
        userApi.getDriver().then((v) => {
            if (v.code === 0) {
                setDriverList(v.data);
            } else {
                message.error(v.msg);
            }
        });
    }, []);

    const [form] = Form.useForm();
    const state = Form.useWatch("state", form);
    const handleOk = () => {
        if (!loading) {
            form.submit();
        }
    };

    const handleCancel = () => {
        setModalShow(false);
        form.resetFields();
    };

    const onFinish = (values: any) => {
        setLoading(true);
        orderApi.approveOrder({
            approver: userInfo.id,
            id: curRow.id,
            ...values
        }).then(v => {
            if (v.code === 0) {
                setModalShow(false);
                form.resetFields();
                setOrderNum(orderNum + 1);
            } else {
                message.error(v.msg);
            }
        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <Fragment>
            <Modal destroyOnClose={true} title={"审批" + curRow?.id} open={modalShow} onOk={handleOk} onCancel={handleCancel}>
                <Spin spinning={loading}>
                    <Form
                        form={form}
                        name="basic"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        initialValues={{ state: "1" }}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item name="state" label="审批结果" required={true} rules={[{ required: true, message: "请选择审批结果" }]}>
                            <Select
                                placeholder="请选择审批结果"
                                allowClear
                            >
                                <Option value="1">通过</Option>
                                <Option value="2">不通过</Option>
                            </Select>
                        </Form.Item>
                        {
                            state === "1" ? (<Fragment>
                                <Form.Item name="driver" label="分配司机" required={true} rules={[{ required: true, message: "请选择司机" }]}>
                                    <Select
                                        placeholder="请选择司机"
                                        allowClear
                                    >
                                        {
                                            driverList.map(item => (
                                                <Option key={item.id} value={item.id}>{item.name}</Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                            </Fragment>)
                                : (<Fragment>
                                    <Form.Item
                                        label="拒绝原因"
                                        name="comment"
                                        rules={[{ required: true, message: '请输入拒绝原因!' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Fragment>)
                        }
                    </Form>
                </Spin>
            </Modal>
        </Fragment>
    );
};

export default App;