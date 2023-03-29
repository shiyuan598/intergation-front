import { get, post, del } from "./fetchTool";

function list(pageNo: number, name: string = "", order = "", seq = "") {
    return get("/data/project.json", {
        pageNo,
        name: encodeURIComponent(name),
        order,
        seq
    });
}

function add(values: { [propName: string]: string | number }) {
    return post("/project/add", values);
}

function edit(values: { [propName: string]: string | number }) {
    return post("/project/update", values);
}

function remove(id: string) {
    return del("/project/delete", {
        id
    });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    list,
    edit,
    add,
    remove
};
