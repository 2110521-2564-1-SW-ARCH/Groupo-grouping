import {Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Board} from "./board.model";
import {Member} from "./member.model";

@Entity("group")
export class Group {
    @PrimaryGeneratedColumn("uuid", {name: "group_id"}) groupID: string;

    @ManyToOne(() => Board, board => board.groups, { eager: true })
    @JoinColumn({name: "board_id"})
    board: Board;

    @OneToMany(() => Member, member => member.group)
    members: Member[];

    @Column({length: 255, name: "name", default: "New Group"}) name: string;
    @Column("text", {nullable: true}) description: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;
    
    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    constructor(board: Board, name: string, description: string | null = null) {
        this.board = board;
        this.name = name;
        this.description = description;
    }
}
