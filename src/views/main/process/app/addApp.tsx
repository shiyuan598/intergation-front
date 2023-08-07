// 应用集成表单
import { Modal, Form, Input, Select, message, Spin, Checkbox, Divider, Empty, Button, Space, Radio } from "antd";
import React, { Fragment, useContext, useState, useEffect } from "react";
import { ModalContext, DataContext } from "../../../../context";
import { appProcess as appProcessApi, project as projectApi, tools as toolsApi } from "../../../../api";
import { getUserInfo } from "../../../../common/user";

const { Option, OptGroup } = Select;

interface ProjectType {
    id: number;
    name: string;
    job_name: string;
    job_name_p: string;
    artifacts_url: string;
    artifacts_url_p: string;
    owner: number;
    lidar_path: string;
    camera_path: string;
    map_path: string;
    plan_map_path: string;
    lidar_point_path: string;
    webviz_path: string;
    mcu_path: string;
    driver_path: string;
    sdc_path: string;
}

const App = (props: any = {}) => {
    const { data: editFormData } = props;
    let initial: any = { auto_test: 0 };
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
    const [projectList, setProjectList] = useState([] as ProjectType[]);
    const [lidarPathList, setLidarPathList] = useState([] as string[]);
    const [cameraPathList, setCameraPathList] = useState([] as string[]);
    const [mapPathList, setMapPathList] = useState([] as string[]);
    const [planMapPathList, setPlanMapPathList] = useState([] as string[]);
    const [lidarPointPathList, setLidarPointPathList] = useState([] as string[]);
    const [mcuPathList, setMcuPathList] = useState([] as string[]);
    const [driverPathList, setDriverPathList] = useState([] as string[]);
    const [sdcPathList, setSDCPathList] = useState([] as string[]);
    const [webvizPathList, setWebvizPathList] = useState([] as string[]);
    const [project, setProject] = useState(undefined as ProjectType | undefined);
    const [configList, setConfigList] = useState(
        [] as {
            id: number;
            name: string;
            project_name_with_namespace: string;
            tags: string[];
            branches: string[];
        }[]
    );
    const [baseList, setBaseList] = useState(
        [] as {
            id: number;
            name: string;
            project_name_with_namespace: string;
            tags: string[];
            branches: string[];
        }[]
    );
    const [moduleList, setModuleList] = useState(
        [] as {
            id: number;
            name: string;
            project_name_with_namespace: string;
            tags: string[];
            branches: string[];
        }[]
    );
    const { appProcessNum, setAppProcessNum } = useContext(DataContext) as {
        appProcessNum: number;
        setAppProcessNum: Function;
    };
    const [loading, setLoading] = useState(false); // loading
    const [modelLoading, setModelLoading] = useState(false); // modelLoading
    const [configLoading, setConfigLoading] = useState(false); // configModuleLoading
    const [baseLoading, setBaseLoading] = useState(false); // baseModuleLoading
    const [moduleLoading, setModuleLoading] = useState(false); // moduleLoading

    const [form] = Form.useForm();

    useEffect(() => {
        // 获取所有的project
        projectApi.listAll(getUserInfo().username).then((v) => {
            setProjectList(v.data);
        });
    }, []);

    useEffect(() => {
        // 如果初始化时编辑模式，就主动触发一下模块查询
        if (initial.project && projectList.length) {
            projectSelectChange(initial.project);
        }
    }, [initial.project, projectList]);

    useEffect(() => {
        if (!project) {
            return;
        }
        if (project.owner !== getUserInfo().id) {
            form.setFieldValue("auto_test", 0);
        }
    }, [project]);

    const projectSelectChange = (v: any) => {
        if (!v || !projectList.length) {
            return;
        }
        let projectInfo = projectList.find((item) => item.id === Number(v));
        setProject(projectInfo);

        setModelLoading(true);
        setConfigLoading(true);
        setBaseLoading(true);
        setModuleLoading(true);

        // 获取激光模型、视觉模型、地图数据、规划地图、 点云地图、MCU、驱动、SDC的路径、可视化版本的路径
        let { lidar_path, camera_path, map_path, plan_map_path, lidar_point_path, webviz_path, mcu_path, driver_path, sdc_path } = projectInfo as {
            lidar_path: string;
            camera_path: string;
            map_path: string;
            plan_map_path: string;
            lidar_point_path: string;
            webviz_path: string;
            mcu_path: string;
            driver_path: string;
            sdc_path: string;
        };
        Promise.all([
            toolsApi.getArtifactFolders(lidar_path),
            toolsApi.getArtifactFolders(camera_path),
            toolsApi.getArtifactFolders(map_path),
            toolsApi.getArtifactFolders(plan_map_path),
            toolsApi.getArtifactFolders(lidar_point_path),
            toolsApi.getArtifactFiles(mcu_path), // 查询目录下的文件
            toolsApi.getArtifactFiles(driver_path), // 查询目录下的文件
            toolsApi.getArtifactFiles(sdc_path), // 查询目录下的文件
            toolsApi.getArtifactFolders(webviz_path) // 查询目录下的文件
        ])
            .then((v) => {
                setLidarPathList(v[0].data);
                setCameraPathList(v[1].data);
                setMapPathList(v[2].data);
                setPlanMapPathList(v[3].data);
                setLidarPointPathList(v[4].data);
                setMcuPathList(v[5].data);
                setDriverPathList(v[6].data);
                setSDCPathList(v[7].data);
                setWebvizPathList(v[8].data);
            })
            .finally(() => setModelLoading(false));

        // 获取所有模块信息
        projectApi.modulesAll(v, "0,2,3").then((raw) => {
            const rawConfig = raw.data.filter((item: any) => item.type === 3);
            const rawBase = raw.data.filter((item: any) => item.type === 0);
            const rawModule = raw.data.filter((item: any) => item.type === 2);

            // 创建时默认选择所有模块
            !editFormData &&
                [...rawBase, ...rawModule, ...rawConfig].forEach((item: any) =>
                    form.setFieldValue("module." + item.name, true)
                );
            // 获取配置模块的branch/tag
            toolsApi
                .multiGetBranchesTags(rawConfig.map((item: any) => item.git.split(":")[1].split(".git")[0]))
                .then((r) => {
                    const branches_tags = r.data;
                    const modules = rawConfig.map((v: any) => {
                        const project_name_with_namespace = v.git.split(":")[1].split(".git")[0];
                        return {
                            ...v,
                            project_name_with_namespace,
                            tags: branches_tags[project_name_with_namespace]?.tag || [],
                            branches: branches_tags[project_name_with_namespace]?.branch || []
                        };
                    });
                    setConfigList(modules);
                })
                .finally(() => setConfigLoading(false));
            // 获取基础模块的branch/tag
            toolsApi
                .multiGetBranchesTags(rawBase.map((item: any) => item.git.split(":")[1].split(".git")[0]))
                .then((r) => {
                    const branches_tags = r.data;
                    const modules = rawBase.map((v: any) => {
                        const project_name_with_namespace = v.git.split(":")[1].split(".git")[0];
                        return {
                            ...v,
                            project_name_with_namespace,
                            tags: branches_tags[project_name_with_namespace]?.tag || [],
                            branches: branches_tags[project_name_with_namespace]?.branch || []
                        };
                    });
                    setBaseList(modules);
                })
                .finally(() => setBaseLoading(false));
            // 获取模块的branch/tag
            toolsApi
                .multiGetBranchesTags(rawModule.map((item: any) => item.git.split(":")[1].split(".git")[0]))
                .then((r) => {
                    const branches_tags = r.data;
                    const modules = rawModule.map((v: any) => {
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

    // webviz的默认版本
    useEffect(() => {
      if(webvizPathList.length) {
        !form.getFieldValue("webviz") && form.setFieldValue("webviz", webvizPathList[0]);
      }
    }, [webvizPathList, form]);
    

    // 刷新分支
    const refreshBranch = (type: string, project_name_with_namespace: string) => {
        if (type === "config") {
            setConfigLoading(true);
            // 获取模块的branch/tag
            toolsApi
                .multiGetBranchesTags(project_name_with_namespace, false)
                .then((r) => {
                    const branches_tags = r.data;
                    configList.forEach((item) => {
                        if (item.project_name_with_namespace === project_name_with_namespace) {
                            item.tags = branches_tags[project_name_with_namespace]?.tag || [];
                            item.branches = branches_tags[project_name_with_namespace]?.branch || [];
                        }
                    });
                    setConfigList(configList);
                })
                .finally(() => setConfigLoading(false));
        }
        if (type === "base") {
            setBaseLoading(true);
            // 获取模块的branch/tag
            toolsApi
                .multiGetBranchesTags(project_name_with_namespace, false)
                .then((r) => {
                    const branches_tags = r.data;
                    baseList.forEach((item) => {
                        if (item.project_name_with_namespace === project_name_with_namespace) {
                            item.tags = branches_tags[project_name_with_namespace]?.tag || [];
                            item.branches = branches_tags[project_name_with_namespace]?.branch || [];
                            // // 测试
                            // item.tags = [...item.tags, "hahaha"];
                        }
                    });
                    setBaseList(baseList);
                })
                .finally(() => setBaseLoading(false));
        }
        if (type === "module") {
            setModuleLoading(true);
            // 获取模块的branch/tag
            toolsApi
                .multiGetBranchesTags(project_name_with_namespace, false)
                .then((r) => {
                    const branches_tags = r.data;
                    moduleList.forEach((item) => {
                        if (item.project_name_with_namespace === project_name_with_namespace) {
                            item.tags = branches_tags[project_name_with_namespace]?.tag || [];
                            item.branches = branches_tags[project_name_with_namespace]?.branch || [];
                        }
                    });
                    setModuleList(moduleList);
                })
                .finally(() => setModuleLoading(false));
        }
    };

    const getModuleInfo = (name: string, moduleList: any[]) => {
        let match = moduleList.find((v) => v.name === name);
        if (match) {
            return {
                type: match.type,
                url: match.git,
                owner: match.owner,
                owner_name: match.owner_name,
                owner_phone: match.owner_phone
            };
        }
        return null;
    };

    const handleOk = () => {
        if (!loading && !configLoading && !baseLoading && !moduleLoading) {
            form.submit();
        }
    };

    const handleCancel = () => {
        setModalShow(false);
        form.resetFields();
    };

    const onFinish = (values: any) => {
        if (!project) {
            return;
        }
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
                        ...getModuleInfo(name, [...configList, ...baseList, ...moduleList]),
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
        let { job_name, job_name_p, artifacts_url, artifacts_url_p, owner } = project;
        const type = owner === getUserInfo().id ? 0 : 1; // 通过是否为项目负责人来判断
        res.type = type;
        res.job_name = type === 0 ? job_name : job_name_p;
        res.artifacts_url = type === 0 ? artifacts_url : artifacts_url_p;
        res.creator = getUserInfo().id;

        setLoading(true);
        let p = null;
        if (editFormData?.opt === "edit") {
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

    const checkVersionExist = (rule: any, value: any, cb: any) => {
        const project = form.getFieldValue("project");
        if (!project) {
            return Promise.resolve("");
        }
        return new Promise((resolve, reject) => {
            if (value === editFormData?.version) {
                resolve("");
            } else {
                appProcessApi
                    .checkVersionNoExist(project, getUserInfo().id, value)
                    .then((v) => {
                        if (v.data) {
                            resolve("");
                        } else {
                            reject("版本号已存在");
                        }
                    })
                    .catch(() => {
                        reject("验证版本号出错");
                    });
            }
        });
    };

    return (
        <Fragment>
            <Modal
                width={960}
                destroyOnClose={true}
                title={`${editFormData?.opt === "edit" ? "编辑" : "创建"}应用集成`}
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
                            rules={[
                                { validator: checkVersion },
                                { validator: checkVersionExist, validateTrigger: "onBlur" }
                            ]}>
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
                        <Form.Item name="desc" label="描述">
                            <Input placeholder="请输入描述" />
                        </Form.Item>
                        <Form.Item name="auto_test" label="自动化测试">
                            <Radio.Group>
                                <Radio value={0}>否</Radio>
                                <Radio value={1}>是</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Spin spinning={modelLoading}>
                            <Divider orientation="left" style={{ margin: "0 0 12px 0" }}>
                                制品信息
                            </Divider>
                            {!project && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先选择项目" />}
                            {project && (
                                <>
                                    <Form.Item name="lidar" label="激光模型">
                                        <Select
                                            allowClear
                                            placeholder="请选择激光模型地址"
                                            getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                            {lidarPathList.map((v) => (
                                                <Option key={v} value={v}>
                                                    {v}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name="camera" label="视觉模型">
                                        <Select
                                            allowClear
                                            placeholder="请选择激光模型地址"
                                            getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                            {cameraPathList.map((v) => (
                                                <Option key={v} value={v}>
                                                    {v}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        name="map"
                                        label="地图数据"
                                        required={true}
                                        rules={[{ required: true, message: "请选择地图数据地址" }]}>
                                        <Select
                                            placeholder="请选择地图数据地址"
                                            getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                            {mapPathList.map((v) => (
                                                <Option key={v} value={v}>
                                                    {v}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        name="plan_map"
                                        label="规划地图"
                                        required={false}
                                        rules={[{ required: true, message: "请选择规划地图地址" }]}>
                                        <Select
                                            placeholder="请选择规划地图地址"
                                            getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                            {planMapPathList.map((v) => (
                                                <Option key={v} value={v}>
                                                    {v}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        name="lidar_point"
                                        label="点云地图"
                                        required={false}>
                                        <Select
                                            placeholder="请选择点云地图地址"
                                            getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                            {lidarPointPathList.map((v) => (
                                                <Option key={v} value={v}>
                                                    {v}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    {mcuPathList?.length ? (
                                        <>
                                            <Form.Item
                                                name="mcu"
                                                label="MCU版本"
                                                required={true}
                                                rules={[{ required: true, message: "请选择MCU版本" }]}>
                                                <Select
                                                    allowClear
                                                    placeholder="请选择MCU版本"
                                                    getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                                    {mcuPathList.map((v) => (
                                                        <Option key={v} value={v}>
                                                            {v}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </>
                                    ) : null}
                                    {driverPathList?.length ? (
                                        <>
                                            <Form.Item
                                                name="driver"
                                                label="驱动程序"
                                                required={true}
                                                rules={[{ required: true, message: "请选择驱动程序" }]}>
                                                <Select
                                                    allowClear
                                                    placeholder="请选择驱动数据地址"
                                                    getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                                    {driverPathList.map((v) => (
                                                        <Option key={v} value={v}>
                                                            {v}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </>
                                    ) : null}
                                    {sdcPathList?.length ? (
                                        <>
                                            <Form.Item
                                                name="sdc"
                                                label="SDC程序"
                                                required={true}
                                                rules={[{ required: true, message: "请选择SDC程序" }]}>
                                                <Select
                                                    allowClear
                                                    placeholder="请选择SDC数据地址"
                                                    getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                                    {sdcPathList.map((v) => (
                                                        <Option key={v} value={v}>
                                                            {v}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </>
                                    ) : null}
                                    <Form.Item
                                        name="webviz"
                                        label="可视化"
                                        required={true}
                                        rules={[{ required: true, message: "请选择可视化版本" }]}>
                                        <Select
                                            placeholder="请选择可视化版本"
                                            getPopupContainer={(triggerNode) => triggerNode.parentNode}>
                                            {webvizPathList.map((v) => (
                                                <Option key={v} value={v}>
                                                    {v}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </>
                            )}
                        </Spin>
                        <Spin spinning={configLoading}>
                            <Divider orientation="left" style={{ margin: "0 0 12px 0" }}>
                                配置信息
                            </Divider>
                            {!configList.length && (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先选择项目" />
                            )}
                            {configList
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
                                            <Select
                                                placeholder="请选择版本号"
                                                showSearch
                                                allowClear
                                                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                                                dropdownRender={(menu) => (
                                                    <>
                                                        {menu}
                                                        <Divider style={{ margin: "8px 0" }} />
                                                        <Space style={{ padding: "0 8px 4px" }}>
                                                            <Button
                                                                type="link"
                                                                onClick={() => {
                                                                    refreshBranch(
                                                                        "config",
                                                                        item.project_name_with_namespace
                                                                    );
                                                                }}>
                                                                新分支/标签未显示？刷新一下
                                                            </Button>
                                                        </Space>
                                                    </>
                                                )}>
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
                        <Spin spinning={baseLoading}>
                            <Divider orientation="left" style={{ margin: "0 0 12px 0" }}>
                                基础信息
                            </Divider>
                            {!baseList.length && (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先选择项目" />
                            )}
                            {baseList
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
                                            <Select
                                                placeholder="请选择版本号"
                                                showSearch
                                                allowClear
                                                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                                                dropdownRender={(menu) => (
                                                    <>
                                                        {menu}
                                                        <Divider style={{ margin: "8px 0" }} />
                                                        <Space style={{ padding: "0 8px 4px" }}>
                                                            <Button
                                                                type="link"
                                                                onClick={() => {
                                                                    refreshBranch(
                                                                        "base",
                                                                        item.project_name_with_namespace
                                                                    );
                                                                }}>
                                                                新分支/标签未显示？刷新一下
                                                            </Button>
                                                        </Space>
                                                    </>
                                                )}>
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
                        <Spin spinning={moduleLoading}>
                            <Divider orientation="left" style={{ margin: "0 0 12px 0" }}>
                                模块信息
                            </Divider>
                            {!moduleList.length && (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先选择项目" />
                            )}
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
                                            <Select
                                                placeholder="请选择版本号"
                                                showSearch
                                                allowClear
                                                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                                                dropdownRender={(menu) => (
                                                    <>
                                                        {menu}
                                                        <Divider style={{ margin: "8px 0" }} />
                                                        <Space style={{ padding: "0 8px 4px" }}>
                                                            <Button
                                                                type="link"
                                                                onClick={() => {
                                                                    refreshBranch(
                                                                        "module",
                                                                        item.project_name_with_namespace
                                                                    );
                                                                }}>
                                                                新分支/标签未显示？刷新一下
                                                            </Button>
                                                        </Space>
                                                    </>
                                                )}>
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
