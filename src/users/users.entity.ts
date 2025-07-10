import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('users')
export class Users {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true, nullable: true })
  phone: string;
  id: any;
}
