import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React from 'react';

const { confirm } = Modal;

const showDeleteConfirm = ({title, content, onOk=()=>{}, onCancel=()=>{}}: { title:string, content?: string, onOk:Function, onCancel?: Function}) => {
    confirm({
        title: title || "删除",
        icon: <ExclamationCircleOutlined />,
        content: content || "删除后不可恢复，请谨慎操作！",
        okType: 'danger',
        onOk() {
            onOk();
        },
        onCancel() {
            onCancel();
        },
    });
};

export default showDeleteConfirm;