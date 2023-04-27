import { get, post, del } from "./fetchTool";

function checkNameNoExist(project:number, type: number, name:string) {
    return get("/module/check/noexist", {project, type, name})
}

function create(values: { [propName: string]: string | number }) {
    return post("/module/create", values);
}

function edit(values: { [propName: string]: string | number }) {
    return post("/module/edit", values);
}

function remove(id: string) {
    return del("/module/delete", {
        id
    });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    checkNameNoExist,
    create,
    edit,
    remove
};
