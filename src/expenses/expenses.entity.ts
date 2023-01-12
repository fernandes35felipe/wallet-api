import { Users } from "src/users/users.entity";
import { Double, Entity, PrimaryGeneratedColumn,Column,JoinTable,ManyToMany, JoinColumn, OneToOne } from "typeorm";

@Entity('expenses')
export class Expenses {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string

    @Column("decimal", {scale: 2})
    value: Number
    
    @Column({nullable: true, type: 'date'})
    date: string

    @Column()
    recurrent: string

    @Column()
    recurrence_time: number

    @Column()
    font: string

    @JoinColumn({name: 'user_id'})
    @OneToOne(()=>Users, (users)=>users.id)
    user: number
}
