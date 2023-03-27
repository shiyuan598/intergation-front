import { get, post, del } from "./fetchTool";

function getNoticeList() {
    return get("/notice/list");
}

function getSummary() {
    return get("/statis/summary");
}

function addNotice(values: { [propName: string]: string | number }) {
    return post("/notice/add", values);
}

function deleteNotice(id: number) {
    return del("/notice/delete", {
        id
    });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getSummary,
    getNoticeList,
    addNotice,
    deleteNotice
};
