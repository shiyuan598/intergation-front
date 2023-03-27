import { get, post, del } from "./fetchTool";

function getUser(pageNo: number, name: string="", order = "", seq= "") {
    return get("/user/list", {
        pageNo,
        name: encodeURIComponent(name),
        order,
        seq
    });
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

function getDriver(username?: string) {
    if (username) {
        return get("/user/driver", {
            username: username
        });
    } else {
        return get("/user/driver");
    }
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
    addUser,
    editUser,
    deleteUser,
    login,
    checkNoExist,
    checkCorrect,
    getDriver,
    register,
    resetPassword
};
