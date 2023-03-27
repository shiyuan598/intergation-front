import List from './list';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import orderStyle from './order.module.scss';
import BookingModal from "../vehicle/booking";
import { ModalContext } from '../../../context';
import { isAdmin } from "../../../common/user";

const { Search } = Input;

export default function App() {
    const [modalShow, setModalShow] = useState(false);
    const [keyword, setKeyword] = useState<string>("");
    const [showAll, setShowAll] = useState<boolean>(true);
    const onSearch = (value: string) => {
        setKeyword(value);
    };

    const apply = () => {
        setModalShow(true);
    }
    return (
        <div>
            <h4>订单列表</h4>
            <div className={orderStyle.tools}>
                <Button type="primary" icon={<PlusOutlined />} onClick={apply} >预订车辆</Button>
                {!isAdmin() && <Button type="primary" onClick={() => {setShowAll(!showAll)}} >{showAll ? "显示个人订单" : "显示全部订单"}</Button>}
                <Search placeholder="输入关键字后按Enter键查询" onSearch={onSearch} enterButton />
                <ModalContext.Provider value={{ modalShow, setModalShow }}>
                    {modalShow && <BookingModal></BookingModal>}
                </ModalContext.Provider>
            </div>
            <List keyword={keyword} showAll={showAll}></List>
        </div>
    )
}
