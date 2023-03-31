// 接口集成表单
import { Modal, Form, Input, Select, message, Spin, Checkbox, Divider } from "antd";
import React, { Fragment, useContext, useState, useEffect } from "react";
import { ModalContext, DataContext } from "../../../../context";
import { project as projectApi, module as moduleApi } from "../../../../api";

const { Option } = Select;

const App = (props: any = {}) => {
    const { data } = props;
    let initial:any = {};
    if (data) {
        initial = {
            ...data,
            modules: {}
        }
        const modules = JSON.parse(data.modules);
        Object.keys(modules).forEach((key) => {
            initial["module." + key] = true;
            initial["version." + key] = modules[key].version;
        });
    }
    const { modalShow, setModalShow } = useContext(ModalContext) as {
        modalShow: boolean;
        setModalShow: Function;
        curRow: object;
        setCurRow: Function;
    };
    const [projectList, setProjectList] = useState([] as { id: number; name: string }[]);
    const [moduleList, setModuleList] = useState([] as { id: number; name: string; versions: { name: string }[] }[]);
    const { apiProcessNum, setApiProcessNum } = useContext(DataContext) as {
        apiProcessNum: number;
        setApiProcessNum: Function;
    };
    const [loading, setLoading] = useState(false); // loading
    const [moduleLoading, setModuleLoading] = useState(false); // loading

    const [form] = Form.useForm();

    useEffect(() => {
        // 获取所有的project
        projectApi.list(1).then((v) => {
            setProjectList(v.data);
        });
        // 如果初始化时编辑模式，就主动触发一下模块查询
        if (initial.project) {
            projectSelectChange(initial.project);
        }
    }, []);

    const projectSelectChange = (v: any) => {
        setModuleLoading(true);
        moduleApi.list(1).then((m) => {
            // 默认选择所有模块
            !data && m.data.forEach((item: any) => form.setFieldValue("module." + item.name, true));
            setTimeout(() => {
                Promise.all(m.data.map(() => moduleApi.version()))
                    .then((r) => {
                        r.forEach((v, i) => (m.data[i].versions = v.data));
                        setModuleList(m.data);
                    })
                    .finally(() => setModuleLoading(false));
            }, 3000);
        });
    };

    const getUrlByName = (name: string, moduleList: any[]) => {
        let match = moduleList.find((v) => v.name === name);
        if (match) {
            return match.gitlab;
        }
        return "";
    };

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
        // 生成模块配置参数：
        // 识别出所有的模块属性及其对应的版本号
        let res: any = { modules: {} };
        Object.keys(values).forEach((k) => {
            if (k.startsWith("module.")) {
                if (values[k]) {
                    // 选择了该模块则添加到结果中并记录版本号
                    let name = k.substring("module.".length);
                    res.modules[name] = {
                        url: getUrlByName(name, moduleList),
                        version: values["version." + name] || ""
                    };
                }
            } else if (k.startsWith("version.")) {
                // pass
            } else {
                res[k] = values[k];
            }
        });
        console.info("res:", res, "\n\n", JSON.stringify({ modules: JSON.stringify(res, null, 4) }, null, 4));
        // 接口集成数据处理流程：
        // 1.把module.以及version.开头的属性都放入moduleInfo中, 需要增加url属性，转为字符串存入数据库，
        // 如果没有勾选会忽略掉, 不用担心单独选择了版本号而没有勾选模块的情况
        // 2.导出时提取模块配置, 再加上其他如project/version/build_type属性，同时忽略moduleInfo属性（moduleInfo: undefined）
        // 4.编辑时把moduleInfo中的name/url提取到外层，用于数据回显，再把moduleInfo: undefined，
        setLoading(true);
        projectApi
            .add(values)
            .then((v) => {
                if (v.code === 0) {
                    setModalShow(false);
                    form.resetFields();
                    setApiProcessNum(apiProcessNum + 1);
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
                width={740}
                destroyOnClose={true}
                title={`${data? '编辑': '创建'}接口集成`}
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
                        initialValues={initial}
                        autoComplete="off">
                        <Form.Item
                            label="项目"
                            name="project"
                            required={true}
                            rules={[{ required: true, message: "请选择项目" }]}>
                            <Select disabled={!!data} placeholder="请选择项目" allowClear onChange={projectSelectChange}>
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
                            name="build_type"
                            label="构建类型"
                            required={true}
                            rules={[{ required: true, message: "请选择构建类型" }]}>
                            <Select placeholder="请选择构建类型" allowClear>
                                <Option value={1}>Debug</Option>
                                <Option value={2}>Build</Option>
                                <Option value={3}>Debug Info</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="release_note" label="描述">
                            <Input placeholder="请输入描述" />
                        </Form.Item>

                        <Spin spinning={moduleLoading}>
                            <Divider orientation="left" style={{ margin: "0 0 12px 0" }}>
                                模块信息
                            </Divider>

                            {moduleList.map((item) => (
                                <Form.Item key={item.id} noStyle>
                                    <Form.Item
                                        name={"module." + item.name}
                                        valuePropName="checked"
                                        style={{ width: "36%", marginLeft: "14%", paddingLeft: "8px" }}>
                                        <Checkbox>{item.name}</Checkbox>
                                    </Form.Item>
                                    <Form.Item name={"version." + item.name} label="版本号">
                                        <Select placeholder="请选择版本号" allowClear>
                                            {item.versions.map((v) => (
                                                <Option key={v.name} value={v.name}>
                                                    {v.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Form.Item>
                            ))}
                        </Spin>
                    </Form>
                </Spin>
            </Modal>
        </Fragment>
    );
};

export default App;
