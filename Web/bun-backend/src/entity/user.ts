export enum ROLES {
    ADMIN = 'admin',
    USER = 'user',
}

export class User {
    email:     string;
    name:      string;
    password:  string;
    createdAt: Date;
    role:      string;

    constructor({email, name = "", password = "", createdAt = new Date(), role = ROLES.USER}
    : {email: string, name?: string, password: string, createdAt?: Date, role: string}){
        this.email = email;
        this.name = name;
        this.password = password;
        this.createdAt = createdAt;
        this.role = Object.keys(ROLES).includes(role) ? role : ROLES['USER'];
        this.hashPassword();
    }

    hashPassword() {
        this.password = Bun.password.hashSync(this.password, {
            algorithm: "bcrypt",
            cost: 8,
        });
    }

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
        return Bun.password.verifySync(unencryptedPassword, this.password);
    }
}

