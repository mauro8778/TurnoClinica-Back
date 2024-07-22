"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const typeorm_1 = require("typeorm");
const credential_1 = require("./credential");
const appoiments_1 = require("./appoiments");
let user = class user {
};
exports.user = user;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], user.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        length: 100
    }),
    __metadata("design:type", String)
], user.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], user.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], user.prototype, "birthdate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], user.prototype, "nDni", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => credential_1.credential),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", credential_1.credential)
], user.prototype, "credential", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => appoiments_1.appoiments, (appoiments) => appoiments.user),
    __metadata("design:type", Array)
], user.prototype, "appoiments", void 0);
exports.user = user = __decorate([
    (0, typeorm_1.Entity)({
        name: "users"
    })
], user);
