import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Group} from "./group.model";
import {Tag} from "./tag.model";
import {Member} from "./member.model";
import {BoardResponse} from "groupo-shared-service/apiutils/messages";

@Entity("board")
export class Board {
    @PrimaryGeneratedColumn("uuid", {name: "board_id"}) boardID: string;

    @Column({length: 255, name: "owner"}) owner: string;
    @Column({length: 255, name: "name"}) name: string;

    @OneToMany(() => Group, group => group.board, {cascade: true})
    groups: Promise<Group[]>;

    @OneToMany(() => Tag, tag => tag.board, {cascade: true, eager: true})
    tags: Promise<Tag[]>;

    @OneToMany(() => Member, member => member.board, {cascade: true})
    members: Promise<Member[]>;

    @CreateDateColumn({
        name: "created_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    public createdAt: Date;

    @UpdateDateColumn({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        onUpdate: "CURRENT_TIMESTAMP(6)",
    })
    public updatedAt: Date;

    constructor(owner: string, name: string) {
        this.owner = owner;
        this.name = name;
    }

    async getGroups(): Promise<Group[]> {
        return (await this.groups).map(group => {
            group.board = this;
            return group;
        })
    }

    async getMembers(): Promise<Member[]> {
        return (await this.members).map(member => {
            member.board = this;
            return member;
        });
    }

    async response(isAssign: boolean = false): Promise<BoardResponse> {
        const groups = Promise.all((await this.getGroups()).map(async group => await group.response()));
        const members = Promise.all((await this.getMembers()).map(async member => await member.response()));

        return {
            boardID: this.boardID,
            isAssign,
            members: await members,
            name: this.name,
            owner: this.owner,
            groups: await groups,
        };
    }
}
