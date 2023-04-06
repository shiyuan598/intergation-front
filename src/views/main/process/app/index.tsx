import React, { useState, Fragment, useEffect, useContext } from "react";
import { Input, Button, Table, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import style from "../process.module.scss";
import { isAdmin } from "../../../../common/user";
import { saveFile } from "../../../../common/util";
import type { ColumnsType } from "antd/es/table";
import { appProcess } from "../../../../api";
import { ModalContext, DataContext } from "../../../../context";
import AddApiModal from "./addApp";

const { Search } = Input;

interface DataType {
    id: number;
    project: string;
    version: string;
    build_type: string;
    api_version: string;
    creator: string;
    create_time: string;
    update_time: string;
    status: number;
    modules: object;
    status_name: string;
}

export default function Api() {
    const [modalShow, setModalShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>([]);
    const [sorter, setSorter] = useState<any>(null);
    const [pageNo, setPageNo] = useState(1);
    const [pagination, setPagination] = useState({});
    const [curRow, setCurRow] = useState<DataType | null>(null);
    const [keyword, setKeyword] = useState<string>("");
    const { appProcessNum } = useContext(DataContext) as {
        appProcessNum: number;
    };

    const createApi = () => {
        setCurRow(null);
        setModalShow(true);
    };
    const exportConfig = (e: any, v: any) => {
        e.stopPropagation();
        saveFile(
            JSON.stringify(
                {
                    project: v.project,
                    version: v.version,
                    build_type: v.build_type,
                    modules: pickModuleInfo(v.modules)
                },
                null,
                4
            ),
            `${v.project_name}_${v.version}.json`
        );
    };
    const pickModuleInfo = (modulesStr: string) => {
        let modules = JSON.parse(modulesStr);
        let res: any = {};
        Object.keys(modules).forEach((k) => {
            res[k] = {
                url: modules[k].url,
                version: modules[k].version || "",
            }
        });
        return res;
    }
    const edit = (e: any, v: any) => {
        e.stopPropagation();
        setCurRow(v);
        setModalShow(true);
    };

    const onSearch = (value: string) => {
        setKeyword(value);
    };
    const columns: ColumnsType<DataType> = [
        {
            title: "项目",
            width: 120,
            ellipsis: true,
            dataIndex: "project_name",
            key: "project_name",
            sorter: true
        },
        {
            title: "版本号",
            width: 120,
            ellipsis: true,
            dataIndex: "version",
            key: "version",
            sorter: true
        },
        {
            title: "接口版本号",
            width: 120,
            ellipsis: true,
            dataIndex: "api_version",
            key: "api_version",
            sorter: true
        },
        {
            title: "描述",
            width: 120,
            ellipsis: true,
            dataIndex: "release_note",
            key: "release_note"
        },
        {
            title: "创建者",
            width: 120,
            ellipsis: true,
            dataIndex: "creator",
            key: "creator",
            sorter: true
        },
        {
            title: "创建时间",
            width: 170,
            dataIndex: "create_time",
            key: "create_time",
            sorter: true
        },
        {
            title: "更新时间",
            width: 170,
            dataIndex: "update_time",
            key: "update_time",
            sorter: true
        },
        {
            title: "模块配置",
            width: 170,
            ellipsis: true,
            dataIndex: "modules",
            key: "modules"
        },
        {
            title: "状态",
            width: 120,
            ellipsis: true,
            dataIndex: "state_name",
            key: "state_name",
            sorter: true
        },
        isAdmin()
            ? {
                  title: "操作",
                  width: 120,
                  dataIndex: "",
                  key: "x",
                  render: (v: DataType) => {
                      return (
                          <Fragment>
                              <a href="#!" onClick={(e) => exportConfig(e, v)}>
                                  导出
                              </a>
                              <a href="#!" onClick={(e) => edit(e, v)}>
                                  编辑
                              </a>
                          </Fragment>
                      );
                  }
              }
            : {}
    ];

    const getData = (pageNo: number, name: string = "", sorter: any) => {
        let { field: order = "", order: seq = "" } = sorter || {};
        setLoading(true);
        appProcess
            .list(pageNo, name, order, seq)
            .then((v) => {
                if (v.code === 0) {
                    setData(v.data);
                    setPagination(v.pagination);
                } else {
                    message.error(v.msg);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const onChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        const action = extra.action;
        if (action === "sort") {
            const { order, columnKey } = sorter;
            setSorter({
                field: columnKey,
                order: order
            });
        }
    };

    const pageChange = (pageNo: number, pageSize: number) => {
        setPageNo(pageNo);
    };

    // 搜索条件变化时页码重置为1
    useEffect(() => {
        setPageNo(1);
    }, [keyword]);

    useEffect(() => {
        getData(pageNo, keyword, sorter);
    }, [pageNo, keyword, sorter, appProcessNum]);
    return (
        <>
            <div className={style.tools}>
                {isAdmin() && (
                    <>
                        <Button type="primary" icon={<PlusOutlined />} onClick={createApi}>
                            创建应用集成
                        </Button>
                        <ModalContext.Provider value={{ modalShow, setModalShow }}>
                            {modalShow && <AddApiModal data={curRow} />}
                        </ModalContext.Provider>
                    </>
                )}
                <Search placeholder="输入关键字后按Enter键查询" onSearch={onSearch} enterButton />
            </div>
            <Table
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: false,
                    onChange: pageChange
                }}
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={data}
                onChange={onChange}
            />
        </>
    );
}
