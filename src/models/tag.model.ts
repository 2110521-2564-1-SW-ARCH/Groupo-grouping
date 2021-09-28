import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Board} from "./board.model";

@Entity("tag")
export class Tag {
    @PrimaryGeneratedColumn("uuid", {name: "tag_id"}) tagID: string;

    @Column({length: 255, name: "name"}) name: string;
    @Column({length: 255, name: "value"}) value: string;

    @ManyToOne(() => Board, board => board.tags)
    @JoinColumn({name: "board_id"})
    board: Board;

    constructor(name: string, value: string, board: Board) {
        this.name = name;
        this.value = value;
        this.board = board;
    }
}
