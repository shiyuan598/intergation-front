import { get, post, del } from "./fetchTool";

function getVehicle(pageNo: number, name = "", order = "", seq = "") {
    return get("/vehicle/list", {
        pageNo,
        name: encodeURIComponent(name),
        order,
        seq
    });
}

function getUseTime(start: string, end: string, vehicleIds: string = "") {
    return get("/vehicle/usetime", {
        start,
        end,
        vehicleIds
    });
}

function checkNoExist(vehicleNo: string) {
    return get("/vehicle/check/noexist", {
        vehicleNo
    });
}

function addVehicle(values: { [propName: string]: string | number }) {
    return post("/vehicle/add", values);
}

function editVehicle(values: { [propName: string]: string | number }) {
    return post("/vehicle/update", values);
}

function deleteVehicle(id: string) {
    return del("/vehicle/delete", {
        id
    });
}

function getAvailableVehicle(projectIds: string = "", keyword: string = "") {
    return get("/vehicle/list/available", {
        projectIds,
        keyword
    });
}

function getOrderSummary(vehicleId: string) {
    return get("/order/summary", {
        vehicleId
    });
}

function getOrderPresent(vehicleId: string) {
    return get("/order/present", {
        vehicleId
    });
}

function getVehiclesPosition() {
    return get("/vehicle/position");
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getVehicle,
    getUseTime,
    checkNoExist,
    addVehicle,
    editVehicle,
    deleteVehicle,
    getAvailableVehicle,
    getOrderSummary,
    getOrderPresent,
    getVehiclesPosition
};
