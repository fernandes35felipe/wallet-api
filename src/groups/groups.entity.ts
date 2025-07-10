import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('groups')
export class Groups {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column({ unique: true })
  tagname: string;

  @Column()
  descricao: string;
  id: any;
}
