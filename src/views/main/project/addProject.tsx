import { Modal, Form, Input, Select, message, Spin } from "antd";
import React, { Fragment, useEffect, useContext, useState } from "react";
import { ModalContext, DataContext } from "../../../context";
import { project as projectApi, user as userApi } from "../../../api";

const { Option } = Select;

const App = (props: any = {}) => {
    const { data: editFormData } = props;
    const { modalShow, setModalShow } = useContext(ModalContext) as {
        modalShow: boolean;
        setModalShow: Function;
        curRow: object;
        setCurRow: Function;
    };
    const { projectNum, setProjectNum } = useContext(DataContext) as {
        projectNum: number;
        setProjectNum: Function;
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
            p = projectApi.create(values);
        } else {
            p = projectApi.edit({
                ...values,
                id: editFormData.id
            });
        }
        p.then((v) => {
            if (v.code === 0) {
                setModalShow(false);
                form.resetFields();
                setProjectNum(projectNum + 1);
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
                reject("请输入项目名称");
            }
            // 数字、字母、下划线
            if (!/^[A-Z][A-Z0-9_]{3,}$/.test(value)) {
                reject("大写字母开头，数字、大写字母、下划线组成，至少4字符");
            }
            resolve("");
        });
    };

    const checkExist = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            if (value === editFormData?.name) {
                resolve("");
            } else {
                projectApi
                    .checkNameNoExist(value)
                    .then((v) => {
                        console.info("校验结果：", v.data);
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

    return (
        <Fragment>
            <Modal
                destroyOnClose={true}
                title={editFormData ? "编辑项目" : "创建项目"}
                open={modalShow}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确认"
                cancelText="取消">
                <Spin spinning={loading}>
                    <Form
                        form={form}
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={onFinish}
                        initialValues={editFormData}
                        autoComplete="off">
                        <Form.Item
                            label="名称"
                            name="name"
                            required={true}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[{ validator: checkName }, { validator: checkExist, validateTrigger: "onBlur" }]}>
                            <Input placeholder="请输入项目名称，如GSL4_X86" />
                        </Form.Item>
                        <Form.Item
                            name="platform"
                            label="平台"
                            required={true}
                            rules={[{ required: true, message: "请选择平台" }]}>
                            <Select placeholder="请选择平台" allowClear>
                                <Option value={"X86"}>X86</Option>
                                <Option value={"V3NA"}>V3NA</Option>
                                <Option value={"ORIN"}>ORIN</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="job_name"
                            label="General Jenkins Job"
                            required={true}
                            rules={[{ required: true, message: "请输入jenkins job名称" }]}>
                            <Input placeholder="请输入jenkins job名称" />
                        </Form.Item>
                        <Form.Item
                            name="job_name_p"
                            label="Personal Jenkins Job"
                            required={true}
                            rules={[{ required: true, message: "请输入个人jenkins job名称" }]}>
                            <Input placeholder="请输入个人jenkins job名称" />
                        </Form.Item>
                        <Form.Item name="job_name_test" label="Test Jenkins Job" required={false}>
                            <Input placeholder="请输入测试jenkins job名称" />
                        </Form.Item>
                        <Form.Item
                            name="lidar_path"
                            label="激光模型"
                            required={true}
                            rules={[{ required: true, message: "请输入激光模型的存放路径" }]}>
                            <Input placeholder="请输入激光模型的存放路径" />
                        </Form.Item>
                        <Form.Item
                            name="camera_path"
                            label="视觉模型"
                            required={true}
                            rules={[{ required: true, message: "请输入视觉模型的存放路径" }]}>
                            <Input placeholder="请输入视觉模型的存放路径" />
                        </Form.Item>
                        <Form.Item
                            name="map_path"
                            label="地图数据"
                            required={true}
                            rules={[{ required: true, message: "请输入地图数据的存放路径" }]}>
                            <Input placeholder="请输入地图数据的存放路径" />
                        </Form.Item>
                        <Form.Item name="plan_map_path" label="规划地图">
                            <Input placeholder="请输入规划地图的存放路径" />
                        </Form.Item>
                        <Form.Item name="lidar_point_path" label="点云地图">
                            <Input placeholder="请输入点云地图的存放路径" />
                        </Form.Item>
                        <Form.Item name="mcu_path" label="MCU版本">
                            <Input placeholder="请输入MCU的存放路径" />
                        </Form.Item>
                        <Form.Item name="driver_path" label="驱动程序">
                            <Input placeholder="请输入驱动程序的存放路径" />
                        </Form.Item>
                        <Form.Item name="sdc_path" label="SDC程序">
                            <Input placeholder="请输入SDC程序的存放路径" />
                        </Form.Item>
                        <Form.Item
                            name="webviz_path"
                            label="可视化程序"
                            required={true}
                            rules={[{ required: true, message: "请输入可视化的存放路径" }]}>
                            <Input placeholder="请输入可视化的存放路径" />
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
