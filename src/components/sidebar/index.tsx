import { TableOutlined, CalendarOutlined, ScheduleOutlined, LineChartOutlined, TeamOutlined, FileProtectOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import React, {useState, useEffect} from 'react';
import { useHistory, useLocation } from "react-router-dom";
import "./sidebar.module.scss";

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('流程管理', '/main/process', <ScheduleOutlined />),
  getItem('项目管理', '/main/project', <FileProtectOutlined />),
  getItem('待办中心', '/main/todo', <FileProtectOutlined />),
  getItem('用户管理', '/main/user', <TeamOutlined />)
];

const App: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const onClick: MenuProps['onClick'] = e => {
    history.push(e.key); // 跳转到对应的路由
  };

  const [selected, setSelected] = useState("");
  useEffect(() => {
    let pathName = location.pathname === "/main/module" ? "/main/project" : location.pathname;
    setSelected(pathName);
  }, [location]);
  
  return (
    <Menu defaultSelectedKeys={[selected]} selectedKeys={[selected]} onClick={onClick} style={{ width: 256 }} mode="vertical" items={items} />
  )
};

export default App;