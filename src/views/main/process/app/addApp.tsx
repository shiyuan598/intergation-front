// 接口集成表单
import { Modal, Form, Input, Select, message, Spin, Checkbox, Divider } from "antd";
import React, { Fragment, useContext, useState, useEffect } from "react";
import { ModalContext, DataContext } from "../../../../context";
import { appProcess as appProcessApi, project as projectApi, tools as toolsApi } from "../../../../api";
import { getUserInfo, isAdmin } from "../../../../common/user";

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
        curRow: object;
        setCurRow: Function;
    };
    const [projectList, setProjectList] = useState(
        [] as { id: number; name: string; job_name: string; artifacts_path: string }[]
    );
    const [project, setProject] = useState();
    const [apiVersionList, setApiVersionList] = useState([] as string[]);
    const [moduleList, setModuleList] = useState(
        [] as {
            id: number;
            name: string;
            tags: { name: string }[];
            branches: { name: string }[];
        }[]
    );
    const { appProcessNum, setAppProcessNum } = useContext(DataContext) as {
        appProcessNum: number;
        setAppProcessNum: Function;
    };
    const [loading, setLoading] = useState(false); // loading
    const [moduleLoading, setModuleLoading] = useState(false); // loading

    const [form] = Form.useForm();

    useEffect(() => {
        // 获取所有的project
        projectApi.listAll().then((v) => {
            setProjectList(v.data);
        });
        // 如果初始化时编辑模式，就主动触发一下模块查询
        if (initial.project) {
            projectSelectChange(initial.project);
        }
    }, []);

    useEffect(() => {
        if (!project) {
            return;
        }
        // 获取所有的接口版本
        let path = projectList.find((item) => item.id === Number(project))?.artifacts_path;
        console.info(project, path);
        path &&
            toolsApi.getArtifactFiles(path).then((v) => {
                setApiVersionList(v.data);
            });
    }, [projectList, project]);

    const projectSelectChange = (v: any) => {
        setProject(v);
        if (!v) {
            return;
        }
        setModuleLoading(true);
        // 获取所有模块信息
        projectApi.modulesAll(v).then((raw) => {
            const rawData = raw.data.filter((item: any) => item.type !== 1);

            // 默认选择所有模块
            !editFormData && rawData.forEach((item: any) => form.setFieldValue("module." + item.name, true));
            // 获取所有模块的branch/tag
            toolsApi
                .getGitBranchesTagsOfMultiProjects(rawData.map((item: any) => item.git.split(":")[1].split(".git")[0]))
                .then((r) => {
                    const branches_tags = r.data;
                    const modules = rawData.map((v: any) => {
                        const project_name_with_namespace = v.git.split(":")[1].split(".git")[0];
                        return {
                            ...v,
                            tags: branches_tags[project_name_with_namespace].tag,
                            branches: branches_tags[project_name_with_namespace].branch
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
                type: match.type,
                url: match.git,
                owner: match.owner
            };
        }
        return null;
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
        let state = 1;
        Object.keys(values).forEach((k) => {
            if (k.startsWith("module.")) {
                if (values[k]) {
                    // 选择了该模块则添加到结果中并记录版本号等信息
                    let name = k.substring("module.".length);
                    res.modules[name] = {
                        ...getModuleInfo(name, moduleList),
                        version: values["version." + name] || "",
                        release_note: values["release_note." + name] || ""
                    };
                    // 如果版本信息有为空的项，状态设为0
                    if (!res.modules[name].version) {
                        state = 0;
                    }
                }
            } else if (k.startsWith("version.") || k.startsWith("release_note.")) {
                // pass
            } else {
                res[k] = values[k];
            }
        });
        res.state = state;
        res.modules = JSON.stringify(res.modules, null, 4);
        res.job_name = projectList.find((item) => item.id === Number(values.project))?.job_name;
        res.creator = getUserInfo().id;
        res.type = isAdmin() ? 1 : 2;
        setLoading(true);
        let p = null;
        if (editFormData) {
            p = appProcessApi.edit({
                id: initial.id,
                ...res
            });
        } else {
            p = appProcessApi.create(res);
        }
        p.then((v) => {
            if (v.code === 0) {
                setModalShow(false);
                form.resetFields();
                setAppProcessNum(appProcessNum + 1);
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
        });
    };

    return (
        <Fragment>
            <Modal
                width={740}
                destroyOnClose={true}
                title={`${editFormData ? "编辑" : "创建"}应用集成`}
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
                            ...initial,
                            "release_note.zmap": Math.random(),
                            "release_note.zloc": Math.random()
                        }}
                        autoComplete="off">
                        <Form.Item
                            label="项目"
                            name="project"
                            required={true}
                            rules={[{ required: true, message: "请选择项目" }]}>
                            <Select disabled={!!editFormData} placeholder="请选择项目" onChange={projectSelectChange}>
                                {projectList.map((item) => (
                                    <Option key={item.id} value={item.id + ""}>
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
                            <Select placeholder="请选择构建类型">
                                <Option value={"RelWithDebInfo"}>RelWithDebInfo</Option>
                                <Option value={"Release"}>Release</Option>
                                <Option value={"Debug"}>Debug</Option>
                            </Select>
                        </Form.Item>
                        {/* <Form.Item
                            name="api_version"
                            label="接口版本"
                            required={true}
                            rules={[{ required: true, message: "请选择接口版本" }]}>
                            <Select placeholder="请选择接口版本">
                                {apiVersionList.map((v) => (
                                    <Option key={v} value={v}>
                                        {v}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item> */}

                        <Form.Item name="desc" label="描述">
                            <Input placeholder="请输入描述" />
                        </Form.Item>

                        <Spin spinning={moduleLoading}>
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
                                            <Select placeholder="请选择版本号" showSearch allowClear>
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
                                        {/* <Form.Item
                                        style={{ width: 0, height: 0 }}
                                        name={"release_note." + item.name}
                                        required={true}
                                        label="Release Note">
                                        <Input hidden placeholder="release note" />
                                    </Form.Item> */}
                                    </Form.Item>
                                ))}
                            <Divider orientation="left" style={{ margin: "0 0 12px 0" }}>
                                模块信息
                            </Divider>
                            {moduleList
                                .filter((item: any) => item.type === 2)
                                .map((item) => (
                                    <Form.Item key={item.id} noStyle>
                                        <Form.Item
                                            name={"module." + item.name}
                                            valuePropName="checked"
                                            style={{ width: "36%", marginLeft: "14%", paddingLeft: "8px" }}>
                                            <Checkbox>{item.name}</Checkbox>
                                        </Form.Item>
                                        <Form.Item name={"version." + item.name} label="版本号">
                                            <Select placeholder="请选择版本号" showSearch allowClear>
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
                                        <Form.Item
                                            style={{ width: 0, height: 0 }}
                                            name={"release_note." + item.name}
                                            required={true}
                                            label="Release Note">
                                            <Input hidden placeholder="release note" />
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
