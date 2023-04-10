import { get } from "./fetchTool";

function list(pageNo: number, order = "", seq = "", state=0) {
    return get("/todo/list", {
        pageNo,
        order,
        seq,
        state
    });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    list
};
