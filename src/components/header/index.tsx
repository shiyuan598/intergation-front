import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import headerStyle from './header.module.scss';
import { Popover } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { UserContext } from '../../context';

export default function HeaderComp() {
  const { userInfo, setUserInfo } = useContext(UserContext) as {
    userInfo: {
      name: string,
      username: string,
      role: number,
      token?: string
    },
    setUserInfo: Function
  };
  const history = useHistory();
  const logout = () => {
    setUserInfo({});
    localStorage.setItem("userInfo", "{}");
    sessionStorage.setItem("mapReload", "");
    history.push("/login");
  }
  return (
    <div className={headerStyle.header}>
      <div className={headerStyle.logo}></div>
      <div className={headerStyle.menu}>软件集成平台</div>
      <Popover
        placement="leftTop"
        content={
          <div className="userInfo">
            <div>{userInfo.username}</div>
            <div className='logout' onClick={logout}>注销</div>
          </div>
        } trigger="hover">
        <span className={headerStyle.account}>
          <UserOutlined />
          <span className={headerStyle.name}>{userInfo.name}</span>
        </span>
      </Popover>
    </div>
  )
}
