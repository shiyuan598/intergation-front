import React from "react";
import ApiList from "./api/index";
import AppList from "./app/index";
import { Tabs } from "antd";

export default function App() {
    let activeKey = localStorage.getItem("process_active_key") || "2";
    const handleTabClick = (key: string) => {
        localStorage.setItem("process_active_key", key);
    };
    return (
        <div>
            <Tabs
                defaultActiveKey={activeKey}
                onChange={handleTabClick}
                items={[
                    {
                        key: "1",
                        label: "接口集成",
                        children: <ApiList />
                    },
                    {
                        key: "2",
                        label: "应用集成",
                        children: <AppList />
                    }
                ]}></Tabs>
        </div>
    );
}
