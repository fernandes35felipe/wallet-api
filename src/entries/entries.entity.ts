import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('entries')
export class Entries {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('double')
  value: number;

  @Column({ nullable: true })
  date: string;

  @Column()
  recurrent: string;

  @Column()
  recurrence_time: number;

  @Column()
  font: string;

  @Column()
  user_id: ObjectId;

  @Column({ nullable: true })
  group_id: ObjectId | null;
}
