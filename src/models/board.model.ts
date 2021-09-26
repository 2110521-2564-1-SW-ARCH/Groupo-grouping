import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Group} from "./group.model";
import {Tag} from "./tag.model";
import {Member} from "./member.model";

@Entity("board")
export class Board {
    @PrimaryGeneratedColumn("uuid", {name: "board_id"}) boardID: string;

    @Column({length: 255, name: "owner"}) owner: string;
    @Column({length: 255, name: "name"}) name: string;
    @Column("int", {name: "total_group"}) totalGroup: number;

    @OneToMany(() => Group, group => group.board, {cascade: true, eager: true})
    groups: Group[];

    @OneToMany(() => Tag, tag => tag.board, {cascade: true, eager: true})
    tags: Tag[];

    @OneToMany(() => Member, member => member.board, {cascade: true, eager: true})
    members: Member[];

    constructor(owner: string, name: string, totalGroup: number) {
        this.owner = owner;
        this.name = name;
        this.totalGroup = totalGroup;
    }
}
