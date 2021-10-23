import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Group} from "./group.model";
import {Tag} from "./tag.model";
import {Member} from "./member.model";

export interface BoardQueryResult {
    board_id: string;
    owner: string;
    name: string;
    is_assign: "0" | "1";
    group_id: string;
    group_name: string;
    group_description: string | null;
    updated_at: Date;
}

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
}
