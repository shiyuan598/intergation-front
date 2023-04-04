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

function getGitBranchesTagsOfMultiProjects(projects = "[]") {
    return get("/gitlab/multiple/branch_tag", {
        projects
    });
}

function jenkinsBuildJob(values: { [propName: string]: string | number }) {
    return post("/jenkins/build_job", values);
}

function jenkinsBuildInfo(values: { [propName: string]: string | number }) {
    return post("/jenkins/build_info", values);
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getGitBranches,
    getGitTags,
    getGitBranchesTagsOfMultiProjects,
    jenkinsBuildJob,
    jenkinsBuildInfo
};
