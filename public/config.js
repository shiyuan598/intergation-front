const baseUrl = "http://127.0.0.1:9002";
window.globalConfig = Object.freeze({
    api: baseUrl + "/api",
    jenkins: {
        job_api: "interface_integration",
        job_app: "app_release_integration",
        job_app_dev: "app_dev_integration"
    },
    artifactory: {
        path_api: "interface_integration",
        path_app: "app_release_integration",
        path_app_dev: "app_dev_integration"
    }
});
