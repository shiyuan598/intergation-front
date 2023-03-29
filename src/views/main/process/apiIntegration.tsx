import { Input, Button, Tabs } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import style from "./process.module.scss";
import { ModalContext } from "../../../context";
// import AddUserModal from './addUser';
import { isAdmin } from "../../../common/user";

const { Search } = Input;

export default function Api() {
  const [keyword, setKeyword] = useState<string>("");

    const addUser = () => {
    };

    const onSearch = (value: string) => {
        setKeyword(value);
    };
  return (
            <div className={style.tools}>
                {isAdmin() && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={addUser}>
                        创建接口集成
                    </Button>
                )}
                <Search placeholder="输入关键字后按Enter键查询" onSearch={onSearch} enterButton />
                {/* <ModalContext.Provider value={{ modalShow, setModalShow }}>
                    {modalShow && <AddUserModal></AddUserModal>}
                </ModalContext.Provider> */}
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt, expedita.
            </div>
  )
}
