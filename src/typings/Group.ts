import IUser from './User';



export default interface IGroup {
  id: string;
  users: IUser[];
}