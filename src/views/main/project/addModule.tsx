import { Modal, Form, Input, Select, message, Spin } from "antd";
import React, { Fragment, useEffect, useContext, useState } from "react";
import { ModalContext, DataContext } from "../../../context";
import { module as moduleApi, user as userApi } from "../../../api";

const { Option } = Select;

const App = (props: any = {}) => {
    const { data: editFormData, project } = props;
    const { modalShow, setModalShow } = useContext(ModalContext) as {
        modalShow: boolean;
        setModalShow: Function;
        curRow: object;
        setCurRow: Function;
    };
    const { moduleNum, setModuleNum } = useContext(DataContext) as {
        moduleNum: number;
        setModuleNum: Function;
    };
    const [loading, setLoading] = useState(false); // loading

    const [form] = Form.useForm();

    const [userList, setUserList] = useState(
        [] as {
            id: number;
            name: string;
        }[]
    );
    useEffect(() => {
        userApi.getUserByRole(1).then((v) => {
            setUserList(v.data);
        });
    }, []);

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
        let p = null;
        if (!editFormData) {
            p = moduleApi.create({
                ...values,
                project
            });
        } else {
            p = moduleApi.edit({
                ...values,
                id: editFormData.id
            });
        }
        p.then((v) => {
            if (v.code === 0) {
                setModalShow(false);
                form.resetFields();
                setModuleNum(moduleNum + 1);
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
                reject("请输入名称");
            }
            // 数字、字母、下划线
            if (!/^[a-zA-Z]\w{1,}$/.test(value)) {
                reject("字母开头，数字、字母、下划线组成，至少两字符");
            }
            resolve("");
        });
    };

    const checkExist = (rule: any, value: any, cb: any) => {
        const type = form.getFieldValue("type");
        if (!type) {
            return Promise.resolve("");
        }
        return new Promise((resolve, reject) => {
            if (value === editFormData?.name) {
                resolve("");
            } else {
                moduleApi
                    .checkNameNoExist(project, type, value)
                    .then((v) => {
                        if (v.data) {
                            resolve("");
                        } else {
                            reject("名称已存在");
                        }
                    })
                    .catch(() => {
                        reject("验证名称出错");
                    });
            }
        });
    };

    const checkGit = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入git ssh地址");
            }
            // 数字、字母、下划线
            if (!/^git@[\w.]+:[\w./-]+\.git$/.test(value)) {
                reject("git ssh地址");
            }
            resolve("");
        });
    };

    return (
        <Fragment>
            <Modal
                destroyOnClose={true}
                title={editFormData ? "编辑模块" : "创建模块"}
                open={modalShow}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确认"
                cancelText="取消">
                <Spin spinning={loading}>
                    <Form
                        form={form}
                        name="basic"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        onFinish={onFinish}
                        initialValues={editFormData}
                        autoComplete="off">
                        <Form.Item
                            name="type"
                            label="模块类型"
                            required={true}
                            rules={[{ required: true, message: "请选择模块类型" }]}>
                            <Select placeholder="请选择模块类型" allowClear>
                                <Option value={3}>配置模块</Option>
                                <Option value={0}>基础模块</Option>
                                <Option value={1}>接口集成</Option>
                                <Option value={2}>应用集成</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="名称"
                            name="name"
                            required={true}
                            dependencies={["type"]}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[{ validator: checkName }, { validator: checkExist, validateTrigger: "onBlur" }]}>
                            <Input placeholder="请输入模块名称" />
                        </Form.Item>
                        <Form.Item name="git" label="git地址" required={true} rules={[{ validator: checkGit }]}>
                            <Input placeholder="请输入git ssh地址" />
                        </Form.Item>
                        <Form.Item
                            name="owner"
                            label="负责人"
                            required={true}
                            rules={[{ required: true, message: "请选择负责人" }]}>
                            <Select placeholder="请选择负责人" allowClear showSearch>
                                {userList.length &&
                                    userList.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </Fragment>
    );
};

export default App;
