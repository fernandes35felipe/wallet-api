import { Entries } from "src/entries/entries.entity";
import { Expenses } from "src/expenses/expenses.entity";
import { Double, Entity, PrimaryGeneratedColumn,Column,JoinTable,ManyToMany, OneToMany, Unique } from "typeorm";

@Entity('users')
export class Users{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;
    
    @Column()
    password: string;
    
    @Column()
    phone: string;

    @OneToMany(() => Entries, (entry) => entry.id, {
		cascade: true,
	})
	@JoinTable()
	entry: Entries;


  @OneToMany(() => Expenses, (expense) => expense.id, {
		cascade: true,
	})
	@JoinTable()
	expense: Expenses;
}
