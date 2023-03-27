import { Modal, Form, Input, Select, message, Spin } from 'antd';
import React, { Fragment, useContext, useState } from 'react';
import { ModalContext, DataContext } from '../../../context';
import { user as userApi } from "../../../api";

const { Option } = Select;

const App = () => {
    const { modalShow, setModalShow } = useContext(ModalContext) as {
        modalShow: boolean, setModalShow: Function,
        curRow: object, setCurRow: Function
    };
    const { userNum, setUserNum } = useContext(DataContext) as {
        userNum: number,
        setUserNum: Function
    };
    const [loading, setLoading] = useState(false); // loading

    const [form] = Form.useForm();
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
        userApi.addUser(values).then(v => {
            if (v.code === 0) {
                setModalShow(false);
                form.resetFields();
                setUserNum(userNum + 1);
            } else {
                message.error(v.msg);
            }
        }).finally(() => {
            setLoading(false);
        });
    };

    const checkName = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入用户名");
            }
            userApi.checkNoExist(value).then(v => {
                if (v.data) {
                    resolve("");
                } else {
                    reject("用户名已存在");
                }
            }).catch(() => {
                reject("验证用户名出错");
            });
        });
    };

    const checkTelephone = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入手机号");
            }
            if (!/^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/g.test(value)) {
                reject("请输入正确的手机号");
            } else {
                resolve("");
            }
        });
    };

    return (
        <Fragment>
            <Modal destroyOnClose={true} title="添加用户" open={modalShow} onOk={handleOk} onCancel={handleCancel} okText="确认"
                cancelText="取消">
                <Spin spinning={loading}>
                    <Form
                        form={form}
                        name="basic"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="用户名"
                            name="username"
                            required={true}
                            rules={[{ validator: checkName }]}
                        >
                            <Input placeholder='请输入用户名' />
                        </Form.Item>
                        <Form.Item
                            label="密码"
                            name="password"
                            required={true}
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input placeholder='请输入密码' />
                        </Form.Item>
                        <Form.Item name="role" label="角色" required={true} rules={[{ required: true, message: '请选择角色' }]}>
                            <Select
                                placeholder="请选择角色"
                                allowClear
                            >
                                <Option value={1}>管理员</Option>
                                <Option value={2}>司机</Option>
                                <Option value={3}>普通用户</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="name" label="名称" required={true} rules={[{ required: true, message: '请输入名称' }]}>
                            <Input placeholder='请输入名称' />
                        </Form.Item>
                        <Form.Item name="telephone" label="手机号" required={true} rules={[{ validator: checkTelephone }]}>
                            <Input placeholder='请输入手机号' />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </Fragment>
    );
};

export default App;