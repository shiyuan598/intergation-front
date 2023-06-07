import { get, post, del } from "./fetchTool";

function getUser(pageNo: number, name: string = "", order = "", seq = "") {
    return get("/user/list", {
        pageNo,
        name: encodeURIComponent(name),
        order,
        seq
    });
}

function getAllUser() {
    return get("/user/list/all");
}

function getUserByRole(roleId:number=1) {
    return get(`/user/role/${roleId}`);
}

function addUser(values: { [propName: string]: string | number }) {
    return post("/user/add", values);
}

function editUser(values: { [propName: string]: string | number }) {
    return post("/user/update", values);
}

function deleteUser(id: string) {
    return del("/user/delete", {
        id
    });
}

function login(username: string, password: string) {
    return post("/user/login", {
        username,
        password
    });
}

function checkNoExist(username: string) {
    return get("/user/check/noexist", {
        username
    });
}

function checkCorrect(username: string, telephone: string) {
    return get("/user/check/correct", {
        username,
        telephone
    });
}

function register(values: { [propName: string]: string | number }) {
    return post("/user/register", values);
}

function resetPassword(values: { [propName: string]: string | number }) {
    return post("/user/resetpwd", values);
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getUser,
    getAllUser,
    getUserByRole,
    addUser,
    editUser,
    deleteUser,
    login,
    checkNoExist,
    checkCorrect,
    register,
    resetPassword
};
