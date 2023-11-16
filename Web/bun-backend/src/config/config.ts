export default {
    jwtExpiresTime: '1h',
    jwtSecret: "@QEGTUI",
    middle_val: {
        userInfor: <string>'user_infor',
        projectInfor: <string>'project_infor'
    }
};

export type UserJWT = {
    email: string;
    password: string;
}

export type ProjectJWT = {
    email: string;
    projectId: string;
}