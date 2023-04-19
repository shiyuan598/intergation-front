import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { LeftOutline } from "antd-mobile-icons";
import { Button, Input, Form, Toast } from "antd-mobile";
import { Spin } from "antd";
import { user as userApi } from "../../api";
import { UserContext } from "../../context";
import "./style.scss";

export default function App() {
    const { userInfo, setUserInfo } = useContext(UserContext) as {
        userInfo: {
            username: string;
            role: number;
            token?: string;
        };
        setUserInfo: Function;
    };
    const [loading, setLoading] = useState(false); // loading
    const history = useHistory();
    const [form] = Form.useForm();
    const onFinish = (values: any) => {
        setLoading(true);
        userApi
            .register({
                role: 3, // 普通用户
                ...values
            })
            .then((v) => {
                if (v.code === 0) {
                    Toast.show({
                        icon: "success",
                        content: "注册成功！"
                    });
                    setTimeout(() => {
                        setUserInfo(v.data[0]);
                        // 将用户信息写入本地存储
                        localStorage.setItem("userInfo", JSON.stringify(v.data[0]));
                        if (v.data[0].role === 1 || v.data[0].role === 3) {
                            history.push("/main");
                        } else if (v.data[0].role === 2) {
                            history.push("/mobile");
                        }
                    }, 500);
                } else {
                    Toast.show({
                        icon: "fail",
                        content: "出错了！"
                    });
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };
    useEffect(() => {
        if (userInfo && userInfo.username) {
            history.push("/main");
        }
    }, [userInfo, history]);

    const checkUserName = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入用户名");
            }
            // 数字、字母、下划线
            if (!/^[a-zA-Z]\w{1,15}$/.test(value)) {
                reject("字母开头，数字、字母、下划线组成，至少两字符");
            }
            resolve("");
        });
    };

    const checkUserExist = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            userApi
                .checkNoExist(value)
                .then((v) => {
                    if (v.data) {
                        resolve("");
                    } else {
                        reject("用户名已存在");
                    }
                })
                .catch(() => {
                    reject("验证用户名出错");
                });
        });
    };

    const checkName = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入名称");
            }
            // 数字、字母、下划线
            if (!/[\u4e00-\u9fa5\dA-Za-z]{2,}/.test(value)) {
                reject("中文、数字、字母组成，至少两字符");
            }
            resolve("");
        });
    };

    const checkTelephone = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请输入手机号");
            }
            if (
                !/^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/g.test(
                    value
                )
            ) {
                reject("请输入正确的手机号");
            } else {
                resolve("");
            }
        });
    };

    const checkRepeatPwd = (rule: any, value: any, cb: any) => {
        return new Promise((resolve, reject) => {
            if (!value) {
                reject("请再次输入密码");
            }
            if (value !== form.getFieldValue("password")) {
                reject("两次输入密码不一致");
            } else {
                resolve("");
            }
        });
    };

    return (
        <div>
            <div className="logo"></div>
            <div className="login">
                <Spin spinning={loading}>
                    <h2 className="title">用户注册</h2>
                    <Form
                        form={form}
                        onFinish={onFinish}
                        layout="horizontal"
                        footer={
                            <Button block type="submit" color="primary" size="large">
                                确定
                            </Button>
                        }>
                        <Form.Item
                            name="username"
                            label="用户名"
                            help="登录账号"
                            required={true}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[
                                { validator: checkUserName },
                                { validator: checkUserExist, validateTrigger: "onBlur" }
                            ]}>
                            <Input placeholder="请输入用户名" clearable autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                            name="name"
                            label="姓名"
                            help="请填写真实姓名"
                            required={true}
                            rules={[{ validator: checkName }]}>
                            <Input placeholder="请输入姓名" clearable autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                            name="telephone"
                            label="手机号"
                            required={true}
                            rules={[{ validator: checkTelephone }]}>
                            <Input placeholder="请输入手机号" clearable autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label="密码"
                            required={true}
                            rules={[{ required: true, message: "请输入密码" }]}>
                            <Input placeholder="请输入密码" clearable type="password" />
                        </Form.Item>
                        <Form.Item
                            name="repeatPassword"
                            label="确认密码"
                            required={true}
                            dependencies={["password"]}
                            rules={[{ validator: checkRepeatPwd }]}>
                            <Input placeholder="请再次输入密码" clearable type="password" />
                        </Form.Item>
                    </Form>
                    <Button
                        className="register-btn"
                        color="primary"
                        fill="none"
                        onClick={() => {
                            history.push("/login");
                        }}>
                        <LeftOutline />
                        返回登录
                    </Button>
                </Spin>
            </div>
        </div>
    );
}
