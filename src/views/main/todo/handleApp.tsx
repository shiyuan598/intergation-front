// 处理应用集成表单
import { Modal, Form, Input, Select, message, Spin, Checkbox, Divider } from "antd";
import React, { Fragment, useContext, useState, useEffect } from "react";
import { ModalContext, DataContext } from "../../../context";
import { project as projectApi, tools as toolsApi, todo as todoApi } from "../../../api";
import { getUserInfo } from "../../../common/user";

const { Option, OptGroup } = Select;

const App = (props: any = {}) => {
    const { data: editFormData } = props;
    let initial: any = {};
    if (editFormData) {
        initial = {
            ...editFormData,
            modules: {}
        };
        const modules = editFormData.modules;
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
        [] as { id: number; name: string; job_name: string; artifacts_path: string }[]
    );

    const [moduleList, setModuleList] = useState(
        [] as {
            id: number;
            name: string;
            tags: string[];
            branches: string[];
        }[]
    );
    const { todoNum, setTodoNum, appProcessNum, setAppProcessNum } = useContext(DataContext) as {
        todoNum: number;
        setTodoNum: Function;
        appProcessNum: number;
        setAppProcessNum: Function;
    };
    const [loading, setLoading] = useState(false); // loading
    const [moduleLoading, setModuleLoading] = useState(false); // loading

    const [form] = Form.useForm();

    useEffect(() => {
        // 获取所有的project
        projectApi.listAll(getUserInfo().username).then((v) => {
            setProjectList(v.data);
        });
        // 如果初始化时编辑模式，就主动触发一下模块查询
        if (editFormData.project) {
            projectSelectChange(editFormData.project);
        }
    }, []);

    // 聚焦待编辑的表单项
    useEffect(() => {
        if (moduleList.length) {
            form.getFieldInstance("version." + editFormData.module_name);
            const field = form.getFieldInstance("version." + editFormData.module_name);
            if (field) {
                form.scrollToField("version." + editFormData.module_name);
                field.focus();
            }
        }
    }, [moduleList, form]);

    const projectSelectChange = (v: any) => {
        if (!v) {
            return;
        }
        setModuleLoading(true);
        // 获取所有模块信息
        projectApi.modulesAll(v, "0,2,3").then((raw) => {
            // 过滤掉没有勾选的模块
            let keys = Object.keys(editFormData.modules);
            const rawData = raw.data.filter((item: any) => item.type !== 1 && keys.includes(item.name));
            // 获取要处理模块的branch/tag
            const project_name_with_namespace = editFormData.modules[editFormData.module_name].url
                .split(":")[1]
                .split(".git")[0];
            toolsApi
                .multiGetBranchesTags(project_name_with_namespace, false)
                .then((r) => {
                    const branches_tags = r.data;
                    const moduleList = rawData.map((v: any) => {
                        if (v.name === editFormData.module_name) {
                            return {
                                ...v,
                                project_name_with_namespace,
                                tags: branches_tags[project_name_with_namespace].tag,
                                branches: branches_tags[project_name_with_namespace].branch
                            };
                        }
                        return { ...v, tags: [], branches: [] };
                    });
                    setModuleList(moduleList);
                })
                .finally(() => setModuleLoading(false));
        });
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
        const { id, process_id, module_name } = editFormData;
        setLoading(true);

        todoApi
            .handle({
                type: 1,
                id,
                process_id,
                module_name,
                version: values["version." + module_name],
                release_note: values.module_release_note
            })
            .then((v) => {
                if (v.code === 0) {
                    setModalShow(false);
                    form.resetFields();
                    setTodoNum(todoNum + 1);
                    setAppProcessNum(appProcessNum + 1);
                } else {
                    message.error(v.msg);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Fragment>
            <Modal
                width={740}
                destroyOnClose={true}
                title="处理应用集成"
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
                        initialValues={{
                            ...initial
                        }}
                        autoComplete="off">
                        <Form.Item
                            label="项目"
                            name="project"
                            required={true}
                            rules={[{ required: true, message: "请选择项目" }]}>
                            <Select disabled placeholder="请选择项目" onChange={projectSelectChange}>
                                {projectList.map((item) => (
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="版本号" name="version" required={true}>
                            <Input disabled placeholder="请输入版本号" />
                        </Form.Item>
                        <Form.Item
                            name="build_type"
                            label="构建类型"
                            required={true}
                            rules={[{ required: true, message: "请选择构建类型" }]}>
                            <Select disabled placeholder="请选择构建类型">
                                <Option value={"RelWithDebInfo"}>RelWithDebInfo</Option>
                                <Option value={"Release"}>Release</Option>
                                <Option value={"Debug"}>Debug</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="desc" label="描述">
                            <Input disabled placeholder="请输入描述" />
                        </Form.Item>

                        <Spin spinning={moduleLoading}>
                            <Divider orientation="left" style={{ margin: "0 0 12px 0" }}>
                                模型信息
                            </Divider>
                            <Form.Item name="lidar" label="激光模型">
                                <Select
                                    disabled
                                    placeholder="请选择激光模型地址"
                                    getPopupContainer={(triggerNode) => triggerNode.parentNode}></Select>
                            </Form.Item>
                            <Form.Item name="camera" label="视觉模型">
                                <Select
                                    disabled
                                    placeholder="请选择激光模型地址"
                                    getPopupContainer={(triggerNode) => triggerNode.parentNode}></Select>
                            </Form.Item>
                            <Form.Item
                                name="map"
                                label="地图数据"
                                required={true}
                                rules={[{ required: true, message: "请选择地图数据地址" }]}>
                                <Select
                                    disabled
                                    placeholder="请选择地图数据地址"
                                    getPopupContainer={(triggerNode) => triggerNode.parentNode}></Select>
                            </Form.Item>
                            <Divider orientation="left" style={{ margin: "0 0 12px 0" }}>
                                配置信息
                            </Divider>
                            {moduleList
                                .filter((item: any) => item.type === 3)
                                .map((item) => (
                                    <Form.Item key={item.id} noStyle>
                                        <Form.Item
                                            name={"module." + item.name}
                                            valuePropName="checked"
                                            style={{ width: "36%", marginLeft: "14%", paddingLeft: "8px" }}>
                                            <Checkbox disabled>{item.name}</Checkbox>
                                        </Form.Item>
                                        <Form.Item
                                            name={"version." + item.name}
                                            label="版本号"
                                            required={true}
                                            rules={[{ required: true, message: "请选择版本号" }]}>
                                            <Select disabled placeholder="请选择版本号" showSearch allowClear></Select>
                                        </Form.Item>
                                    </Form.Item>
                                ))}
                            <Divider orientation="left" style={{ margin: "0 0 12px 0" }}>
                                Base信息
                            </Divider>
                            {moduleList
                                .filter((item: any) => item.type === 0)
                                .map((item) => (
                                    <Form.Item key={item.id} noStyle>
                                        <Form.Item
                                            name={"module." + item.name}
                                            valuePropName="checked"
                                            style={{ width: "36%", marginLeft: "14%", paddingLeft: "8px" }}>
                                            <Checkbox disabled>{item.name}</Checkbox>
                                        </Form.Item>
                                        <Form.Item
                                            name={"version." + item.name}
                                            label="版本号"
                                            required={true}
                                            rules={[{ required: true, message: "请选择版本号" }]}>
                                            <Select disabled placeholder="请选择版本号" showSearch allowClear></Select>
                                        </Form.Item>
                                    </Form.Item>
                                ))}
                            <Divider orientation="left" style={{ margin: "0 0 12px 0" }}>
                                模块信息
                            </Divider>
                            {moduleList
                                .filter((item: any) => item.type === 2)
                                .map((item) => (
                                    <>
                                        <Form.Item key={item.id + item.name} noStyle>
                                            <Form.Item
                                                name={"module." + item.name}
                                                valuePropName="checked"
                                                style={{ width: "36%", marginLeft: "14%", paddingLeft: "8px" }}>
                                                <Checkbox disabled>{item.name}</Checkbox>
                                            </Form.Item>
                                            <Form.Item
                                                name={"version." + item.name}
                                                label="版本号"
                                                required={item.name === editFormData.module_name}
                                                rules={
                                                    item.name === editFormData.module_name
                                                        ? [{ required: true, message: "请选择版本号" }]
                                                        : undefined
                                                }>
                                                <Select
                                                    disabled={item.name !== editFormData.module_name}
                                                    placeholder="请选择版本号"
                                                    showSearch
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
                                        {item.name === editFormData.module_name && (
                                            <Form.Item
                                                key={item.id + item.name + "_note_c"}
                                                name="module_release_note"
                                                noStyle>
                                                <Form.Item
                                                    key={item.id + item.name + "_note"}
                                                    required
                                                    rules={[{ required: true, message: "请输入Release Note" }]}
                                                    style={{ width: "100%" }}
                                                    name="module_release_note"
                                                    label="Release Note">
                                                    <Input.TextArea
                                                        style={{ resize: "none" }}
                                                        placeholder="请输入Release Note"
                                                    />
                                                </Form.Item>
                                            </Form.Item>
                                        )}
                                    </>
                                ))}
                        </Spin>
                    </Form>
                </Spin>
            </Modal>
        </Fragment>
    );
};

export default App;
