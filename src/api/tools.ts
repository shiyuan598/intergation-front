import { get, post } from "./fetchTool";

function getGitBranches(project_name_with_namespace = "") {
    return get("/gitlab/branch", {
        project_name_with_namespace
    });
}

function getGitTags(project_name_with_namespace = "") {
    return get("/gitlab/tag", {
        project_name_with_namespace
    });
}

function multiGetBranchesTags(projects = "", cache=true) {
    return get("/gitlab/multiple/branch_tag", {
        projects,
        cache
    });
}

function jenkinsBuildJob(values: { [propName: string]: string | number | object }) {
    return post("/jenkins/build_job", values);
}

function jenkinsBuildInfo(values: { [propName: string]: string | number }) {
    return post("/jenkins/build_info", values);
}

function getArtifactFiles(path: string) {
    return get("/artifacts/files", {
        path: !path ? "" : path
    });
}

function getArtifactFolders(path: string) {
    return get("/artifacts/folders", {
        path: !path ? "" : path
    });
}

function getArtifactUri(path: string) {
    return get("/artifacts/uri", {
        path: !path ? "" : path
    });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getGitBranches,
    getGitTags,
    multiGetBranchesTags,
    jenkinsBuildJob,
    jenkinsBuildInfo,
    getArtifactFiles,
    getArtifactFolders,
    getArtifactUri
};
