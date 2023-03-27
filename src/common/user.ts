export const isAdmin = () => {
    let data = localStorage.getItem("userInfo");
    if (data && JSON.parse(data as string).username) {
        return JSON.parse(data as string).role === 1;
    }
    return false;
};

export const getUserInfo = () => {
    let data = localStorage.getItem("userInfo");
    return data;
};
