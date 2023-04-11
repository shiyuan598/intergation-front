import { get } from "./fetchTool";

function list(user_id:number, pageNo: number, order = "", seq = "", state=0) {
    return get("/todo/list", {
        user_id,
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
