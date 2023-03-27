import { get } from "./fetchTool";

function getCarInfo(pageNo: number, name?: string) {
    if (name) {
        return get("/version/carinfo/list", {
            pageNo,
            name: encodeURIComponent(name)
        });
    } else {
        return get("/version/carinfo/list", {
            pageNo
        });
    }
}

function getCarInfoHistory(carId: string) {
    return get("/version/carinfo/history", {
        car_id: carId
    });
}

function getCarInfoHistoryDetail(carId: string, timestamp: number) {
    return get("/version/carinfo/history/detail", {
        car_id: carId,
        timestamp
    });
}

function getCameraInfo(carId: string) {
    return get("/version/camera/info", {
        car_id: carId
    });
}

function getCamera(carId: string, timestamp: number) {
    return get(
        "/version/camera/data",
        {
            car_id: carId,
            timestamp
        },
        true
    );
}

function getCameraNew(carId: string, id: number) {
    return get(
        "/version/camera/new",
        {
            car_id: carId,
            id
        },
        true
    );
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getCarInfo,
    getCarInfoHistory,
    getCarInfoHistoryDetail,
    getCameraInfo,
    getCamera,
    getCameraNew
};
