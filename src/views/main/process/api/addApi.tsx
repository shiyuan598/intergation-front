// 接口集成表单
import { Modal, Form, Input, Select, message, Spin } from "antd";
import React, { Fragment, useContext, useState, useEffect } from "react";
import { ModalContext, DataContext } from "../../../../context";
import { apiProcess, project as projectApi } from "../../../../api";

const { Option } = Select;

const App = () => {
    const { modalShow, setModalShow } = useContext(ModalContext) as {
        modalShow: boolean;
        setModalShow: Function;
        curRow: object;
        setCurRow: Function;
    };
    const [projectList, setProjectList] = useState([] as { id: number; name: string }[]);
    const { userNum, setUserNum } = useContext(DataContext) as {
        userNum: number;
        setUserNum: Function;
    };
    const [loading, setLoading] = useState(false); // loading

    useEffect(() => {
        projectApi.list(1).then((v) => {
            setProjectList(v.data);
        });
    }, []);

    const [form] = Form.useForm();
    const handleOk = () => {
        console.info("ok", loading);
        if (!loading) {
            form.submit();
        }
    };

    const handleCancel = () => {
        setModalShow(false);
        form.resetFields();
    };

    const onFinish = (values: any) => {
        console.info(values);
        setLoading(true);
        projectApi
            .add(values)
            .then((v) => {
                if (v.code === 0) {
                    setModalShow(false);
                    form.resetFields();
                    setUserNum(userNum + 1);
                } else {
                    message.error(v.msg);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const checkName = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入版本号");
            } else {
                resolve("");
            }
            // if (!/^[vV][._A-Z0-9]{2,15}$/g.test(value)) {
            //     reject("请以大写字母开头，只能使用大写字母、数字、下划线");
            // } else {
            //     resolve("");
            // }
            // TODO:
            // 版本号不能重复

            // userApi
            //     .checkNoExist(value)
            //     .then((v) => {
            //         if (v.data) {
            //             resolve("");
            //         } else {
            //             reject("用户名已存在");
            //         }
            //     })
            //     .catch(() => {
            //         reject("验证用户名出错");
            //     });
        });
    };

    return (
        <Fragment>
            <Modal
                width={700}
                destroyOnClose={true}
                title="创建接口集成"
                open={modalShow}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确认"
                cancelText="取消">
                <Spin spinning={loading}>
                    <Form
                        className="form-item-flex"
                        form={form}
                        name="basic"
                        labelCol={{ span: 3 }}
                        wrapperCol={{ span: 6 }}
                        onFinish={onFinish}
                        autoComplete="off">
                        <Form.Item
                            label="项目"
                            name="project"
                            required={true}
                            rules={[{ required: true, message: "请选择项目" }]}>
                            <Select placeholder="请选择项目" allowClear>
                                {projectList.map((item) => (
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="版本号" name="version" required={true} rules={[{ validator: checkName }]}>
                            <Input placeholder="请输入版本号" />
                        </Form.Item>
                        <Form.Item
                            name="role"
                            label="构建类型"
                            required={true}
                            rules={[{ required: true, message: "请选择构建类型" }]}>
                            <Select placeholder="请选择构建类型" allowClear>
                                <Option value={1}>Debug</Option>
                                <Option value={2}>Build</Option>
                                <Option value={3}>Debug Info</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="name" label="描述">
                            <Input placeholder="请输入描述" />
                        </Form.Item>
                        <Form.Item label="模块1">
                            <Form.Item name="module1">
                                <Input placeholder="请输入模块" />
                            </Form.Item>
                            <Form.Item name="tag1">
                                <Input placeholder="请输入tag" />
                            </Form.Item>
                        </Form.Item>
                        <Form.Item label="模块2">
                            <Form.Item name="module2">
                                <Input placeholder="请输入模块" />
                            </Form.Item>
                            <Form.Item name="tag2">
                                <Input placeholder="请输入tag" />
                            </Form.Item>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </Fragment>
    );
};

export default App;
