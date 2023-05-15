// 接口集成表单
import { Modal, Form, Input, Select, message, Spin, Checkbox, Divider } from "antd";
import React, { Fragment, useContext, useState, useEffect } from "react";
import { ModalContext, DataContext } from "../../../../context";
import { apiProcess as apiProcessApi, project as projectApi, tools as toolsApi } from "../../../../api";
import { getUserInfo } from "../../../../common/user";

const { Option, OptGroup } = Select;

const App = (props: any = {}) => {
    const { data: editFormData } = props;
    let initial: any = {};
    if (editFormData) {
        initial = {
            ...editFormData,
            modules: {}
        };
        const modules = JSON.parse(editFormData.modules);
        Object.keys(modules).forEach((key) => {
            initial["module." + key] = true;
            initial["version." + key] = modules[key].version;
        });
    }
    const { modalShow, setModalShow } = useContext(ModalContext) as {
        modalShow: boolean;
        setModalShow: Function;
    };
    const [projectList, setProjectList] = useState(
        [] as { id: number; name: string; job_name: string; artifacts_url: string }[]
    );
    const [moduleList, setModuleList] = useState(
        [] as { id: number; name: string; project_name_with_namespace: string; tags: string[]; branches: string[] }[]
    );
    const { apiProcessNum, setApiProcessNum } = useContext(DataContext) as {
        apiProcessNum: number;
        setApiProcessNum: Function;
    };
    const [loading, setLoading] = useState(false); // loading
    const [moduleLoading, setModuleLoading] = useState(false); // loading

    const [form] = Form.useForm();

    useEffect(() => {
        // 获取所有的project
        // TODO: 查询自己是模块负责人的项目
        projectApi.listAll(getUserInfo().username).then((v) => {
            setProjectList(v.data);
        });
        // 如果初始化时编辑模式，就主动触发一下模块查询
        if (initial.project) {
            projectSelectChange(initial.project);
        }
    }, []);

    const projectSelectChange = (v: any) => {
        setModuleLoading(true);
        projectApi.modulesAll(v, "0,1").then((m) => {
            // 创建时默认选择所有模块
            !editFormData && m.data.forEach((item: any) => form.setFieldValue("module." + item.name, true));
            // 获取所有模块的branch/tag
            toolsApi
                .multiGetBranchesTags(m.data.map((item: any) => item.git.split(":")[1].split(".git")[0]))
                .then((r) => {
                    const branches_tags = r.data;
                    const modules = m.data.map((v: any) => {
                        const project_name_with_namespace = v.git.split(":")[1].split(".git")[0];
                        return {
                            ...v,
                            project_name_with_namespace,
                            tags: branches_tags[project_name_with_namespace]?.tag || [],
                            branches: branches_tags[project_name_with_namespace]?.branch || []
                        };
                    });
                    setModuleList(modules);
                })
                .finally(() => setModuleLoading(false));
        });
    };

    const getModuleInfo = (name: string, moduleList: any[]) => {
        let match = moduleList.find((v) => v.name === name);
        if (match) {
            return {
                url: match.git,
                owner: match.owner,
                owner_name: match.owner_name,
                owner_phone: match.owner_phone
            };
        }
        return null;
    };

    const handleOk = () => {
        if (!loading && !moduleLoading) {
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
        let state = 1;
        Object.keys(values).forEach((k) => {
            if (k.startsWith("module.")) {
                if (values[k]) {
                    // 选择了该模块则添加到结果中并记录版本号等信息
                    let name = k.substring("module.".length);
                    res.modules[name] = {
                        ...getModuleInfo(name, moduleList),
                        version: values["version." + name] || ""
                    };
                    if (!res.modules[name].version) {
                        state = 0;
                    }
                }
            } else if (k.startsWith("version.")) {
                // pass
            } else {
                res[k] = values[k];
            }
        });

        res.state = state;
        res.modules = JSON.stringify(res.modules, null, 4);
        res.job_name = projectList.find((item) => item.id === Number(values.project))?.job_name;
        res.artifacts_url = projectList.find((item) => item.id === Number(values.project))?.artifacts_url;
        res.creator = getUserInfo().id;
        // 接口集成数据处理流程：
        // 1.把module.以及version.开头的属性都放入modules中, 需要增加url属性，转为字符串存入数据库，
        // 如果没有勾选会忽略掉, 不用担心单独选择了版本号而没有勾选模块的情况
        // 2.导出时提取模块配置, 再加上其他如project/version/build_type属性，重置modules属性
        // 4.编辑时把modules中的name/url提取到外层作为initial，用于数据回显，再把modules: {}
        setLoading(true);
        let p = null;
        if (editFormData) {
            p = apiProcessApi.edit({
                id: initial.id,
                ...res
            });
        } else {
            p = apiProcessApi.create(res);
        }
        p.then((v) => {
            if (v.code === 0) {
                setModalShow(false);
                form.resetFields();
                setApiProcessNum(apiProcessNum + 1);
            } else {
                message.error(v.msg);
            }
        }).finally(() => {
            setLoading(false);
        });
    };

    const checkVersion = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入版本号");
            }
            if (!/^[vV]?(\d+)(\.\d+){0,2}(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/g.test(value)) {
                reject("版本号格式不正确");
            }
            resolve("");
        });
    };

    return (
        <Fragment>
            <Modal
                width={740}
                destroyOnClose={true}
                title={`${editFormData ? "编辑" : "创建"}接口集成`}
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
                            <Select
                                disabled={!!editFormData}
                                placeholder="请选择项目"
                                onChange={projectSelectChange}
                                getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                {projectList.map((item) => (
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="版本号"
                            name="version"
                            required={true}
                            dependencies={["project"]}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[{ validator: checkVersion }]}>
                            <Input placeholder="请输入版本号" />
                        </Form.Item>
                        <Form.Item
                            name="build_type"
                            label="构建类型"
                            required={true}
                            rules={[{ required: true, message: "请选择构建类型" }]}>
                            <Select
                                placeholder="请选择构建类型"
                                getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                <Option value={"RelWithDebInfo"}>RelWithDebInfo</Option>
                                <Option value={"Release"}>Release</Option>
                                <Option value={"Debug"}>Debug</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="release_note"
                            label="Release Note"
                            required={true}
                            rules={[{ required: true, message: "请输入Release Note" }]}>
                            <Input placeholder="请输入Release Note" />
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
                                        <Select
                                            placeholder="请选择版本号"
                                            allowClear
                                            getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                            {item.tags.length && (
                                                <OptGroup label="Tag">
                                                    {item.tags.map((v) => (
                                                        <Option key={item.name + v} value={v}>
                                                            {v + ""}
                                                        </Option>
                                                    ))}
                                                </OptGroup>
                                            )}
                                            {item.branches.length && (
                                                <OptGroup label="Branch">
                                                    {item.branches.map((v) => (
                                                        <Option key={item.name + v} value={v}>
                                                            {v + ""}
                                                        </Option>
                                                    ))}
                                                </OptGroup>
                                            )}
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
